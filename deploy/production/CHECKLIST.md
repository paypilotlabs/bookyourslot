# BookYourSlot launch checklist

Work through this top to bottom. Every unchecked box before "Go-live smoke
test" blocks launch; everything under "After launch" can follow at its own
pace. The [README](README.md) holds the detailed commands for each step,
[docs/TESTING.md](../../docs/TESTING.md) holds the test procedures for both
local and VPS, and [docs/GITHUB.md](../../docs/GITHUB.md) holds the repository
policies.

## 1. Infrastructure

- [ ] 8 GB VPS purchased (Ubuntu 22.04/24.04), SSH access works
- [ ] DNS: `A @ -> VPS IP` and `CNAME www -> bookyourslot.online`
- [ ] Docker Engine + compose plugin installed (`curl -fsSL https://get.docker.com | sh`)
- [ ] Firewall: only 22/80/443 open (`ufw`)
- [ ] 4 GB swapfile active (build headroom)

## 2. Code + configuration

- [ ] Repo cloned to `/opt/bookyourslot`
- [ ] Brand web font copied (gitignored): `scp apps/web/public/fonts/brand/*.otf root@VPS:/opt/bookyourslot/apps/web/public/fonts/brand/`
- [ ] `deploy/production/.env` created from `.env.production.example`
- [ ] Fresh `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Fresh `CALENDSO_ENCRYPTION_KEY` (`openssl rand -base64 24`) — never rotate after go-live
- [ ] Strong `POSTGRES_PASSWORD`; `DATABASE_URL`/`DATABASE_DIRECT_URL` match it
- [ ] `ORGANIZATIONS_ENABLED` left empty

## 3. First deploy

- [ ] `docker compose build calcom` completes (20-40 min first time)
- [ ] `docker compose up -d`; `docker compose logs -f calcom` shows migrations then ready
- [ ] `https://bookyourslot.online` loads with valid TLS; `www.` redirects to apex

## 4. Accounts

- [ ] Admin created via `https://bookyourslot.online/auth/login` -> auto-redirect to `/auth/setup`
- [ ] `demo` user created (alias email like `hello+demo@bookyourslot.online`)
- [ ] `demo` has a 30-minute event type with slug `30min` and a schedule, so the landing hero link `/demo/30min` resolves
- [ ] Never run `yarn db-seed` in production

## 5. Email (Hostinger SMTP)

- [ ] `EMAIL_SERVER_*` filled (smtp.hostinger.com:465, hello@bookyourslot.online)
- [ ] Booked the demo event from a private window with an external address
- [ ] Both confirmation emails arrived (guest + owner)

## 6. Sign-in with Google + Google Calendar (one OAuth client for both)

- [ ] Google Cloud project created, **Google Calendar API** enabled
- [ ] OAuth consent screen: External, app BookYourSlot, domain bookyourslot.online, published
- [ ] OAuth client (Web application) with BOTH redirect URIs:
  - [ ] `https://bookyourslot.online/api/auth/callback/google`
  - [ ] `https://bookyourslot.online/api/integrations/googlecalendar/callback`
- [ ] Client JSON pasted into `GOOGLE_API_CREDENTIALS` (one line) in `.env`
- [ ] `GOOGLE_LOGIN_ENABLED=true` in `.env`, then `docker compose up -d calcom`
- [ ] Admin -> Settings -> Admin -> Apps -> **Google Calendar** enabled
- [ ] Login page shows the Google button; a Google sign-in round-trips
- [ ] Sign-up page's Google button also round-trips (both routes verified wired)
- [ ] Settings -> Apps: connecting a Google Calendar works and a test booking lands on it

## 7. Apple Calendar (no API keys needed)

- [ ] Admin -> Settings -> Admin -> Apps -> **Apple Calendar** enabled
- [ ] Verified from a user account: Settings -> Apps -> Apple Calendar -> connect using an
      app-specific password from appleid.apple.com (iCloud CalDAV)

## 8. Go-live smoke test

Full procedure: [docs/TESTING.md](../../docs/TESTING.md) Part B.

- [ ] Landing, `/how-it-works`, `/blog`, `/about`, `/contact`, `/terms`, `/privacy` all load (light and dark)
- [ ] `/demo/30min` books end to end from a private window
- [ ] Reschedule + cancel emails behave
- [ ] `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/og-image.png` respond
- [ ] Sign-in works with email + password and with Google

## 9. After launch

- [ ] Google Search Console verified; sitemap submitted; indexing requested for `/` and each blog post
- [ ] Bing Webmaster Tools imported from Search Console
- [ ] Rich Results Test passes on `/` (FAQPage, SoftwareApplication) and one post (BlogPosting)
- [ ] Nightly `pg_dump` cron in place (command in README)
- [ ] Decide open vs invite-only signup



## Feature roadmap (not yet enabled — never claim these until done)


| Feature                                            | Status                       | What it needs                                                                                     |
| -------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Sign-in with Google                                | Wired + verified, needs keys | Checklist section 6 (both login and sign-up reach Google)                                         |
| Google Calendar sync                               | Ready, needs keys            | Checklist section 6                                                                               |
| Apple Calendar sync                                | Ready                        | Enable app (section 7)                                                                            |
| Outlook / Microsoft 365                            | **Removed**                  | Calendar app and Microsoft sign-in both deleted; Google, Apple and CalDAV remain                   |
| Video meetings (built-in/Zoom/Meet)                | Unconfigured                 | Provider keys + app enable; landing copy must be updated only after it works                      |
| Payments (Stripe)                                  | Unconfigured                 | Stripe account + keys; same truth rule                                                            |
| Reminder workflows (email/SMS before appointments) | Not in this edition          | Workflow routes are stripped from the Cal.diy base (500); needs porting before any reminder claim |
| Owner calendar dashboard                           | In progress                  | Personal week view first                                                                          |
| Shared team pages / round-robin                    | Not in this edition          | Team routes are stripped from the Cal.diy base (404); needs porting before any team claim         |
| Unique display font                                | Skipped for now              | Drop unique.woff2 into fonts/brand if ever wanted                                                 |
| Organizations / subdomains                         | Deliberately off             | Do not enable on apex domain                                                                      |
| Admin impersonation                                | Not in this edition          | Route 404s; the command-palette entry was removed                                                 |


