#!/usr/bin/env bash
# Server-side deploy, invoked ONLY through the SSH forced-command pinned in the
# deploy user's authorized_keys. The client cannot run an arbitrary command:
# whatever it asks for arrives in $SSH_ORIGINAL_COMMAND and is validated here
# against a strict allowlist before anything runs.
#
#   authorized_keys line (see setup-deploy-user.sh):
#     command="/opt/bookyourslot/deploy/production/remote-deploy.sh",restrict \
#     ssh-ed25519 AAAA...
#
# Accepted commands:  deploy <tag>   |   rollback <tag>
#   <tag> = "latest" or "sha-<7-40 hex>"
#
# Rollback reverts the running IMAGE only. It does NOT revert the database — a
# forward schema migration is not undone (see § "Database safety" in
# docs/DEPLOYMENT-AUTOMATION.md). Ship backward-compatible migrations.
set -euo pipefail

APP_DIR="/opt/bookyourslot/deploy/production"
SERVICE="bookyourslot"
HEALTH_TIMEOUT=180 # seconds for the NEW container to answer before auto-rollback
BACKUP_DIR="/opt/bookyourslot/backups"
BACKUP_KEEP=7
LOCKFILE="/tmp/bys-deploy.lock"
COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.registry.yml)

log() { echo "[deploy $(date -u +%FT%TZ)] $*"; }
fail() {
  log "ERROR: $*"
  exit 1
}

# --- Serialize: never let two deploys (e.g. a manual one + the pipeline) overlap
exec 9>"$LOCKFILE"
flock -n 9 || fail "another deploy is already running"

# --- Require Compose v2: v1 (python) honours pull_policy/build defaults
#     differently and could BUILD on this box instead of pulling.
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required"

# --- Parse and validate the requested action (injection-safe) ----------------
CMD="${SSH_ORIGINAL_COMMAND:-}"
# shellcheck disable=SC2162
read ACTION TAG REST <<<"$CMD"
[ -z "${REST:-}" ] || fail "unexpected extra arguments"
case "${ACTION:-}" in
  deploy | rollback) ;;
  *) fail "unknown action '${ACTION:-}' (allowed: deploy, rollback)" ;;
esac
[[ "${TAG:-}" =~ ^(latest|sha-[0-9a-f]{7,40})$ ]] || fail "invalid tag '${TAG:-}'"

cd "$APP_DIR"

# --- Record the currently-running tag so we can roll back --------------------
PREV_TAG="$(grep -E '^IMAGE_TAG=' .env 2>/dev/null | cut -d= -f2- || true)"
PREV_TAG="${PREV_TAG:-latest}"
log "requested ${ACTION} ${TAG} (current: ${PREV_TAG})"

SNAP="" # set by backup_db; referenced in failure messages for manual restore

set_tag() { # persist IMAGE_TAG in .env — only ever called with a HEALTHY tag
  local t="$1"
  if grep -qE '^IMAGE_TAG=' .env; then
    sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=${t}|" .env
  else
    printf 'IMAGE_TAG=%s\n' "$t" >>.env
  fi
}

backup_db() {
  command -v gzip >/dev/null || {
    log "WARN: gzip missing, skipping backup"
    return 0
  }
  "${COMPOSE[@]}" ps database 2>/dev/null | grep -q 'running\|Up' || {
    log "WARN: database not running, skipping backup"
    return 0
  }
  mkdir -p "$BACKUP_DIR"
  local snap="$BACKUP_DIR/pre-deploy-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
  log "backing up database -> ${snap}"
  # Read POSTGRES_* from the DB container's own env — avoids sourcing the host
  # .env (which holds JSON values like GOOGLE_API_CREDENTIALS that break source).
  if "${COMPOSE[@]}" exec -T database \
    sh -c 'exec pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip >"$snap"; then
    SNAP="$snap"
    ls -1t "$BACKUP_DIR"/pre-deploy-*.sql.gz 2>/dev/null | tail -n +"$((BACKUP_KEEP + 1))" | xargs -r rm -f
  else
    rm -f "$snap"
    log "WARN: backup failed, continuing"
  fi
}

start_tag() { # pull + run a tag. Does NOT persist it — set_tag runs post-health.
  local t="$1"
  log "pulling ${SERVICE}:${t}"
  IMAGE_TAG="$t" "${COMPOSE[@]}" pull "$SERVICE"
  log "starting stack on ${t}"
  IMAGE_TAG="$t" "${COMPOSE[@]}" up -d
}

health_ok() {
  # Probe the NEW container directly (bypasses DNS/Traefik/cert, and tests the
  # freshly-started container rather than an old one Traefik may still route to).
  # With migrations fatal in start.sh, a bad release crash-loops and never
  # answers here, so this gate reliably trips the rollback.
  local deadline=$(($(date +%s) + HEALTH_TIMEOUT))
  while [ "$(date +%s)" -lt "$deadline" ]; do
    if "${COMPOSE[@]}" exec -T "$SERVICE" wget -q -O /dev/null http://localhost:3000 2>/dev/null; then
      return 0
    fi
    sleep 5
  done
  return 1
}

# --- Deploy ------------------------------------------------------------------
backup_db
start_tag "$TAG"

if health_ok; then
  set_tag "$TAG" # persist only the health-verified tag
  log "healthy on ${TAG}"
  docker image prune -f >/dev/null 2>&1 || true
  log "done"
  exit 0
fi

log "UNHEALTHY on ${TAG} after ${HEALTH_TIMEOUT}s"

# No trustworthy rollback target: 'latest' is a moving pointer the build just
# repointed at this same (bad) release, and rolling back to the same tag is a
# no-op. Leave the new container running and hand off for a decision.
if [ "$PREV_TAG" = "latest" ] || [ "$PREV_TAG" = "$TAG" ]; then
  fail "no reliable previous image to roll back to (prev='${PREV_TAG}'). Investigate: ${COMPOSE[*]} logs ${SERVICE}. Pre-deploy DB snapshot: ${SNAP:-none}"
fi

log "rolling back to ${PREV_TAG} (image only — database is NOT reverted)"
start_tag "$PREV_TAG"
if health_ok; then
  set_tag "$PREV_TAG"
  fail "deploy of ${TAG} failed; rolled back to ${PREV_TAG}. NOTE: the database was NOT reverted — if this release changed the schema, restore the pre-deploy snapshot manually: ${SNAP:-none}"
else
  fail "deploy of ${TAG} failed AND rollback to ${PREV_TAG} is unhealthy — manual intervention needed. Pre-deploy DB snapshot: ${SNAP:-none}"
fi
