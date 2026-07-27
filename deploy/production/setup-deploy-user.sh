#!/usr/bin/env bash
# One-time VPS setup for CI/CD deploys. Run as root on the VPS.
#
#   sudo bash deploy/production/setup-deploy-user.sh "ssh-ed25519 AAAA...deploy-key"
#
# Creates a non-root `deploy` user that can run Docker but nothing else over SSH:
# the injected public key is pinned to a forced command (remote-deploy.sh), so a
# leaked key can only trigger deploy/rollback — never a shell, port-forward, or
# arbitrary command. See docs/DEPLOYMENT-AUTOMATION.md.
set -euo pipefail

PUBKEY="${1:-}"
DEPLOY_USER="deploy"
APP_DIR="/opt/bookyourslot"
FORCED_CMD="${APP_DIR}/deploy/production/remote-deploy.sh"

[ "$(id -u)" -eq 0 ] || {
  echo "Run as root." >&2
  exit 1
}
[ -n "$PUBKEY" ] || {
  echo "Usage: $0 \"ssh-ed25519 AAAA... deploy@bookyourslot\"" >&2
  exit 1
}
printf '%s' "$PUBKEY" | grep -qE '^(ssh-ed25519|ssh-rsa|ecdsa-) ' || {
  echo "That does not look like an SSH public key." >&2
  exit 1
}

# --- user + docker access ----------------------------------------------------
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash "$DEPLOY_USER"
  echo "Created user ${DEPLOY_USER}."
fi
# Docker group grants container control (root-equivalent by nature) — the forced
# command is what keeps this safe. For stricter isolation, use rootless Docker
# (see the doc's hardening section) instead of this group.
getent group docker >/dev/null || groupadd docker
usermod -aG docker "$DEPLOY_USER"

# --- forced-command authorized_keys -----------------------------------------
SSH_DIR="/home/${DEPLOY_USER}/.ssh"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$SSH_DIR"
AUTH="${SSH_DIR}/authorized_keys"
OPTS='command="'"$FORCED_CMD"'",no-pty,no-port-forwarding,no-x11-forwarding,no-agent-forwarding,restrict'
# Idempotent: drop any prior copy of this exact key, then add the pinned line.
KEY_BODY="$(printf '%s' "$PUBKEY" | awk '{print $2}')"
touch "$AUTH"
grep -vF "$KEY_BODY" "$AUTH" >"${AUTH}.tmp" 2>/dev/null || true
mv "${AUTH}.tmp" "$AUTH"
printf '%s %s\n' "$OPTS" "$PUBKEY" >>"$AUTH"
chmod 600 "$AUTH"
chown "$DEPLOY_USER:$DEPLOY_USER" "$AUTH"
echo "Pinned deploy key to forced command: ${FORCED_CMD}"

# --- app dir ownership + script perms ---------------------------------------
if [ -d "$APP_DIR" ]; then
  chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"
  chmod +x "$FORCED_CMD" 2>/dev/null || true
  echo "Handed ${APP_DIR} to ${DEPLOY_USER}."
else
  echo "NOTE: ${APP_DIR} not found yet — clone the repo there and re-run, or chown it later."
fi

cat <<EOF

Done. Next:
  1. As ${DEPLOY_USER}, log in to GHCR so it can pull the private image:
       sudo -u ${DEPLOY_USER} docker login ghcr.io -u <github-user> --password-stdin <<< "<read:packages PAT>"
  2. Add the matching PRIVATE key + host details to GitHub repo secrets
     (DEPLOY_SSH_KEY, DEPLOY_HOST, DEPLOY_USER=${DEPLOY_USER}, DEPLOY_KNOWN_HOSTS).
  3. Capture this host's SSH fingerprint for DEPLOY_KNOWN_HOSTS:
       ssh-keyscan -t ed25519 <host> 2>/dev/null
  4. Consider closing port 22 to the public internet (Tailscale) — see the doc.
EOF
