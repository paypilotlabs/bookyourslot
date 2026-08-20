# Engineering backlog

Work that would make BookYourSlot more reliable, safer, or faster. Distinct from
the **feature roadmap** in [deploy/production/CHECKLIST.md](../deploy/production/CHECKLIST.md),
which tracks integrations and product capabilities.

Every item below was verified against the running system, not assumed. Where
something turned out to be already handled it is listed under
[Already done](#already-done) rather than quietly dropped.

Ordered by what actually bites first.

---

## P1 — Risk of losing data

### 1. There is no scheduled backup

`crontab -l` on the VPS contains no `pg_dump`, and `/root/backups/` is **empty**.
The only backups in existence are 7 pre-deploy snapshots in
`/opt/bookyourslot/backups/`, written by `remote-deploy.sh` when a deploy runs.

That means **your backup age equals your deploy frequency**. Go a quiet month
without shipping and the newest copy of your customers' bookings is a month old.

The corrected cron is already in
[deploy/production/README.md](../deploy/production/README.md); it just needs
installing, and `/root/backups` creating first.

*Effort: 10 minutes.*

### 2. No backup has ever been restored

A backup nobody has restored is a belief, not a recovery plan. Restore the newest
snapshot into a scratch database and confirm the bookings are actually in it.

Note the 7 existing snapshots predate the `--clean --if-exists` change, so they
restore only into an **empty** target.

*Effort: 30 minutes, once.*

### 3. Every backup is on the same disk as the database

`/opt/bookyourslot/backups/` and `/root/backups/` both live on the same volume as
the Postgres data. That survives a bad deploy or a dropped table; it does not
survive the disk. One `rclone`/`scp` line to anywhere off-box closes it.

*Effort: 20 minutes.*

---

## P2 — Would have caught bugs that actually shipped

### 4. CI never builds

`.github/workflows/ci.yml` runs type-check and tests. It does not run
`next build`. That gap let a lint auto-fix add `import process from "node:process"`
to `packages/lib/constants.ts`, which broke the edge-runtime OG route and left
**main unbuildable across three merges** — with CI green the whole time.

Adding a build job catches this class before merge, at roughly +20 minutes per PR.
The alternative is treating a red deploy as "the build broke, look now", which
works only because the Telegram alert fires (`deploy` reports `skipped`).

*Effort: 1 hour. Real trade-off: PR latency.*

### 5. GitHub Actions are pinned to tags, not SHAs

`actions/checkout@v7`, `docker/setup-buildx-action@v4`, `docker/login-action@v4`,
`docker/build-push-action@v7`. Tags are mutable. That job holds the deploy SSH key
and can reach production, so a compromised tag runs arbitrary code with your
credentials. The workflow's own comment already says to pin before relying on it,
and Dependabot is configured to keep pins current.

*Effort: 30 minutes, one time.*

### 6. Branch protection is absent

The repo is private on the free plan, so the GitHub API returns
"Upgrade to GitHub Pro". CI is therefore **advisory**: a red PR can be merged and
`main` can be pushed to directly. Costs a few dollars a month, or accept it and
rely on discipline.

*Effort: minutes, plus a subscription decision.*

---

## P3 — Correctness gaps found by audit

### 7. Duplicate bookings are only blocked for exact matches

`Booking.idempotencyKey` is unique on (startTime, endTime, organizer) and is
enforced by Postgres, so two guests cannot take the identical confirmed slot.
Two cases slip through under concurrency:

- **Overlapping but not identical** — 10:00-10:30 against 10:15-10:45, or two
  durations on a multi-duration event type. Different keys, both insert.
- **Requires-confirmation events** — inserted as `PENDING`, which leaves the key
  `NULL`, and Postgres permits unlimited NULLs in a unique index. **No database
  protection at all.**

Neither bites today. The second becomes real the moment you enable
requires-confirmation on any event type.

*Effort: medium. Needs care — this is the booking path.*

### 8. Login has a timing oracle

Non-existent, locked, and OAuth-only accounts all return before the bcrypt
compare; only a real account with a wrong password pays the cost-12 hash. Response
time therefore distinguishes them, even though the messages are now identical.
Closing it needs a dummy compare against a fixed hash.

Far weaker than the message leak that was already fixed, but real.

*Effort: 1 hour.*

### 9. The booking page runs its data load twice per request

`apps/web/app/(booking-page-wrapper)/[user]/[type]/page.tsx` calls `getData()`
in both `ServerPage` and `generateMetadata`, and `withAppDirSsr` has no
memoisation. Next dedupes `fetch`, not Prisma. This is the highest-traffic path in
the product, doing roughly double the queries it needs.

Fix is React's `cache()` keyed on a primitive — about 12 lines across two files.

*Effort: 1 hour.*

---

## P4 — Cleanup

### 10. `packages/lib/rateLimit.ts` is dead weight

Roughly 120 lines whose only runtime behaviour is returning
`{ success: true, remaining: 999 }`, because `UNKEY_ROOT_KEY` is unset and will
stay unset — rate limiting now lives in Traefik. Every
`checkRateLimitAndThrowError` call in the codebase is a no-op that reads like a
protection.

Worth deleting precisely because it *looks* like a control while being inert.

*Effort: 2 hours, needs care — many call sites.*

### 11. Rotate the Postgres password

It was printed into an assistant transcript while inspecting the resolved compose
config. Postgres is reachable only over the tailnet and the internal Docker
network, never publicly, so this is hygiene rather than an emergency.

Note `POSTGRES_PASSWORD` only applies at first init: an existing volume needs
`ALTER USER ... WITH PASSWORD` inside the container, then `DATABASE_URL` updated
to match, then a restart.

*Effort: 30 minutes, brief downtime.*

### 12. Stale rows in the feature roadmap

`CHECKLIST.md` still lists Google sign-in as "needs keys" (it is live), the Unique
display font as "skipped" (it is serving), and the owner calendar dashboard as
"in progress" (route and view both exist).

*Effort: 10 minutes.*

---

## P5 — Product

### 13. Reminders, via n8n rather than a port

The most-requested capability for this market, and the workflow routes are
stripped from the base. Porting them is large. **n8n reaches the same outcome as
configuration**: BookYourSlot already fires `BOOKING_CREATED` and 18 other
webhook events, and n8n can send the reminder.

See [N8N.md](N8N.md). For WhatsApp specifically the code is easy and Meta's
business verification plus template approval is the real project.

*Effort: hours in n8n, versus weeks to port workflows.*

### 14. Prove the booking round trip on production

Nobody has booked a slot end to end since Google Calendar was connected. Book one
from a private window, confirm both emails arrive, confirm it lands on the
calendar, then reschedule and cancel it.

*Effort: 20 minutes. Highest confidence-per-minute item here.*

### 15. Search Console and Bing

Both unticked. Indexing takes weeks to earn, so the clock only starts once the
sitemap is submitted.

*Effort: 30 minutes.*

---

## Already done

Verified as handled, recorded so they are not re-investigated:

- **Docker log rotation** — `/etc/docker/daemon.json` sets `max-size: 10m`,
  `max-file: 3`. Disk is at 12% of 193G.
- **Rate limiting** — live at Traefik, verified in production including that a
  spoofed client IP does not mint a fresh bucket.
- **Login account enumeration** — wrong password, unknown address and pending
  account now return an identical message.
- **Booking conflicts** — a guest who loses a race is told the slot went, rather
  than shown a database error.
- **`IMAGE_TAG` pinned** in `.env`, so auto-rollback has a real target.
- **Host-local compose overrides** — `docker-compose.override.yml`, picked up by
  `remote-deploy.sh`.

---

## A structural note

The deploy pipeline updates the **image** and `IMAGE_TAG`. It never updates the
**source checkout** on the VPS. Anything read from disk at runtime — compose
files, `remote-deploy.sh`, the fonts directory — only changes when someone runs
`git pull` on the box.

That drift is silent and cumulative: the host once sat six commits behind while
every deploy reported success. The rule worth remembering:

> **App code deploys itself. Anything under `deploy/production/` needs a manual pull.**
