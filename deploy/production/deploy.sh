#!/usr/bin/env bash
# Deploy the latest main to production: pull, rebuild the app image, restart.
# Run on the server from deploy/production/. Expect ~10-30s of cutover while
# the new container boots (migrations run automatically in its start script).
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Pulling latest main"
git -C ../.. pull --ff-only

echo "==> Building app image (first build 20-40 min, later builds faster)"
docker compose build bookyourslot

echo "==> Restarting stack"
docker compose up -d

echo "==> Pruning old images"
docker image prune -f

echo "==> Done. Tail logs with: docker compose logs -f bookyourslot"
