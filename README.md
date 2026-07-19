# BookYourSlot

**Scheduling that runs your business.** Booking pages, team scheduling, calendar
sync, and automatic email confirmations — self-hosted on your own domain, at
[bookyourslot.online](https://bookyourslot.online).

## What it does

- **Booking pages** — every practitioner gets a clean public page; guests pick
  a time that works and book themselves.
- **Availability & time zones** — working hours, date overrides, buffers, and
  automatic timezone conversion for every guest.
- **Self-serve reschedules** — guests move or cancel their own booking from the
  confirmation email, and the calendar stays current.
- **Google Calendar sync** — two-way sync keeps availability true and prevents
  double-bookings.
- **Email confirmations & updates** — every booking, cancellation, and
  reschedule notifies everyone automatically.
- **Embeds, API & webhooks** — put booking flows in your own site and automate
  around them.

## Local development

```bash
yarn                       # install (Node 20 recommended; a Node 25 compat patch is included)
cp .env.example .env       # then fill DATABASE_URL, NEXTAUTH_SECRET, CALENDSO_ENCRYPTION_KEY
yarn workspace @calcom/prisma db-migrate
yarn dev                   # web app on http://localhost:3000
```

Useful commands: `yarn type-check:ci --force`, `TZ=UTC yarn test`,
`yarn biome check --write .`. See [CLAUDE.md](CLAUDE.md) and
[agents/](agents/) for the engineering standards this repo follows.

## Documentation

- [docs/TESTING.md](docs/TESTING.md) — how to test locally and on the VPS
- [docs/GITHUB.md](docs/GITHUB.md) — branching, PR flow, secrets policy
- [deploy/production/CHECKLIST.md](deploy/production/CHECKLIST.md) — launch checklist and feature roadmap

## Production deployment

The production setup (Docker Compose + Caddy HTTPS on a VPS) lives in
[`deploy/production/`](deploy/production/) with a full runbook — DNS, first
boot, SMTP, Google Calendar OAuth, and update procedure.

## Contact

Questions, feedback, security reports: **hello@bookyourslot.online**
(see [SECURITY.md](SECURITY.md)).

## License & attribution

MIT — see [LICENSE](LICENSE). BookYourSlot is built and maintained by
**Lohith Kumar Nerukonda** ([about](https://bookyourslot.online/about)) on top of
[Cal.com](https://github.com/calcom/cal.com)'s open-source Cal.diy community
edition; thanks to the Cal.com team and contributors.
