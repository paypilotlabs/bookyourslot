# BookYourSlot

**Appointment booking for small businesses**, self-hosted on your own domain at
[bookyourslot.online](https://bookyourslot.online).

Version **3.0.0**. Built on [Cal.com](https://github.com/calcom/cal.com)'s
open-source community edition, then deliberately cut down: 79 integrations
removed, team and enterprise machinery stripped, and signups placed behind admin
approval. What is left is the part a dentist, salon, clinic, or consultant
actually uses.

This is a private commercial product, not an open signup service. New accounts
stay pending until an admin approves them.

## What works today

- **Booking pages.** Every account gets a public page. Guests pick a time and
  book themselves, no account required.
- **Availability and time zones.** Working hours, date overrides, buffers,
  minimum notice, and automatic timezone conversion for the guest.
- **Self-serve reschedule and cancel.** Guests manage their own booking from the
  confirmation email, and the calendar stays correct without you touching it.
- **Google Calendar sync.** Verified end to end on 31 Aug 2026: a booking creates a
  real calendar event with a Google Meet link, a reschedule moves that same event
  rather than duplicating it, and the owner's existing busy times remove slots from
  the public page. Apple Calendar and CalDAV ship but have not been exercised — do
  not claim them until they are.
  Say "bookings land in your Google Calendar". Do not say "two-way sync".
- **Email notifications.** Confirmations, reschedules, and cancellations go out
  automatically over SMTP.
- **Webhooks.** `BOOKING_CREATED`, `BOOKING_RESCHEDULED`, `BOOKING_CANCELLED`
  and more, sent to any URL. This is the supported path for **n8n** automations,
  see [docs/N8N.md](docs/N8N.md).
- **Embeds.** Drop the booking flow into your own site as an inline widget,
  popup, or React component.
- **Admin approval gate.** Self-serve signups are created pending. An admin
  approves them from Settings, Admin, Users, which sends the new business their
  verification email.

## Not in this edition

Removed on purpose. Do not sell these, and do not expect the routes to exist.

| Area | Status |
| --- | --- |
| Teams, round-robin, collective events | Removed. Single-account scheduling only. |
| Workflows, SMS and WhatsApp reminders | Removed, and there is **no scheduler at all** — `packages/features/ee/workflows/` is absent and `Workflow`/`WorkflowReminder` are not in the schema. Transactional booking emails still work. The "WhatsApp" and "Telegram" apps are `linkType: "static"` location links, not messaging: they let a host paste a `wa.me` / `t.me` link as the meeting place and send nothing. |
| Billing, plans, subscriptions | Removed. There is no in-app payment for the product itself. |
| SSO, SAML, SCIM, organizations | Removed. `ORGANIZATIONS_ENABLED` must stay empty. |
| Admin impersonation | Removed. |
| Standalone REST API (`apps/api/v2`) | Present in the repo, **not deployed**. The container runs the web app only. Automate through webhooks. |
| Insights and advanced analytics | Not part of this edition. |
| Outlook / Microsoft 365 | Removed. Calendar sync and Microsoft sign-in are both gone; Google, Apple and CalDAV remain. |

Integrations went from 105 to **26**. See [docs/APP-STORE.md](docs/APP-STORE.md)
for what each surviving app does and what it needs.

## Integrations and the keys they need

Apps that need **no keys** work as shipped: Apple Calendar, CalDAV, n8n,
Pipedream, QR code, the messaging link apps, and the three analytics apps
(tracking IDs are entered per event type, not globally).

Apps that need server credentials in `deploy/production/.env`:

| App | Environment variables |
| --- | --- |
| Google Calendar and Meet | `GOOGLE_API_CREDENTIALS`, `GOOGLE_LOGIN_ENABLED=true` |
| Cal Video | `DAILY_API_KEY` |
| Zoom | `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` |
| Stripe | `STRIPE_CLIENT_ID`, `STRIPE_PRIVATE_KEY`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYMENT_FEE_FIXED`, `PAYMENT_FEE_PERCENTAGE` (all six or none) |
| HubSpot | `HUBSPOT_CLIENT_ID`, `HUBSPOT_CLIENT_SECRET` |
| Salesforce | `SALESFORCE_CONSUMER_KEY`, `SALESFORCE_CONSUMER_SECRET` |
| Zapier | `ZAPIER_INVITE_LINK` |
| Make | `MAKE_INVITE_LINK` |

Keys are read by `scripts/seed-app-store.ts` at container boot, so adding one
requires a redeploy to take effect. An app whose schema requires keys stays
disabled and invisible in the store until they validate.

## Local development

Node 20 and Yarn 4.12 or newer.

```bash
yarn
cp .env.example .env
yarn workspace @calcom/prisma db-migrate
yarn dev
```

Fill `DATABASE_URL`, `NEXTAUTH_SECRET`, and `CALENDSO_ENCRYPTION_KEY` in `.env`
before the migrate step. The app runs on http://localhost:3000.

```bash
yarn type-check:ci --force   # must stay green before pushing
TZ=UTC yarn test             # unit tests
yarn biome check --write .   # lint and format
```

Engineering standards this repo follows live in [CLAUDE.md](CLAUDE.md) and
[agents/](agents/).

## Production

A single VPS running Docker Compose behind an existing Traefik, with the image
built by GitHub Actions and pulled from GHCR. Merging to `main` deploys
automatically.

- [deploy/production/README.md](deploy/production/README.md) for the runbook:
  DNS, first boot, SMTP, OAuth, updates, rollback
- [docs/DEPLOYMENT-AUTOMATION.md](docs/DEPLOYMENT-AUTOMATION.md) for the CI/CD
  pipeline and its security model
- [deploy/production/CHECKLIST.md](deploy/production/CHECKLIST.md) for the
  launch checklist

Four things that will cost you data or a customer if ignored:

- **Never rotate `CALENDSO_ENCRYPTION_KEY` after go-live.** Every stored
  calendar credential is encrypted with it and becomes unreadable. Keep a copy
  somewhere other than the VPS — it is not in git, not in GitHub secrets, and not
  in the database dumps, so without it a restore onto a fresh box is useless.
- **Never run `docker compose down -v` in production.** The `-v` deletes the
  `database-data` volume. Plain `down` is safe.
- **Merging a change under `deploy/` does nothing on its own.** `docker-compose.yml`
  and `remote-deploy.sh` are read from the host checkout at `/opt/bookyourslot`,
  not from the image, and nothing updates it automatically. `git pull --ff-only
  origin main` on the VPS, then redeploy. This has silently swallowed two fixes.
- **The `emails` feature flag is an inverted kill switch.** `enabled = true` stops
  all outbound email with only a `console.warn`. It must stay `false`.

### Standing checks after a deploy

Google integration failure is silent here: the key lookup throws outside the
calendar service's try block, so a broken calendar shows up only in the database.
A booking still saves and the customer still gets a "confirmed" email.

```sql
-- Bookings that got a confirmation but never reached a calendar.
SELECT count(*) FROM "BookingReference"
WHERE type = 'google_calendar' AND (uid = '' OR uid IS NULL);
```

Anything above the known historical count means a real customer was affected.

## Admin tasks

| Task | Where |
| --- | --- |
| Approve a pending business | Settings, Admin, Users. The pending count shows as a badge in the sidebar. |
| Enable or configure an app | Settings, Admin, Apps |
| Feature flags | Settings, Admin, Features |

## Documentation

- [docs/N8N.md](docs/N8N.md) for wiring bookings into n8n
- [docs/APP-STORE.md](docs/APP-STORE.md) for every integration, what it does and
  what it needs
- [docs/TESTING.md](docs/TESTING.md) for testing locally and on the VPS
- [docs/GITHUB.md](docs/GITHUB.md) for branching, PR flow, and secrets policy
- [docs/BACKLOG.md](docs/BACKLOG.md) for the engineering backlog: what would make
  this more reliable, safer or faster, and what is already handled
- [SECURITY.md](SECURITY.md) for reporting a vulnerability

## Contact

Questions, feedback, security reports: **hello@bookyourslot.online**

## License and attribution

MIT, see [LICENSE](LICENSE). BookYourSlot is built and maintained by
**Lohith Kumar Nerukonda** ([about](https://bookyourslot.online/about)) on top of
[Cal.com](https://github.com/calcom/cal.com)'s open-source community edition.
Thanks to the Cal.com team and contributors.
