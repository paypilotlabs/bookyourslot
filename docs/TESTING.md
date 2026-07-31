# Testing BookYourSlot

Two environments, same tests. Run **Part A** on your Mac before every push, and
**Part B** on the VPS after every deploy. Each test says what to do and what
"passing" looks like, so nothing is left to interpretation.

- Local base URL: `http://localhost:3000`
- Production base URL: `https://bookyourslot.online`

---

## Part A · Local

### A0. Start from a known state

```bash
cd ~/bookyourslot
docker start prisma-postgres-1          # Postgres on port 5450
yarn                                     # only after pulling dependency changes
yarn workspace @calcom/prisma db-migrate # applies any new migrations
yarn dev                                 # http://localhost:3000
```

Pass: the terminal reaches `Ready`, and `http://localhost:3000` shows the
landing page.

Seed demo data (local only, never on the VPS):

```bash
yarn db-seed     # creates pro@example.com / pro and free@example.com / free
```

### A1. Automated gates (run before every push)

```bash
yarn type-check:ci --force        # TypeScript across the monorepo
yarn biome check --write .        # format + lint, writes fixes
TZ=UTC yarn test                  # unit tests
```

Pass: type-check exits 0; biome reports no errors (warnings are fine); tests green.

### A2. Public marketing pages

Visit each and confirm it renders with the navy nav and Manoyri wordmark:

`/` · `/how-it-works` · `/blog` · one blog post · `/about` · `/contact` ·
`/terms` · `/privacy`

Then check the machine-readable trio responds:

```bash
curl -s -o /dev/null -w "%{http_code} sitemap\n" localhost:3000/sitemap.xml
curl -s -o /dev/null -w "%{http_code} robots\n"  localhost:3000/robots.txt
curl -s -o /dev/null -w "%{http_code} llms\n"    localhost:3000/llms.txt
```

Pass: three `200`s. Switch your Mac between Light and Dark appearance and
reload `/`: the page follows it (cream by day, deep navy by night) while the
hero, features, and FAQ blocks keep their brand colors.

### A3. Guest booking flow (the client side)

1. Open `http://localhost:3000/pro/30min` in a private window.
2. Confirm the month calendar shows bookable days and a slot rail.
3. Change the time zone selector and confirm the slot times shift.
4. Pick a slot, fill name and email, book.

Pass: the confirmation screen appears with reschedule and cancel links, and the
booking exists in the owner's Bookings list.

Also test the two exits: click **Reschedule** (pick a new slot, confirm the
booking moves) and **Cancel** (confirm it disappears from upcoming).

### A4. Owner surfaces

Sign in as `pro@example.com` / `pro`, then check each:

| Screen | Pass condition |
| --- | --- |
| Event types | List renders; opening one shows its tabs |
| Availability | Schedule opens; hours are editable and save |
| Calendar | Week grid draws; bookings sit at the right hours; pills filter; clicking a block opens the booking |
| Bookings | Today/Next groups; Unconfirmed / Past / Cancelled tabs load |
| Apps → Installed | Calendar and Conferencing pages load |

### A5. Live refresh (the "nothing goes unnoticed" test)

1. Sign in and leave **Calendar** open on this week.
2. In another terminal, create a booking behind its back:

```bash
PGPASSWORD='' psql -h localhost -p 5450 -U postgres -d calendso -c \
"INSERT INTO \"Booking\" (uid, \"userId\", \"eventTypeId\", title, \"startTime\", \"endTime\", status, \"createdAt\", \"updatedAt\", description, \"customInputs\", responses, location, paid)
 SELECT 'livetest-' || floor(random()*1000000)::text, \"userId\", \"eventTypeId\", 'Live test booking',
        NOW() + interval '3 hour', NOW() + interval '3 hour 30 minutes', 'accepted', NOW(), NOW(),
        description, \"customInputs\", responses, location, paid
 FROM \"Booking\" WHERE \"userId\" = (SELECT id FROM users WHERE username='pro') AND status='accepted' LIMIT 1;"
```

3. Do not touch the browser.

Pass: within ~30 seconds the block appears on the grid and a toast reads
"New booking: Live test booking, …". Clean up afterwards:

```bash
PGPASSWORD='' psql -h localhost -p 5450 -U postgres -d calendso -c \
"DELETE FROM \"Booking\" WHERE uid LIKE 'livetest-%';"
```

### A6. Every setting opens

Walk the settings tree and confirm each page loads and saves:

- My account: Profile · General · Calendars · Conferencing · Appearance ·
  Out of office · Push notifications
- Security: Password · Two-factor authentication
- Developer: Webhooks · API keys · OAuth

Pass: 12/12 load. Changing the **Appearance → Dashboard theme** to Light, Dark,
and System each takes effect immediately.

### A7. Email (local)

Local SMTP points at MailHog by default. Either run MailHog
(`docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog`, inbox at
`http://localhost:8025`) or accept that mail is skipped locally and verify it
on the VPS instead (B5), which is the environment that matters.

### A8. Google sign-in (once you have keys)

Put the client JSON in `.env` as `GOOGLE_API_CREDENTIALS`, set
`GOOGLE_LOGIN_ENABLED=true`, restart `yarn dev`, then:

```bash
curl -s localhost:3000/api/auth/providers | python3 -m json.tool | grep -i google
```

Pass: a `google` provider is listed, the **Sign in with Google** button shows on
`/auth/login` and `/signup`, and clicking it reaches a real Google consent
screen. For local testing add
`http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
in the same Google client.

---

## Part B · VPS (after every deploy)

Run these against `https://bookyourslot.online` once `./deploy.sh` finishes.

### B1. The stack is up

```bash
cd /opt/bookyourslot/deploy/production
docker compose ps                          # database + bookyourslot both Up
docker compose logs --tail=40 bookyourslot   # migrations ran, server ready, no errors
```

### B2. TLS and routing

```bash
curl -sI https://bookyourslot.online | head -3          # 200, valid cert
curl -sI https://www.bookyourslot.online | head -3      # 200, same app as apex
```

Then open the site and confirm the landing page renders with fonts and images.

### B3. Marketing + SEO surfaces

```bash
for p in / /how-it-works /blog /about /contact /terms /privacy /sitemap.xml /robots.txt /llms.txt /og-image.png; do
  printf "%s  %s\n" "$(curl -s -o /dev/null -w '%{http_code}' https://bookyourslot.online$p)" "$p"
done
```

Pass: every line reads `200`.

### B4. The booking round trip (the one that matters)

1. From a private window, open the public booking page of any approved account,
   `https://bookyourslot.online/<username>/<event-slug>`.
2. Book a slot using an **external** email you can actually read (Gmail etc.).
3. Sign in as the owner in another window and confirm the booking is listed.
4. Reschedule from the guest's confirmation email, then cancel it.

Pass: each step produces the expected email and the owner's Calendar reflects
every change.

### B5. Email deliverability

Pass: guest confirmation, owner notification, reschedule, and cancellation
emails all arrive from `hello@bookyourslot.online`, and none land in spam.
If nothing arrives:

```bash
docker compose logs bookyourslot | grep -i -E "mail|smtp" | tail -20
```

Usual cause: a wrong `EMAIL_SERVER_PASSWORD`.

### B6. Live refresh in production

Leave the owner's Calendar open on one device, book from a phone on mobile
data. Pass: the booking appears with its toast within ~30 seconds, untouched.

### B7. Google sign-in and Calendar sync

Pass: the Google button appears on `/auth/login`, a full sign-in round-trips
back to the dashboard, connecting Google Calendar in Settings → Apps succeeds,
and a fresh test booking appears on that Google Calendar.

### B8. Apple Calendar

Pass: Settings → Apps → Apple Calendar accepts an app-specific password from
appleid.apple.com and syncs busy times.

### B9. After the smoke test

- Submit `https://bookyourslot.online/sitemap.xml` in Google Search Console.
- Confirm the nightly `pg_dump` cron wrote a file to `/root/backups/`.

---

## Quick reference

| Situation | Command |
| --- | --- |
| Restart the app only | `docker compose up -d bookyourslot` |
| Follow logs | `docker compose logs -f bookyourslot` |
| Deploy latest main | `cd /opt/bookyourslot/deploy/production && ./deploy.sh` |
| Database shell | `docker compose exec database psql -U bookyourslot bookyourslot` |
| Manual backup | `docker compose exec -T database pg_dump -U bookyourslot bookyourslot \| gzip > backup.sql.gz` |

## Known-absent features (do not test, do not claim)

Shared team pages and round-robin, reminder workflows, video conferencing,
payments, and admin impersonation are **not** part of this edition. Their
routes 404 or 500 by design. See the roadmap table in
[deploy/production/CHECKLIST.md](../deploy/production/CHECKLIST.md).
