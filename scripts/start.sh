#!/bin/sh
set -x

# Replace the statically built BUILT_NEXT_PUBLIC_WEBAPP_URL with run-time NEXT_PUBLIC_WEBAPP_URL
# NOTE: if these values are the same, this will be skipped.
scripts/replace-placeholder.sh "$BUILT_NEXT_PUBLIC_WEBAPP_URL" "$NEXT_PUBLIC_WEBAPP_URL"

scripts/wait-for-it.sh ${DATABASE_HOST} -- echo "database is up"
# A failed migration must abort the boot, not fall through to `yarn start`.
# Otherwise the app serves against a half-migrated DB, the login page still
# 200s, the deploy health check passes, and a broken release is reported green.
# Crashing here makes the container unhealthy so the deploy auto-rollback fires.
npx prisma migrate deploy --schema /calcom/packages/prisma/schema.prisma || {
  echo "prisma migrate deploy failed — refusing to start" >&2
  exit 1
}
npx ts-node --transpile-only /calcom/scripts/seed-app-store.ts
yarn start
