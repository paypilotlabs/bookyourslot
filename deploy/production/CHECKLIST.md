# BookYourSlot launch checklist

Work through this top to bottom. Every unchecked box before "Go-live smoke
test" blocks launch; everything under "After launch" can follow at its own
pace. The [README](README.md) holds the detailed commands for each step,
[docs/TESTING.md](../../docs/TESTING.md) holds the test procedures for both
local and VPS, and [docs/GITHUB.md](../../docs/GITHUB.md) holds the repository
policies.

## 1. Infrastructure

- [x] 8 GB VPS purchased (Ubuntu 22.04/24.04), SSH access works
- [x] DNS: `A @ -> VPS IP` and `CNAME www -> bookyourslot.online`
- [x] Docker Engine + compose plugin installed (`curl -fsSL https://get.docker.com | sh`)
- [x] Only 22/80/443 reachable from the internet — verified by port scan
  - NOTE: this is Hostinger's edge firewall, **not** `ufw`. `ufw status` on the host
    reports `inactive`. Do not assume a host firewall exists.
- [x] 4 GB swapfile active (build headroom)
- [x] SSH hardened: `PasswordAuthentication no`, `PermitRootLogin prohibit-password`
  - Set in `/etc/ssh/sshd_config.d/00-hardening.conf`, which must sort **before**
    `50-cloud-init.conf` — Hostinger's cloud-init sets `PasswordAuthentication yes`
    and OpenSSH takes the first value. Verified externally: the server offers
    `publickey` only. Before this, 259 of 438 failed logins in 7 days targeted root.
- [x] Unattended security upgrades enabled



## 2. Code + configuration

- [x] Repo cloned to `/opt/bookyourslot`
- [x] Brand web font copied (gitignored): `scp apps/web/public/fonts/brand/*.otf root@VPS:/opt/bookyourslot/apps/web/public/fonts/brand/`
- [x] `deploy/production/.env` created from `.env.production.example`
- [x] Fresh `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- [x] Fresh `CALENDSO_ENCRYPTION_KEY` (`openssl rand -base64 24`) — never rotate after go-live
- [x] Strong `POSTGRES_PASSWORD`; `DATABASE_URL`/`DATABASE_DIRECT_URL` match it
- [x] `ORGANIZATIONS_ENABLED` left empty



## 3. First deploy

- [x] `docker compose build bookyourslot` completes (20-40 min first time)
- [x] `docker compose up -d`; `docker compose logs -f bookyourslot` shows migrations then ready
- [x] `https://bookyourslot.online` loads with valid TLS; `www.` redirects to apex



## 4. Accounts

- [x] Admin created via `https://bookyourslot.online/auth/login` -> auto-redirect to `/auth/setup`
- [x] `demo` user exists but is **deliberately not seeded** — `/demo` renders
  "demo has not setup any event types", and `/demo/30min` 404s
  - The landing hero CTA that pointed at it was removed, and the hero screenshot's
    address bar now links to `/startwithleo`, a real bookable page. Nothing in the
    product links to `/demo` any more. Do not re-add a demo link without seeding it.
- [x] Never run `yarn db-seed` in production



## 5. Email (Hostinger SMTP)

- [x] `EMAIL_SERVER_*` filled (smtp.hostinger.com:465, [hello@bookyourslot.online](mailto:hello@bookyourslot.online))
- [x] Booked the demo event from a private window with an external address
- [x] Both confirmation emails arrived (guest + owner)
- [x] SPF present: `v=spf1 include:_spf.mail.hostinger.com ~all`
- [x] DKIM enabled in hPanel and published — `hostingermail1._domainkey` returns `v=DKIM1`
- [x] **Proven on a real message**, not just in DNS: Gmail "Show original" reports
  `SPF PASS`, `DKIM PASS`, `DMARC PASS`, with `d=bookyourslot.online` (aligned, not
  `d=hostinger.com`). Inbox in 4 seconds.
- [x] DMARC reporting on: `v=DMARC1; p=none; rua=mailto:hello@bookyourslot.online; fo=1`
- [ ] DMARC enforcement ramp: `p=none` -> `p=quarantine` -> `p=reject`, a week apart,
  re-checking `dig +short TXT _dmarc.bookyourslot.online` at each step
- [ ] Deliverability to a NON-Gmail address (Outlook/Yahoo) — all testing so far was Gmail



## 6. Sign-in with Google + Google Calendar (one OAuth client for both)

- [x] Google Cloud project created, **Google Calendar API** enabled
- [x] OAuth consent screen: External, app BookYourSlot, publishing status **In production**
  - In production matters: a "Testing" app expires refresh tokens after 7 days, which
    would break calendar sync on a weekly cycle with no error logged.
- [x] OAuth client (Web application) with BOTH redirect URIs:
  - [x] `https://bookyourslot.online/api/auth/callback/google`
  - [x] `https://bookyourslot.online/api/integrations/googlecalendar/callback`
- [x] Client JSON in `GOOGLE_API_CREDENTIALS` (one line) in `.env`
- [x] `GOOGLE_LOGIN_ENABLED=true` in `.env`
- [x] Google Calendar and Google Meet apps enabled (`App.enabled = true` for both)
- [x] Declared scopes match what the app actually requests
  - The app requests `calendar.events` + `calendar.readonly` + `userinfo.profile`
    (`packages/lib/constants.ts:226-229`). The console originally declared
    `calendar.calendars.readonly` — a different, narrower scope — so `calendar.readonly`
    was undeclared. That mismatch is why verification kept bouncing. Now declared.
- [x] Connecting a Google Calendar works and a booking lands on it
- [ ] Login page Google button round-trips (not yet verified)
- [ ] Sign-up page Google button round-trips (not yet verified)
- [ ] Verification submitted: scope justification filled in, demo video recorded
  - Not blocking. The OAuth user cap is 100 and you are at 1. Unverified only means
    clients see a warning during the Google Calendar connect step.



## 7. Apple Calendar (no API keys needed)

- [ ] Admin -> Settings -> Admin -> Apps -> **Apple Calendar** enabled
- [ ] Verified from a user account: Settings -> Apps -> Apple Calendar -> connect using an
  ```
  app-specific password from appleid.apple.com (iCloud CalDAV)
  ```



## 8. Go-live smoke test

Full procedure: [docs/TESTING.md](../../docs/TESTING.md) Part B.

- [ ] Landing, `/how-it-works`, `/blog`, `/about`, `/contact`, `/terms`, `/privacy` all load (light and dark)
- [x] A real booking page books end to end from a private window (use a live
  username, e.g. `/startwithleo/30min` — **not** `/demo/30min`, which 404s)
- [x] Booking creates a Google Calendar event with a working Meet link
  - Verified in the database, not from the UI: `BookingReference` carries a real
    `uid` and `meetingUrl`, and `Booking.metadata` carries `videoCallUrl`.
- [x] Reschedule **moves the Google event** rather than duplicating it
  - Verified against Google's API directly: same event id, new start time, Meet link
    preserved. This leg fails silently when broken — log only, no UI error — so check
    the event in Google, never just the screen.
- [x] The owner's existing Google Calendar busy time removes slots
  - Proven with an event created directly in Google, never through the app: the
    matching slots disappeared from the public page and returned when it was deleted.
- [x] Reschedule + cancel emails behave
- [ ] `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/og-image.png` respond
- [ ] Sign-in works with email + password and with Google



## 9. After launch

- [ ] Google Search Console verified; sitemap submitted; indexing requested for `/` and each blog post
- [ ] Bing Webmaster Tools imported from Search Console
- [ ] Rich Results Test passes on `/` (FAQPage, SoftwareApplication) and one post (BlogPosting)
- [ ] Nightly `pg_dump` cron (command in README) — **deliberately deferred**
  - Snapshots already run on every deploy and are kept 7 deep. At 4 users the data
    barely moves between deploys. Revisit the first week real customers book, when
    deploy cadence and data cadence come apart.
- [x] Pre-deploy snapshots are `chmod 600` — they contain every attendee email in
  plaintext, and the deploy script now enforces it on new ones
- [ ] **Copy `deploy/production/.env` into a password manager** — still outstanding,
  and the only genuinely unrecoverable item anywhere on this list
  - `CALENDSO_ENCRYPTION_KEY` decrypts the `Credential` rows and can never be rotated.
    Every backup restores into an unusable state on a fresh box without it. Use
    `scp`, not `cat`, so it never renders on screen — then delete the local copy.
- [ ] Get one copy of the dumps offsite (check Hostinger VPS snapshots first — one
  click, and it covers a dead disk for free)
- [ ] Restore a dump into a scratch database once. An untested backup is a belief
- [x] Off-box uptime monitoring: hourly GitHub Actions check on a real booking page,
  alerting to the existing Telegram bot. Alert path fired end to end and delivered
- [ ] Decide open vs invite-only signup



## 10. Security posture (added after the 31 Aug audit)

- [x] Root SSH password login closed (section 1)
- [x] Postgres bound to the Tailscale address only, not reachable publicly
- [x] Traefik per-source-IP rate limits on the auth, booking and username paths
- [x] `/api/trpc/auth/` rate limited — `sendVerifyEmailCode` is a public procedure that
  mails an arbitrary address, and nothing else throttled it. Uses `PathPrefix`, not
  `Path`: tRPC batches procedures into the URL and would walk past an exact match
- [x] Login returns one generic error for unknown address, wrong password, pending
  approval and social-only accounts, with a constant-work bcrypt compare so response
  time does not distinguish them either
- [x] `/privacy` no longer claims connection tokens are encrypted — they are not.
  `encryptedKey` is NULL on every `Credential` row and the key is plaintext JSON
- [ ] Encrypt `Credential.key` for real — do this before anyone other than the owner
  connects a calendar. With the key on the same host as the database it defends a
  leaked backup, not a compromised host
- [ ] Remove `displayDebug={true}` from `BookingPageErrorBoundary.tsx` — a client-side
  render error on a public booking page shows a stack trace and a
  `mailto:support@cal.com` button to whoever is trying to book
- [ ] Hostinger agent dashboard answers on `:32768` over cleartext HTTP. Vendor-managed
  and rate-limited, so low risk, but it does not belong on the public internet



## 11. Standing checks (run after every deploy)

The calendar outage ran for days with **no error logged anywhere**, because the
Google key lookup throws outside the calendar service's try block and the result was
swallowed. It was only ever visible in the database. These are the cheap guards.

```sql
-- Bookings that got a confirmation email but never reached a calendar.
-- Should be 3 (the historical failures). Anything higher is new damage.
SELECT count(*) FROM "BookingReference"
WHERE type = 'google_calendar' AND (uid = '' OR uid IS NULL);
```

```sql
-- The kill switch. enabled = true means ALL email is silently dropped.
-- Inverted semantics: this must stay false.
SELECT slug, enabled FROM "Feature" WHERE slug IN ('emails', 'email-verification');
```

- [ ] Save both as `scripts/console.sql` so they are one command, not a memory test

**After any change to `deploy/`**: the host checkout at `/opt/bookyourslot` is never
updated automatically. `docker-compose.yml` and `remote-deploy.sh` are read from that
checkout, not from the image, so a merged change does nothing until you
`git pull --ff-only origin main` on the VPS and redeploy. This has silently swallowed
two separate fixes already.



## Feature roadmap (not yet enabled — never claim these until done)


| Feature                                            | Status                       | What it needs                                                                                     |
| -------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Sign-in with Google                                | Keys in place, round-trip untested | `GOOGLE_LOGIN_ENABLED=true` and the client is configured. Nobody has actually clicked the button through — do that before claiming it |
| Google Calendar sync                               | **Working, verified 31 Aug**  | Create, Meet link, reschedule and busy-time reading all proven against Google's API. Safe to claim — say "bookings land in your Google Calendar", still never "two-way sync" |
| Apple Calendar sync                                | Ready                        | Enable app (section 7)                                                                            |
| Outlook / Microsoft 365                            | **Removed**                  | Calendar app and Microsoft sign-in both deleted; Google, Apple and CalDAV remain                   |
| Google Meet links                                  | **Working, verified 31 Aug**  | Generated on the calendar event. Zoom and built-in video remain unconfigured                       |
| Payments (Stripe)                                  | Unconfigured, never run      | The app exists in the app-store but nobody has executed it once. Do not sell deposits              |
| Reminder workflows (email/SMS/WhatsApp)            | Not in this edition          | `packages/features/ee/workflows/` is absent and `Workflow`/`WorkflowReminder` are not in the schema — there is no scheduler at all. Cheapest route is n8n (already running on the VPS) on a cron against Postgres, **not** porting the subsystem. Never claim reminders until built |
| Owner calendar dashboard                           | Shipped                      | `/calendar` renders week and day views of bookings                                                 |
| Shared team pages / round-robin                    | Not in this edition          | Team routes are stripped from the Cal.diy base (404); needs porting before any team claim         |
| Unique display font                                | Skipped for now              | Drop unique.woff2 into fonts/brand if ever wanted                                                 |
| Organizations / subdomains                         | Deliberately off             | Do not enable on apex domain                                                                      |
| WhatsApp / Telegram                                | Location links only          | Both apps are `linkType: "static"` — they let a host paste a `wa.me` / `t.me` link as the meeting **place**. They send nothing. No Business API, no templates, no messages. Also: `attendeePhoneNumber` is `hidden: true`, so no phone number has ever been collected |
| Admin impersonation                                | Not in this edition          | Route 404s; the command-palette entry was removed                                                 |


