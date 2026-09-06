# BookYourSlot — Product Source of Truth

**One document. What the product does, what it does not, who will pay for it, how
much, what it costs to run, and the exact order to build the rest.**

| | |
|---|---|
| **Version of record** | `main @ bfe849b`, deployed and healthy |
| **Live at** | https://bookyourslot.online |
| **Last full code verification** | 3 September 2026 |
| **Last market verification** | 3 September 2026 |
| **Owner** | Lohith Kumar, hello@bookyourslot.online |
| **Commercial status** | Zero paying customers. Product live, demo-ready with caveats. |
| **Build capacity assumed** | One person, full time, with Claude Code. ~40 hrs/week. |
| **Market** | United States. Prices in USD. |
| **Business model** | One-time setup fee + monthly retainer. Done-for-you onboarding. |
| **Voice stack** | Retell AI |

---

## Contents

| Part | What is in it |
|---|---|
| **[A](#part-a--what-exists-today)** | What exists today — every capability, its real status, and its sharp edges |
| **[B](#part-b--what-does-not-exist)** | What does not exist |
| **[C](#part-c--six-live-surfaces-that-will-mislead-a-prospect)** | Six live surfaces that will mislead a prospect |
| **[D](#part-d--who-to-sell-to)** | Who to sell to — market counts, what they already pay, verdict per vertical |
| **[E](#part-e--the-money)** | The money — competitors, real costs, the offer, unit economics, CTAs, objections |
| **[F](#part-f--the-voice-agent-the-v2-flagship)** | The voice agent — endpoint spec, Retell config, call script, legal position |
| **[G](#part-g--v2-as-an-organization)** | v2 as an organization — what is already there, what is missing, the schema answer |
| **[H](#part-h--the-roadmap)** | The roadmap — phases, engineer-days, and where to start selling |
| **[I](#part-i--prerequisites-what-to-get-ready-in-parallel)** | Prerequisites — accounts, legal, HIPAA, testing, when to pivot |
| **[J](#part-j--other-things-you-can-automate-and-how-to-prove-they-matter)** | Other automations, and why every industry statistic you have read is broken |
| **[K](#part-k--what-you-may-and-may-not-say)** | What you may and may not say |
| **[L](#part-l--notes-from-the-field)** | Notes from the field — your space |
| **Appendices** | Glossary · unverified numbers · sources · verification method · change log |

### If you only read three things

1. **§A.10** — the README is wrong: teams were never removed from the database, and there
   is an open authorization hole that must close before you provision one.
2. **§E.2–E.3** — one customer at $349/month covers every fixed cost you have.
3. **§H.2** — you can be selling at week 5. Do not build to week 20 first.

---

## How to read this

Two readers, both first class.

- **Business view** — what can I sell, to whom, for how much, and what must I never
  claim. Plain language, the words a prospect uses.
- **Developer view** — where does it live, what is its real status, what would it
  cost to change. File paths and line numbers.

Where they disagree, the developer view wins. It is the one checked against running
code.

### Status words, used the same way everywhere

| Tag | Meaning | Safe to sell? |
|---|---|---|
| **LIVE** | Works, and the owner can configure it in the UI today | Yes |
| **BUILT, NO UI** | The code runs, nothing in the interface reaches it | Only if you operate it for them |
| **SCHEMA ONLY** | Database columns or dead components exist, no working path | No |
| **ABSENT** | Does not exist in this codebase | No, and say so plainly |

### Two standing rules

1. **Never claim a feature that does not work.** Everything tagged LIVE below was
   read in the repository or exercised on the live site. Anything that could not be
   verified is marked as such rather than assumed.
2. **Every price and market number carries a source.** Where a number could not be
   verified, it says so. Do not put an unverified number in a sales deck.

### The one-line summary of where you are

> The scheduling engine is real and works. The phone is the product you are actually
> going to sell, and it does not exist yet. Between here and a sellable v2 there are
> six defects that will lose you a customer, one security hole that must close before
> you provision a single team, and roughly **five weeks of full-time work** to a
> product you can charge $349/month for.

---

# PART A — What exists today

## A.0 What you are actually selling

Not "a Cal.com fork." Not "scheduling software." Square Appointments is free and
Fresha is $19.95/month — **you cannot win by selling a booking page.**

What you sell is: *a phone number and a link that turn enquiries into confirmed
appointments in the owner's calendar, without the owner touching anything.* The
booking engine is the machinery underneath. The phone is the pitch.

---

## A.1 Services and prices (event types)

> **Plain language:** Each thing the business sells is a "service" with its own
> booking link, duration, questions and rules. A salon has one per treatment, an auto
> shop one per job type, a lawyer one per consult type.

| Capability | Status | Where the owner sets it |
|---|---|---|
| Service name, URL, description, duration | LIVE | Event Types → service → Basics |
| Multiple selectable durations | LIVE | Basics → "Allow multiple durations" |
| Unlimited services per account | LIVE | Event Types → New |
| Hidden services (link works, not listed) | LIVE | Event Types → toggle |
| Private one-off links with expiry and usage cap | LIVE | Advanced → Private links |
| Redirect to your own page after booking | LIVE | Advanced |

**Sharp edges.** Durations come from a fixed menu (5, 10, 15, 20, 25, 30, 40, 45, 50,
60, 75, 80, 90, 120, 150, 180, 240, 300, 360, 420, 480 minutes). A 35-minute or
100-minute service cannot be offered as a selectable duration, only as its own
service. Turning on seats silently clears the multiple-duration setting.

**Developer view.** `apps/web/modules/event-types/components/tabs/setup/EventSetupTab.tsx`
— settings at `:131,192,322-334`, selectable-duration menu at `:87-92`; single-duration
bounds `packages/lib/constants.ts:82,85`.

---

## A.2 Where the appointment happens (locations)

> **Plain language:** This is what makes the product work for physical businesses,
> not just video calls. Customer's address, your shop address, or phone.

Six location types, always available, no app install:

| Location type | What it does | Who needs it |
|---|---|---|
| **In person (attendee address)** | Customer types their address; it lands in the calendar event location field, tappable, opens Maps on a phone | HVAC, mobile services |
| **In person (organizer address)** | You publish your shop address | Salons, auto care, clinics, med spas |
| **Custom attendee location** | Free text from the customer | Flexible field work |
| **Attendee phone number** | Customer gives a number, you call them | Insurance, consultations |
| **Organizer phone number** | You publish a number to call | Inbound phone consults |
| **Link meeting** | Any URL you paste | Anything |

Plus **Google Meet**, which works and is the practical default for video.

**Sharp edges.** The value of Organizer Address, Organizer Phone and Link meeting is
stripped from the public booking page unless "Display on booking page" is ticked per
location. An auto shop that types its address and forgets that checkbox has customers
who only learn the address from the confirmation email. Addresses are unvalidated free
text — nothing checks the address is real or inside a service area. Switching a
service from Google Meet to attendee address silently removes the join link from the
reminder email.

**Developer view.** `packages/app-store/locations.ts:105-205`; address input rendered by
`packages/features/bookings/lib/getBookingFields.ts:147-151`; written to Google at
`packages/app-store/googlecalendar/lib/CalendarService.ts:213`.

---

## A.3 Working hours and availability

| Capability | Status | Where |
|---|---|---|
| Named schedules, multiple ranges per day | LIVE | Availability |
| Per-service schedule (different hours per service) | LIVE | Service → Availability tab |
| Date overrides (closures, special hours) | LIVE | Schedule → Date overrides |
| Out of office / vacation blocks | LIVE | Settings → Out of office |
| Public holiday auto-blocking by country | LIVE | Settings → Out of office → Holidays |
| Availability troubleshooter ("why is Tuesday closed?") | LIVE | /availability/troubleshoot |
| Correct timezone shown to the customer | LIVE | Automatic |

**Sharp edges.** The **schedule's** timezone drives slot generation, not the profile
timezone. Date overrides belong to one schedule, not the account, so a business with
three schedules enters the same holiday closure three times. Public holiday blocking
needs `GOOGLE_CALENDAR_API_KEY` on the server — if a user picks a country and that key
is missing, the booking page breaks rather than degrading. If an assigned schedule is
deleted, the service quietly falls back to the default schedule instead of erroring,
so it can start taking bookings on the wrong hours.

**Developer view.** `packages/features/availability/lib/getUserAvailability.ts:425-434`
(timezone), `:822-849` (holidays); `packages/lib/holidays/GoogleCalendarClient.ts:40-43`.

---

## A.4 Rules that protect the schedule

> **Plain language:** The rules that stop customers booking at 3am, booking twelve
> slots, or booking with no notice.

| Control | Status | Business use |
|---|---|---|
| Buffer before / after the appointment | LIVE | Clean-up, travel pad, room turnover |
| Minimum booking notice | LIVE | "No same-day bookings" |
| Time-slot interval | LIVE | Start times on the hour or half hour |
| How far ahead customers can book | LIVE | Rolling days, or a fixed date range |
| Bookings per day / week / month / year | LIVE | Bay count, chair count, daily capacity |
| Total booked minutes per day / week / month | LIVE | Cap hours rather than count |
| Cap on upcoming bookings per customer | LIVE | Stop one person hoarding slots |
| Offset start times | LIVE | Show 9:05 instead of 9:00 |

**Sharp edges.** Buffers are a fixed menu (0, 5, 10, 15, 20, 30, 45, 60, 90, 120) — a
25-minute drive-time pad is not expressible. The rolling window that skips unavailable
days is hard-capped at 61 days. The per-customer cap is **per service** and counts only
accepted bookings: a customer capped on "Oil change" can still book "Tire rotation" the
same day, and on a requires-confirmation service they can stack unlimited pending
requests until one is approved.

**Developer view.** `packages/features/eventtypes/components/tabs/limits/EventLimitsTab.tsx:498-854`;
61-day cap `packages/lib/constants.ts:205`.

---

## A.5 Taking the booking

| Capability | Status | Notes |
|---|---|---|
| Public booking page | LIVE | Mobile responsive |
| Booking questions, 13 answer types | LIVE | Short text, long text, number, email, phone, address, URL, single-select, multi-select, radio, checkbox group, single checkbox, multi-email |
| Required vs optional per question | LIVE | |
| Requires confirmation (owner approves each booking) | LIVE | Always, or only under a notice threshold |
| Seats per time slot (group classes) | LIVE | Yoga, workshops, group sessions |
| Recurring bookings | LIVE | Weekly, monthly, yearly, up to 24 occurrences |
| Embed the booking page on your own website | LIVE | Event Types → Embed |

**Sharp edges.** **No file upload and no signature field.** No insurance card, no
driving licence photo, no signed consent form. **No conditional logic** — every
question shows to every customer; routing forms were removed from this fork. The Name
and Location questions can be relabelled but never hidden. Turning seats on
force-disables requires-confirmation. Approving a pending booking is one tap from a
signed link in the owner's email and needs no login — anyone who receives a forwarded
copy of that email can approve or reject.

**Developer view.** `packages/features/form-builder/fieldTypes.ts` defines 15 types, of
which 2 are `systemOnly: true` (`name`, `radioInput`), leaving 13 a business can add.
Approval links `apps/web/app/api/link/route.ts`.

---

## A.6 Calendars

| Provider | Status | Notes |
|---|---|---|
| **Google Calendar** | LIVE | Busy times block your slots; bookings write real events with Meet links. Verified end to end 31 Aug 2026 |
| **Apple Calendar / iCloud** | LIVE, unexercised | Needs an app-specific password from appleid.apple.com |
| **CalDAV** (Fastmail, Nextcloud, Zimbra, SOGo) | LIVE, unexercised | Owner must know their CalDAV URL |
| **Outlook / Office 365 / Exchange** | ABSENT | Deleted in the app prune. Not recoverable by a setting |

**This is a qualifying question, not a support question.** Insurance offices, law
firms and HVAC companies skew Microsoft. Ask what calendar they use *before* the demo.

**Sharp edges, one of which causes double bookings.** When a Google token is revoked
and the credential is flagged invalid, that calendar is **silently dropped from
conflict checking** — the booking page keeps offering times over real appointments and
nobody is told. A calendar connection with zero calendars ticked is skipped entirely.
Only the primary calendar is auto-ticked on connect, so a shared "Shop Floor" calendar
must be ticked by hand or it blocks nothing. Apple and CalDAV have no invalidation path
at all, so a changed password zeroes the booking page with no warning.

**Developer view.** `packages/features/calendars/lib/getCalendarsEvents.ts:101,159-166`.

---

## A.7 After the booking

| Capability | Status | Notes |
|---|---|---|
| Confirmation email to customer and owner | LIVE | SPF, DKIM, DMARC all pass |
| Calendar invite (.ics) attached | LIVE | |
| Day-before reminder email to the customer | **BUILT, NOT RUNNING** | See below |
| Reschedule by the customer | LIVE | Moves the real calendar event |
| Reschedule requested by the owner | LIVE | Bookings → row menu |
| Cancellation by either side, with reason | LIVE | |
| Require a cancellation reason | LIVE | Advanced tab |
| Disable cancelling or rescheduling entirely | LIVE | Advanced tab |
| Minimum reschedule notice | LIVE | Advanced tab |
| No-show marking | LIVE | Bookings → row menu |
| Bookings list with filters | LIVE | /bookings |

**The reminder is built and nothing calls it.** `apps/web/app/api/cron/attendeeReminder/route.ts`
is complete and correct — 24-hour window, idempotent via `Booking.metadata.reminderSentAt`,
carries the Meet link. It requires `CRON_API_KEY`, which is **not set in production**, so
today it returns 401 to everything. There is no scheduler in the container, no cron
service in the production compose file, and `apps/web/vercel.json` is inert on a VPS.
**Verified 3 Sep 2026.** This is a half-day fix and it is on the P0 list.

**Other sharp edges that matter commercially.** The reminder is 24 hours, email only,
always on, no per-service control, no second reminder — the 2-hour SMS that actually
cuts no-shows cannot be sent. A booking created less than 2 hours before its own start
time never gets one — `reminderWindow` floors on `createdAt <= now − 2h`
(`apps/web/app/api/cron/attendeeReminder/window.ts:19`).
**There is no late-cancellation window anywhere in the product** — cancelling is open
until the start time, or disabled outright. A no-show can be recorded but
carries no consequence, because no money can be taken. A reschedule request releases the
slot immediately and fires the *cancellation* webhook, so automations see it as a lost
appointment. **There is no CSV export and no REST API.** Reply-To on a confirmation
lists the other attendees' email addresses — on a multi-guest booking at a clinic or law
practice, clients see each other's addresses.

---

## A.8 Email

Email is **the only notification channel that works.** 28 of 49 templates can fire; 21
cannot, because they belong to payments, recordings, team invitations or workflows, none
of which exist here.

**A standing hazard.** A global feature flag named `emails` has inverted meaning:
setting it to **enabled = true silently stops every outbound email**, with nothing but
a console warning. It must stay false. Nothing in the UI warns about this, and the flag
cache is 5 minutes, so a mistake takes 5 minutes to show and 5 minutes to undo.

Email send failures are swallowed and logged. A business can believe a customer was
told when they were not.

**Developer view.** `packages/emails/templates/_base-email.ts:32-39` (kill switch),
`:88-96` (swallowed failures); flag cache `packages/features/flags/features.repository.ts:35-50`.

---

## A.9 Accounts and administration

| Capability | Status | Notes |
|---|---|---|
| Signup with admin approval gate | LIVE | New accounts land pending; you approve |
| Email and password login | LIVE | 7-character minimum, not configurable |
| Sign in with Google | LIVE | |
| Two-factor authentication | LIVE, partial | See below |
| Admin user list, search, pending filter | LIVE | Settings → Admin → Users |
| Lock and unlock an account | LIVE | **This is your subscription kill switch** |
| Operator SQL console | BUILT, NO UI | `scripts/console.sql`, needs SSH |
| Self-service account deletion | LIVE | Cascades to all bookings, no export first |

**Sharp edges.** A user who signed up with Google has no password, so **2FA setup
fails** with an error; the UI does not block them from trying. **Promoting someone to
admin does not give them admin access** unless their password is longer than 14
characters and 2FA is on — otherwise they are silently downgraded at login. **Admin
delete is `prisma.user.delete` with no export and no soft delete** — deleting a host
destroys every booking they ever took. No undo. Settings → Admin → Users → Add creates
an account with no password and unlocked, so an empty profile becomes publicly bookable
immediately; do not use it. Magic-link tokens are valid for ten **hours** despite a code
comment saying ten minutes — do not advertise that login method.

**Developer view.** Admin downgrade `next-auth-options.ts:263-279`; cascade
`schema.prisma:856`.

---

## A.10 Multi-person and teams — the real state

**This is the most misunderstood area of the product, and the README is wrong about
it.** The README says teams were "removed." They were not removed from the database or
the engine. They were removed from the *screens*.

**Verified 3 Sep 2026:** `packages/prisma/schema.prisma` has been modified exactly once
in this repository's entire history (the initial fork import). `git diff` between that
commit and HEAD on the schema file is **empty**. There is no team, membership,
organization or billing drop migration. Every team table is in the live database.

| Piece | Status |
|---|---|
| `Team`, `Membership`, `Profile`, `OrganizationSettings` tables | **LIVE, fully intact** |
| `Host` table with per-host priority, weight, group, schedule | **LIVE, fully intact** |
| `SchedulingType` = ROUND_ROBIN / COLLECTIVE / MANAGED | **LIVE, fully intact** |
| Round-robin selection engine (`getLuckyUser.ts`, 889 lines) | **BUILT AND WIRED** — called on the hot booking path |
| Host assignment write path (`update.handler.ts:456-547`) | **BUILT AND WIRED** |
| Provision a team with members | **BUILT, NO UI** — admin-only tRPC mutation, PR #44 |
| Team event types appear on /event-types | **LIVE** — the moment a Membership row exists |
| Team creation screen | ABSENT — `/teams` returns 404 |
| Host assignment screen | ABSENT — stubbed to render `null` |
| Public team booking page | ABSENT — `/team/[slug]` does not exist |
| Invitation emails | ABSENT |

**What a multi-person business gets today:** one account per person, one booking link
each, and a page on their own website listing them. That is honest and it works. No
shared availability, no combined bookings list, each person approved individually.

**Do not demo `/alice+bob`.** The multi-user link exists but is COLLECTIVE — it books
every named person into the same appointment. It is the opposite of "whoever is free."

> ### ⚠ Security: close this before you provision a single team
>
> `createEventPbacProcedure` (`packages/trpc/server/routers/viewer/eventTypes/util.ts:150-175`)
> enforces real ownership **only for personal event types**. For **team** event types it
> calls a `PermissionCheckService` stub that returns `true` unconditionally. There are
> **18 copies** of that stub across the codebase — semantically identical, in two
> formatting variants — plus a matching `declare class` in
> `packages/trpc/types/server/routers/viewer/eventTypes/teamAccessUseCase.d.ts`.
>
> Consequence: the moment a team exists, **any logged-in user can read, update,
> duplicate or delete that team's event types by guessing an id.** PR #44 fixed only
> `create`. `get`, `update`, `duplicate`, `delete` and six host procedures — **ten in
> all** — are still open.
>
> **Fix: one function, ~1 day.** Replace the stub call with the real
> `MembershipRepository.getAdminOrOwnerMembership` check that PR #44 already uses.
> Do this before the first team row is written, not after.

**Developer view.** Engine `packages/features/bookings/lib/getLuckyUser.ts`; assignment
tab stub `EventTypeWebWrapper.tsx:48`; provisioning
`packages/trpc/server/routers/viewer/admin/createTeam.handler.ts`; the hole
`packages/trpc/server/routers/viewer/eventTypes/util.ts:161-167`.

---

## A.11 Automation and integration

| Capability | Status | Notes |
|---|---|---|
| Webhooks with HMAC signing | LIVE | Header `X-Cal-Signature-256` |
| Webhook create, edit, ping test | LIVE | Settings → Developer → Webhooks |
| Per-service or account-wide webhook scope | LIVE | |
| n8n receives booking events | LIVE | The real integration path |
| n8n creates, reschedules, cancels bookings | LIVE | Via the public booking endpoint |
| n8n reads or lists anything | ABSENT | No REST API is served |
| Analytics: GA4, Plausible, Meta Pixel | LIVE | Per service, not per account |
| CRM: HubSpot, Salesforce | SCHEMA ONLY | Needs OAuth keys in server env and a redeploy |

**The asymmetry to design around: automations can receive and write, but cannot read.**
Any state an automation needs must live in the automation.

**Sharp edges.** **No webhook retry and no delivery log** — one attempt, result
discarded, failures logged server-side and dropped. A business cannot see that
yesterday's bookings never reached their CRM. **Nothing in this repository schedules any
cron route.** Of 19 triggers offered, **9 can never fire here** — payments ×2, recordings
×2, Cal Video no-shows ×2, delegation error, and both routing-form triggers (routing forms
were dropped by migration `20260305043434_remove_routing_forms` and
`queueFormSubmittedWebhook` has no caller). Two more, `MEETING_STARTED` and
`MEETING_ENDED`, are selectable and look like they work, but rows only queue and are
flushed by a cron route nothing calls. That leaves the eight listed below. The
ping-test payload uses Cal.com placeholder addresses, so a prospect watching a demo sees
cal.com email addresses. Webhooks fire **inline inside the booking request**, with no
timeout — a slow subscriber directly slows down bookings.

**Triggers that actually fire here (verified):** `BOOKING_CREATED`,
`BOOKING_RESCHEDULED`, `BOOKING_CANCELLED`, `BOOKING_REQUESTED`, `BOOKING_REJECTED`,
`BOOKING_NO_SHOW_UPDATED`, `OOO_CREATED`, `WRONG_ASSIGNMENT_REPORT`.

**Developer view.** `packages/features/webhooks/lib/sendPayload.ts:296-299,316`;
dispatch `packages/features/bookings/lib/handleWebhookTrigger.ts:27-39`.

---

## A.12 Infrastructure

| | |
|---|---|
| Host | Hostinger VPS, 8 GB, Ubuntu, Docker Compose behind an existing Traefik |
| Services in production | **Exactly two containers**: Postgres 16 and the Next.js app |
| Stack | Next.js 16.2.3, TypeScript strict, Postgres 16, Prisma 6.16.1, tRPC, NextAuth |
| Deploy | GitHub Actions → GHCR → SSH cutover, 180s health gate, automatic rollback |
| Monitoring | Hourly off-box uptime probe, Telegram alerts |
| Email | Hostinger SMTP, SPF/DKIM/DMARC passing |
| Backups | Pre-deploy `pg_dump` only |
| Redis | **None.** All caches fall through to Postgres |
| Rate limiting | Traefik only. `/api/book/event` = 20/min, burst 10, **per source IP, globally** |

**Known gaps, all real and all verified:**

- **No nightly backup.** Recovery point is the last deploy. A fortnight with no deploy
  has no snapshot. `crontab -l` is empty and `/root/backups/` is empty.
- **A failed backup does not stop the deploy** — it logs a warning and proceeds.
- **No backup has ever been restored.** The existing snapshots predate `--clean
  --if-exists`, so they restore only into an empty target.
- Backups sit unencrypted on the same disk as the database. Nothing offsite.
- **`Credential.key` holds Google refresh tokens in plaintext.** `encryptedKey` is NULL
  on every row. A database dump gives live read/write on every connected customer
  calendar. This is the single largest liability in the system and it grows linearly
  with customer count. **Evidence:** `deploy/production/CHECKLIST.md:172-176`; schema
  `packages/prisma/schema.prisma:312-313`.
- **The calendar cache is dead.** `CalendarCache` has zero readers and zero writers.
  Every availability query hits the Google Calendar API live. Booking-page speed is
  bounded by Google's response time and quota.
- **One Google Cloud OAuth project for every tenant**, currently unverified, with a
  **100-user cap**. You are at 1. This caps you at roughly 100 businesses before Google
  app verification becomes mandatory.
- **`packages/lib/rateLimit.ts` is a stub that always returns success.** 150 lines that
  read like protection and are not. Real limiting is Traefik, per source IP, global —
  fine at 4 customers, wrong at 200.
- **`BookingDenormalized` is write-only.** Database triggers maintain it and 12 indexes
  on every booking write; nothing ever reads it. Pure write amplification.
- No audit logging. Nothing records who approved a signup, promoted an admin, or deleted
  a user.
- **The deploy pipeline updates the image only.** `docker-compose.yml` and
  `remote-deploy.sh` are read from the host checkout at `/opt/bookyourslot` and are never
  updated automatically. The host once sat six commits behind while every deploy reported
  success.

---

# PART B — What does not exist

State these plainly. Guessing wrong here costs a customer.

| Not available | Why | Buildable? |
|---|---|---|
| **Payments, deposits, no-show fees** | Two independent breaks: the card form is deleted (`PaymentPage.tsx:154` renders `<div>{/* StripePaymentComponent removed */}</div>`) and the Stripe webhook is a hardcoded 404 | Yes. Real project. See §H Phase 3 |
| **SMS and WhatsApp sending** | `packages/sms/sms-manager.ts` rate-limits and returns `undefined`. No Twilio dependency exists anywhere in the repo. `packages/sms` has no `package.json` and zero importers | Yes, ~1 week + 10DLC wait |
| **Cal Video and recordings** | `DAILY_API_KEY` unset | Config plus testing |
| **Outlook / Office 365 calendar** | Deleted in the app prune | Restoring the app package |
| **Round-robin with a UI** | Engine exists and is wired; the screen renders `null` | ~5 days |
| **Team or company booking page** | `/team/[slug]` does not exist | ~3 days |
| **File upload, signature capture** | No such field type | Real work |
| **Travel time, service areas, routing** | No geography anywhere in the product | **Do not build.** This is ServiceTitan's product |
| **Resource booking (bays, rooms, chairs)** | No resource model | Significant |
| **Late-cancellation window** | Not in the codebase | ~1 day, clones the reschedule control |
| **CSV export or REST API** | `apps/api/v2` exists but is pruned from the Docker build | See §F.2 |
| **Audit logs** | Nothing writes them | Moderate |
| **HIPAA posture of any kind** | See §I.3 | A programme, not a feature |
| **Workflows, routing forms** | Dropped by migration | Rebuild from scratch |
| **Conditional booking questions** | Zero hits for `conditional`/`dependsOn`/`showWhen` in the form builder | Moderate |

---

# PART C — Six live surfaces that will mislead a prospect

Fix these first. They are cheap and each one is a lie the product currently tells.

### C.1 The HIPAA app is a liability — **P0**

`/apps/baa-for-hipaa` returns **200 and needs no login**. It carries the BookYourSlot
page title, is listed in the app store, and advertises a **$300/month subscription**. It
has **zero runtime code** — a config file, an icon, and an external link to
`https://cal.com/BAA`.

A doctor or med-spa prospect who finds it will reasonably conclude BookYourSlot offers a
Business Associate Agreement. **It does not.** The link goes to Cal.com, Inc., a
different company that is not the data processor here.

**Action: hide this card before any healthcare conversation.** Hours of work.

### C.2 The Stripe card implies deposits work — **P0**

`/apps/stripe` returns 200 and the install route exists rather than 404ing — it answers
401 to an anonymous request and **501** to a logged-in owner, with "Taking payments is not
enabled on this account yet" (`packages/app-store/stripepayment/api/add.ts:14-21`). The
install cannot complete, but the card is browsable and the Stripe app still appears in the
event-type Apps tab, where an owner
can begin an install and set a price on a service. The event-type Apps tab renders a live
Price input, Currency select, Payment-option select and refund-policy controls. All of it
leads to a payment page **with no card field** and a webhook that is a hardcoded 404.

**Action: hide this card, or never open the app store in front of a prospect who wants
deposits.**

### C.3 The messaging apps read as SMS reminders — **P0**

WhatsApp, Telegram and Signal appear in the app store. They are **meeting location
providers** — they add a clickable chat link to a booking. Nothing on this deployment
sends a message. A salon owner will assume they mean WhatsApp reminders.

### C.4 Reminders are advertised and not running — **P0**

The product tells the customer "you'll get a reminder the day before." The cron route
exists, is correct, and returns 401 to everything because `CRON_API_KEY` is unset in
production. **Half a day to fix. Do it before the next demo.**

### C.5 The webhook ping test shows cal.com addresses

A prospect watching you configure a webhook sees `no-reply@cal.com` and `jdoe@example.com` in the test
payload (`packages/trpc/server/routers/viewer/webhook/testTrigger.handler.ts:41,49`).
Cosmetic, embarrassing, ~1 hour.

### C.6 The team authorization hole

Covered in §A.10. Not visible to a prospect, but it must close before the first team
exists. ~1 day.

---

# PART D — Who to sell to

## D.1 The six qualifying questions

Ask these before you demo. They map to the product's real fault lines.

1. **Does one named person do the work, or does anyone available?** "Anyone available"
   means round-robin, which has no UI today.
2. **Does money change hands at booking time?** Deposits do not exist.
3. **Does the work happen at the customer's address?** Then ask how far apart jobs are.
   There is no travel time and no service-area limit.
4. **Do they need a signature, a photo or a document at booking?** Not possible.
5. **What calendar do they use?** Microsoft is not supported. This kills more deals than
   anything else on this list.
6. **Is the data regulated?** Intake answers reach Google Calendar in plain text.

## D.2 The market, with real counts

**Source: US Census Bureau, County Business Patterns 2023 and Nonemployer Statistics
2023.** These are the authoritative counts.

| Vertical | NAICS | Employer businesses | Solo operators | What they already pay for software |
|---|---|---|---|---|
| Offices of physicians | 621111 | **204,617** | 186,842 | NexHealth (quote only), Weave from $199/mo |
| Auto repair & maintenance | 8111 | **169,572** | 373,301 | Tekmetric $199–439, Shopmonkey $239–499 (+$500 migration) |
| Offices of lawyers | 541110 | **165,491** | 274,000 | Clio from $49/user/mo |
| Offices of dentists | 621210 | **135,665** | 54,452 | Weave from $199/mo, NexHealth quote only |
| Plumbing / HVAC contractors | 238220 | **111,207** | 178,663 | Housecall Pro $79–329, Jobber $49–199 |
| Beauty salons | 812112 | **84,176** | **838,264** | Fresha $19.95, GlossGenius $28, Square Appointments **$0** |
| Residential property managers | 531311 | **60,818** | 265,293 | Buildium $62–400, AppFolio (50-unit minimum) |
| Barber shops | 812111 | **7,789** | **141,769** | Booksy $29.99, Square $0 |
| Med spas | *no NAICS code* | **11,000+** (AmSpa 2024) | — | Mangomint $120 (+$70/mo per phone line), Boulevard $140–328, Aesthetic Record $15/user (+$399 mandatory setup) |

**The two numbers that decide your strategy:**

1. **Salons are 84,176 employer businesses and 838,264 solo operators — 10:1.** Barbers
   are 18:1. Almost every salon "business" is one person whose entire software budget is
   a $28/month GlossGenius line item, competing against a **free** Square Appointments.
   *Salons are the worst-value target on this list despite being the most obvious one.*
2. **Dentists, physicians, lawyers, auto repair and HVAC are all larger *employer*
   markets than salons, and every one of them already pays $199–$500/month for
   software.** That is where a $349/month price is normal, not shocking.

## D.3 Verdict table

| Vertical | Verdict | The one thing blocking it | When it unblocks |
|---|---|---|---|
| **Auto care shops** | **SELL NOW** | Drop-off/pick-up as a pair (workaround exists) | Today |
| **HVAC, one truck** | **SELL NOW, narrowly** | Nothing structural | Today |
| **Law firms, small** | **SELL NOW** | Microsoft calendar risk — qualify hard | Today |
| **Salons and barbers** | Sell only to multi-chair, never solo | Deposits; and the price ceiling is $28/mo | Phase 3 |
| **Insurance / agent teams** | Sell with a caveat | Round-robin UI | Phase 2 |
| **HVAC, multi-truck** | **DO NOT SELL** | Travel time and service areas — not building | Never |
| **Med spas** | **DO NOT SELL YET** | Deposits, consent capture, PHI handling | Phase 3 + 5 |
| **Dental and medical** | **DO NOT SELL YET** | Any HIPAA posture at all | Phase 5 |
| **Property managers** | **DO NOT PURSUE** | Scheduling is not their core problem | Never |

## D.4 Vertical detail

### Auto care shops — SELL NOW

**Frame it as an appointment book, not a shop management system.**

They get: service types with durations up to 8 hours, shop address as a fixed location,
per-day booking caps standing in for bay throughput, before/after buffers,
requires-confirmation for diagnostics, and intake questions collecting make, model, year,
VIN as text and service type as a dropdown. Reminder and no-show marking both work.

**Missing: the drop-off and pick-up pair.** This product books one interval against one
person. A shop books a drop-off at 8am and a pick-up at 5pm with the car in a bay between
while the technician is free. Nothing models a resource held across a span independent of
a person.

**The honest cheap version, zero code:** two short services, "Drop-off" and "Pick-up," 15
minutes each, plus a per-day booking cap standing in for bay count.

**Say up front:** quoted durations are fixed per service, so a job that runs long does not
push the next customer. The shop still has to phone them.

**Why they buy the phone:** a service advisor who answers the phone is not writing the
ticket. Every call costs them productive minutes. Tekmetric costs them $199–439/month
already, so $349 is a familiar number.

### HVAC and field service — SPLIT VERDICT

**Sell to a one-truck operator on a small radius. Do not sell to a multi-truck company.**

The one-truck operator gets real value: the customer types their own address on the
booking page, it lands in the calendar event location, and the technician taps it on their
phone to open Maps. Add intake questions for unit type and symptom,
requires-confirmation for dispatch triage, buffers as a crude travel pad, per-day job
caps, recurring events for maintenance plans, and webhooks into n8n.

**Missing, and it is structural: this codebase has no geography at all.** No zip code, no
coordinates, no distance, no routing.

1. **No travel time.** The after-event buffer is a fixed number of minutes applied
   identically to every booking. A job 40 miles out and a job next door get the same pad,
   and the system will happily book them back to back.
2. **No service-area limit.** A customer 90 miles outside the territory can book and
   nobody finds out until the technician reads the address.
3. **No route optimisation and no path to it.**

**Worth building:** a service-area gate — a required dropdown of served zip codes as a
booking question. Pure configuration, hours of work, advisory only, still useful.

**Not worth building:** travel time. It needs a distance-matrix provider, a per-tech home
base, and a rewrite of slot generation. That is ServiceTitan's and Jobber's product.

### Law firms, small — SELL NOW

Not in the original list and it deserves to be. 165,491 employer offices. Clio starts at
$49/user/month, so they buy software. Consultations are one named attorney, fixed
duration, no money at booking, no geography, no PHI. The intake questions map cleanly to a
conflict check. **Qualify hard on calendar** — legal skews Microsoft 365 and that is a
hard no today.

### Salons and barbers — SELL ONLY TO MULTI-CHAIR

**Do not chase solo stylists.** The market is 838,264 solo operators whose alternative is
free (Square Appointments) or $28 (GlossGenius). You cannot charge a setup fee to someone
whose whole stack costs less than your setup fee.

A four-chair salon is a different business. They get: a public link, per-service types
with selectable durations, after-event buffers for clean-up, per-day caps, intake
questions, requires-confirmation, disable-rescheduling with a minimum notice, a
day-before reminder, no-show marking, and calendar sync.

**Missing: deposits.** No-shows are the core economic problem of this business and the
only lever here is recording that one happened, after the fact.
**Missing: a salon-level page.** "Book with whoever is free" does not exist in any form.
**Missing: a late-cancellation window.**

**Verdict: this vertical is unlocked by Phase 2 (team page) + Phase 3 (deposits), not
before.**

### Med spas — DO NOT SELL YET

All three defining needs are on the missing list.

1. **Deposits.** Treatments run $300–$2,000; a no-show is a real loss and the only tool
   here is recording it afterwards.
2. **Consent and personal health information.** Intake answers go verbatim into the Google
   Calendar event description with no toggle that stops it. No file or signature field.
   And the app store advertises a BAA app from a different company.
3. **A spa-level page** listing practitioners.

**The honest cheap version of consent:** a required checkbox, "I have read and agree to the
consent form," pointing at a form hosted elsewhere. An afternoon of configuration, and
what most small spas will accept.

**Comparable price point to know:** Mangomint charges **$70/month per phone line** as an
add-on to a $120/month base. That is the closest published comparable to what you are
selling, inside the exact vertical.

### Dentists and clinics — DO NOT SELL YET, BUT THIS IS THE PRIZE

The scheduling half genuinely works. The blocker is not features, it is posture.

**Every intake answer a patient types is written verbatim into the Google Calendar event
description**, alongside attendee name and email. Neither privacy toggle stops it:

- "Hide notes in calendar" touches only the free-text notes field. On the calendar path it
  replaces it with "Notes have been hidden by the organizer"
  (`packages/features/calendars/lib/CalendarManager.ts:379-381,465-467`); on the email path
  it drops it. **Booking-question answers are untouched.**
- "Hide calendar event details" sets the Google event's `visibility` to `private`
  (`packages/app-store/googlecalendar/lib/CalendarService.ts:205-207`) and marks the .ics
  `CLASSIFICATION:PRIVATE`. **Neither removes any content** — Google still receives every
  answer via `getRichDescription` → `getUserFieldsResponses` (`packages/lib/CalEventParser.ts:596`).

A clinic that turns both on and then asks "what brings you in today?" still ships that
answer to Google. **Never tell a healthcare prospect these toggles keep patient
information out of the calendar.** `Booking.responses` sits as plaintext JSON in Postgres.

**The cheap partial, about a day:** make the calendar description carry only title and
time. That closes the worst leak. It does not make you compliant.

**Why it is worth doing properly** — see §I.3. 340,282 employer dental and physician
offices, all paying $199+ for Weave or a quote-only NexHealth contract, all with a phone
that rings constantly and a front desk that cannot answer it.

## D.5 Assessing a vertical not listed here

Run §D.1. Then check three numbers: how many employer establishments exist, what they
already pay per month for software, and whether the phone is a bottleneck. If they pay
under $50/month for software today, walk away — the setup fee alone will kill it.

---

# PART E — The money

## E.1 What you are competing against

**All prices verified from the vendor's own pricing page on 3 September 2026.**

### AI receptionists (the products that answer the phone)

| Vendor | Monthly | Included | Overage |
|---|---|---|---|
| Dialzara | $29 / $99 / $199 / $349 | 60 / 220 / 500 / 1,000 min | $0.48 → $0.35/min |
| Rosie | $49 / $149 / $299 | 250 / 1,000 / 2,000 min | not published |
| Goodcall | $79 / $129 / $249 per agent | unlimited min, 100 / 250 / 500 unique customers | $0.50/extra customer |
| Smith.ai (AI only) | $0 / $150 / $500 | 25 calls / ~2–3 a day / ~10 a day | $3.00 → $1.67 per call |
| Slang.ai | $399 / $599 per location | not published | not published |
| Fresha AI Concierge | $99.95 add-on | not published | — |
| Mangomint Phone | **$70 per line** add-on | — | — |

### Human answering services (the budget line that already exists)

| Vendor | Monthly | Included |
|---|---|---|
| Abby Connect | $165 / $329 / $599 / $1,380 | 50 / 100 / 200 / 500 min |
| Ruby | $250 / $395 / $720 / $1,725 | 50 / 100 / 200 / 500 min |
| Smith.ai (human) | $300 / $810 / $2,100 | 30 / 90 / 300 calls |

**Quote-only, no published price:** Podium, Weave (only "starting from $199/month"), Numa,
AnswerConnect, NexHealth, ServiceTitan, Zenoti, AppFolio, Lawmatics.

### The two conclusions that matter

1. **You cannot win on price per minute.** Rosie sells 1,000 minutes for $149. Dialzara
   sells 500 for $199. That race is over and you are not going to win it as a solo
   founder with no volume discount.
2. **You do not have to.** Ruby charges **$250 for 50 minutes** and SMBs pay it. Smith.ai
   charges **$300 for 30 calls.** The willingness to pay is demonstrably in the
   $250–$700 band. What those buyers are paying for is *someone competent handling it*,
   not minutes.

**So the position is not "an AI receptionist." It is "a front desk that books."** The
$49 answering toys take a message. You put a confirmed appointment in the owner's Google
Calendar, with the intake questions answered, the confirmation email sent, and a
self-serve reschedule link the customer can use at 11pm. That is a different product and
it is priced against the software they already buy ($199–$439/month), not against the toys.

## E.2 What it actually costs you

### Voice, per minute (Retell, verified from retellai.com/pricing, 3 Sep 2026)

| Component | Cost |
|---|---|
| Retell voice infrastructure | $0.055/min |
| TTS — Retell / Cartesia / OpenAI voices | $0.015/min |
| Telephony (Retell-resold) | $0.015/min |
| LLM — GPT 4.1 | $0.045/min |
| **Working total** | **$0.130/min** |

Variants: GPT 5 nano drops it to **$0.088/min**. ElevenLabs TTS + GPT 5.5 raises it to
**$0.270/min**. PII redaction (needed for PHI) adds **$0.01/min**.

Fixed Retell items: **$2.00/number/month** ($10 for verified branded caller ID),
knowledge base $8/KB/month with the first 10 free, 20 concurrent calls included then
$8/month each. No platform fee on pay-as-you-go. $10 free credit on a new account.

Raw Twilio is slightly cheaper — $1.15/month per US local number, $0.0085/min inbound —
but Retell's bundled telephony is worth $0.85/month and ~$0.007/min to avoid the
integration.

### Fixed monthly cost of running the whole business today

| Item | Cost | Note |
|---|---|---|
| Hostinger VPS, 8 GB | **fill in your invoice** | Third-party sources report KVM plans from ~$5.49/mo intro with higher renewal. **Not verified — use your actual bill.** Budget $20–40 |
| Domain `bookyourslot.online` | ~$1–2/mo | |
| GitHub Actions | **$0 today, watch it** | 2,000 free min/month. Hourly uptime probe = ~720. CI ~15 + deploy ~20 per merge, and a cold image build burns 30–40. At ~30 merges/month you cross the cap |
| GHCR, Let's Encrypt, Telegram, Google Cloud | $0 | Free tiers |
| Retell platform | $0 | Pay-as-you-go |
| **Total fixed** | **~$40–60/month** | |

**One Front Desk customer at $349 covers every fixed cost you have, five times over.**
That is the single most important number in this document.

### Cost to serve one customer

| Tier | Included minutes | Voice cost | Number | Total COGS | Price | Gross margin |
|---|---|---|---|---|---|---|
| Front Desk | 500 | $65.00 | $2 | **$67** | $349 | **81%** |
| Practice | 1,200 | $156.00 | $2 | **$158** | $699 | **77%** |
| Regulated | 1,200 (with PII redaction) | $168.00 | $2 | **$170** | $999 | **83%** |
| Overage | — | $0.13/min | — | — | $0.45/min | **71%** |

Add roughly $2–5/customer/month for infrastructure share once you are past 10 customers.

## E.3 The offer

| | Setup (one-time) | Monthly | Voice minutes | Overage | Who it is for |
|---|---|---|---|---|---|
| **Booking** | $299 | $99 | — | — | Wedge only. Never lead with this |
| **Front Desk** | **$750** | **$349** | 500 | $0.45/min | 1–3 person business. **This is the product** |
| **Practice** | $1,500 | $699 | 1,200 | $0.40/min | 4–10 staff, one location. *Needs Phase 2* |
| **Regulated** | $2,500 | $999 | 1,200 | $0.40/min | Dental, medical. BAA, PII redaction, retention policy. *Needs Phase 5* |

**Why a setup fee at all, and why $750.** Because the setup is real: connecting their
Google Calendar, building their services and durations, writing their intake questions,
customizing the call script to their business, provisioning and routing the number,
and testing thirty calls before it goes live. That is a day of your time.

Precedent that makes it easy to defend: **Aesthetic Record charges $399 mandatory
startup and onboarding**, and **Shopmonkey charges $500 one-time for data migration** —
both inside verticals on your list. Agency setup fees for AI voice deployment are
reported at $297–$997 (vendor-published, not survey data — treat as indicative).

The setup fee also does two things a discount cannot: it filters out people who were
never going to pay, and it funds the month before the retainer compounds.

**Founding customer offer — first 5 only.** $0 setup, $199/month for 12 months, 300
minutes. In exchange, in writing: a logged case study with real before/after numbers from
their own phone line, a named testimonial, and two warm referrals. Say plainly that this
is below list and that it expires at five.

**Annual:** two months free (pay 10, get 12). Improves cash and cuts churn.

**Contract:** month-to-month after the first 90 days. A 90-day initial term is fair —
you did the setup — and it is short enough not to scare anyone.

## E.4 The revenue ladder

Assumes the mix above and direct COGS only (voice + numbers + infra share). Setup fees are
additional and one-time.

| Customers | Mix | MRR | COGS | **Monthly gross profit** |
|---|---|---|---|---|
| 1 (founding) | 1 × $199 | $199 | ~$70 | **$129** |
| 3 | 3 × $349 | $1,047 | ~$260 | **$787** |
| 10 | 8 × $349 + 2 × $699 | $4,190 | ~$900 | **$3,290** |
| 25 | 18 × $349 + 5 × $699 + 2 × $999 | $11,775 | ~$2,400 | **$9,375** |
| 50 | avg $450 | $22,500 | ~$4,800 | **$17,700** |

Plus setup: 10 customers at $750 = **$7,500 one-time**; 25 customers = **$18,750**.

**A realistic first year.** Nothing sells until Phase 1 ships (~week 8). If you land two
customers a month from month 3, you end month 12 with about 20 customers, roughly
**$7,000–8,000 MRR** and **$15,000** of collected setup fees. That is not a
life-changing year. It is a real business with proof, which is what year one is for.

**The two ceilings to know before you plan past 50.**

1. **Google's unverified-app cap is 100 users on one OAuth project.** You are at 1. Around
   80–100 connected businesses you must complete Google app verification — a real process
   with a security review. Start it at 40 customers, not at 95.
2. **One container, no replicas, no Redis, no calendar cache.** Every availability query
   hits Google live. Somewhere between 50 and 200 businesses this becomes the bottleneck,
   and the fix (calendar caching + a second replica) is a project, not a config change.

## E.5 What you spend to get there

| Item | Cost | Verified? |
|---|---|---|
| Your time, 16 weeks full time | opportunity cost only | — |
| Retell testing and development calls | $50–200 | Derived from Retell's published rates |
| HIPAA risk assessment (consultant-light) | $2,000–6,000 | Third-party vendor blog, indicative only |
| Move host to a BAA-signing provider (DigitalOcean 8 GB) | **$48/month** | ✅ digitalocean.com/pricing/droplets |
| HIPAA-eligible email (AWS SES under the AWS BAA, or Paubox) | ~$10–50/month | Partially verified |
| Legal review of your BAA and MSA templates | $1,500–3,000 | **Not verified.** Get quotes |
| E&O and cyber liability insurance | **Not verified** | Get quotes. Do not skip this if you touch PHI |
| Compliance automation (Vanta / Drata / Thoropass) | **No vendor publishes a price.** Marketplace-observed Vanta contracts for 1–50 employees on a single framework: $12,000–$28,000/year | Third-party (Vendr) |

**Read that last row twice.** A compliance platform costs more than your entire first
year of revenue. **Do not buy one.** For a single-framework, single-person vendor, a
documented risk analysis, written policies, a BAA template, encryption at rest, audit
logging and workforce training done by hand is the correct and affordable path. Revisit
automation at 50+ customers.

**Total out of pocket to a HIPAA-ready v2: roughly $5,000–12,000, plus 16 weeks.**
Everything before Phase 5 costs you under $500 in cash.

## E.6 CTAs — what you actually say

### The one asset nobody else has

You own a phone number attached to a working voice agent. **Nothing you can write beats
letting someone call it.** Every CTA below funnels to the same place.

> **"Call 313-XXX-XXXX right now and book yourself an oil change. Use a fake name. It
> takes ninety seconds and nobody at my desk lifted a finger. That's your phone line
> next Tuesday."**

Put that number on the website, in your email signature, on a business card, and in
every cold email. It is a demo that survives being forwarded.

### Cold email (auto shop, 3 lines)

> **Subject:** the phone at [Shop Name]
>
> Called your shop twice yesterday around 4pm and got voicemail both times. Not a
> complaint — you were busy, that's the point.
>
> Call 313-XXX-XXXX and book yourself an oil change. That's an AI front desk that books
> straight into a Google Calendar. Ninety seconds.
>
> If it's useful I'll set the same thing up on your line this week. If not, delete this.
>
> — Lohith

### Cold call opener (15 seconds)

> "Hi, is this the owner? I'll be quick — I build the thing that answers your phone when
> you're under a car. Can I text you a number to call so you can hear it instead of me
> describing it? … Great, what's the best number."

Then text the demo number. **The demo is the pitch.** You are not selling on that call.

### Walk-in (the highest-conversion channel for a first customer)

Go in at a dead hour. Ask for the owner. "I'm local, I build phone systems for shops like
yours. Can I show you something on my phone for two minutes?" Play a recorded call, or
call the demo number on speaker.

### Landing page

Primary CTA: **"Call the demo line"** with the number as the button.
Secondary CTA: **"Book a 15-minute setup call"** — pointed at your own BookYourSlot
booking page. *You dogfood your own product as the CTA.* That is worth saying out loud on
the call: "the link you just used is the product."

### The close

> "$750 to set it up, $349 a month. I do the whole setup — your calendar, your services,
> your questions, your script — and we test it together before it goes live. If it isn't
> booking real appointments in 30 days I'll refund the setup. Do you want to do it this
> week or next?"

An assumptive close with a real 30-day setup-fee guarantee. The guarantee costs you
nothing if you qualified properly, and it removes the only objection that actually
matters.

## E.7 Objections, and the honest answer

| They say | You say |
|---|---|
| "We already have [Housecall Pro / Tekmetric / Weave]." | "Keep it. This isn't a replacement, it's the phone. What happens today when three people call while you're with a customer?" |
| "My customers want to talk to a person." | "Half of them are calling at 8pm when nobody's there. Those are the ones this catches. It hands off to you during the day if they ask for a human." |
| "What if it books something wrong?" | "It reads back the name, the number and the time before it books, and every booking hits your calendar and your email instantly. You can cancel any of them in one tap." |
| "How much?" (too early) | "Depends on call volume. Before that — what calendar do you use?" *(This is the qualifying question. Ask it before you quote.)* |
| "We use Outlook." | **"Then I can't help you yet, and I'd rather tell you now than waste your afternoon."** Walk away. This is the deal-killer and there is no workaround today. |
| "Can it take a deposit?" | "Not today. It's on the build list for [month]. If deposits are the reason you'd buy, let's talk again then." *(Never fudge this.)* |
| "Is it HIPAA compliant?" | Before Phase 5: **"No, and I won't pretend otherwise. I can't take medical practices yet."** After Phase 5: "Yes, and I'll sign a BAA." Nothing in between. |
| "Can it text people?" | "Not yet — email only right now. SMS is in the build queue." |
| "I'll think about it." | "Fair. Can I set it up on a test number for a week so you can hear it answer your own calls? No charge, no setup fee until you say go." |

---

# PART F — The voice agent (the v2 flagship)

## F.1 The three front doors

Every business you sign gets the same three ways in. All three land in the same place: a
row in `Booking`, an event in the owner's Google Calendar, and a confirmation email.

| Door | Status today | What it needs |
|---|---|---|
| **1. Link** — customer opens the public booking page and books themselves | **LIVE** | Nothing |
| **2. Phone** — customer calls a number, a Retell agent takes the booking | **ABSENT** | This whole section |
| **3. Chat** — a widget on their site, same agent, typed | **ABSENT** | Reuses door 2 entirely. Build last |

Door 3 is nearly free once door 2 exists: the same gateway, the same tools, the same
config, a different transport. **Do not build it until door 2 has a paying customer.**

## F.2 What the code can do for a voice agent today — verified

This is the part that decides the whole plan, so it is stated precisely.

**There is no authenticated machine-to-machine API in the deployed application.** The
standalone REST API exists in the repo at `apps/api/v2` but the root `Dockerfile` prunes
it out of the build (`turbo prune --scope=@calcom/web --scope=@calcom/trpc`), and the
production compose file has exactly two containers. It is never built and never run.
Deploying it would need a Redis service, ~11 new env vars, a Traefik router, and a
rebuild of the web image with `NEXT_PUBLIC_API_V2_URL` set at build time. **Not worth it.**

The only `ApiKey` verification path that works in the web app is the Zapier/Make one
(`packages/app-store/_utils/findValidApiKey.ts`), it takes the key in a **query string**,
and its richest read returns the last **three** bookings. Useless here.

**So everything an external agent can do today is the same anonymous surface the browser
booking page uses:**

| Operation | Endpoint | Auth | Verified |
|---|---|---|---|
| Read a service and its questions | `GET /api/trpc/public/event` | none | ✅ publicProcedure |
| Get slots | `GET /api/trpc/slots/getSchedule` | none | ✅ publicProcedure |
| **Hold a slot** | `POST /api/trpc/slots/reserveSlot` | none | ✅ publicProcedure |
| Check a slot is still free | `GET /api/trpc/slots/isAvailable` | none | ✅ publicProcedure |
| Create a booking | `POST /api/book/event` | **none, and no CSRF** | ✅ |
| Reschedule | `POST /api/book/event` with `rescheduleUid` | none | ✅ |
| Cancel | `POST /api/cancel` | **CSRF: two requests** | ✅ |
| Look up a booking | `GET /api/trpc/bookings/find` | none | ✅ but returns almost nothing |

**`slots.reserveSlot` existing and being public is the single most useful find in this
audit.** It means the agent can hold the slot the moment the caller says "Tuesday at two
works," and then take their name and number without racing the website.

**Four hard blockers on using these endpoints directly:**

1. **Rate limit.** Traefik caps `POST /api/book/event` at **20/minute, burst 10, keyed on
   the TCP source address, with no per-tenant split.** Retell calls from a small set of
   egress IPs. Every one of your customers' bookings shares one bucket. This breaks at
   scale and it breaks silently.
2. **No auth means no scoping.** Anyone who learns an `eventTypeId` can book against it.
   Today that is also true of the public page, but the moment you publish an agent
   endpoint you are inviting it.
3. **Cancel needs two round-trips and a cookie jar** (`GET /api/csrf` → token + httpOnly
   cookie → `POST /api/cancel` with both; the cookie is consumed each time). Workable,
   fragile, and adds latency mid-call.
4. **Lookup returns nothing usable.** `bookings.find` deliberately returns only
   `{id, uid, startTime, endTime, description, status, paid, eventTypeId}` — no name, no
   phone, no email, no responses. *The agent cannot verify it found the right person's
   booking.* Rescheduling and cancelling by phone are impossible without fixing this.

**One more thing to know before you build:** if a service has
`requiresBookerEmailVerification` turned on, `/api/book/event` returns
`400 email_verification_required` and a voice agent can never satisfy it. That flag must
be off on every agent-bookable service.

**And a pleasant surprise:** `retell-sdk@4.41.0` and `retell-client-js-sdk@2.0.7` are
already dependencies of `apps/web`, and `packages/lib/constants.ts:260-270` already
defines `RETELL_AI_TEST_MODE` and `RETELL_AI_TEST_EVENT_TYPE_MAP`. Both constants have
**zero consumers** — leftovers from upstream. The packages are installed; no code uses
them.

## F.3 What to build: the Booking Gateway

A thin, authenticated, per-business API in the existing web app. Not a new service, not
Redis, not `apps/api/v2`. New route files under `apps/web/app/api/agent/v1/` that call the
same internal functions the public page already calls.

### The endpoints

Base: `https://bookyourslot.online/api/agent/v1`
Auth on every call: `Authorization: Bearer bys_agent_<key>`
The key row resolves to exactly one business (a `userId`, or later a `teamId`). Every
request is scoped to that business and cannot reach another.

| Method | Path | Purpose | Wraps |
|---|---|---|---|
| `GET` | `/services` | List bookable services with durations and required questions | `getPublicEvent` |
| `POST` | `/availability` | Slots for a service in a date range | `slots.getSchedule` |
| `POST` | `/hold` | Reserve a slot for N minutes | `slots.reserveSlot` |
| `POST` | `/book` | Create the booking | `handleNewBooking` |
| `POST` | `/lookup` | **Find a caller's bookings by phone or email** | new query — the gap |
| `POST` | `/reschedule` | Move a booking | `handleNewBooking` + `rescheduleUid` |
| `POST` | `/cancel` | Cancel a booking | `handleCancelBooking`, CSRF bypassed by key auth |

### The two request/response shapes that matter

**`POST /availability`**

```json
{
  "service_id": "oil-change",
  "from": "2026-09-08",
  "to":   "2026-09-12",
  "timezone": "America/Detroit",
  "max_results": 3
}
```
```json
{
  "service": { "name": "Oil change", "minutes": 30 },
  "slots": [
    { "id": "s_01", "start": "2026-09-08T14:00:00-04:00", "spoken": "Monday at two in the afternoon" },
    { "id": "s_02", "start": "2026-09-08T15:30:00-04:00", "spoken": "Monday at half past three" },
    { "id": "s_03", "start": "2026-09-09T09:00:00-04:00", "spoken": "Tuesday at nine in the morning" }
  ],
  "next_available": "2026-09-08T14:00:00-04:00"
}
```

**The `spoken` field is the whole trick.** Do not make the language model format times —
it will say "fourteen hundred hours" or "2026-09-08T14:00:00-04:00" out loud in front of
a customer. The server renders the phrase; the agent reads it verbatim. Same for dates,
prices and durations.

**`POST /book`**

```json
{
  "slot_id": "s_01",
  "hold_token": "h_9f2c...",
  "customer": {
    "name": "Maria Gonzalez",
    "phone": "+13135550142",
    "email": "maria.g@example.com"
  },
  "answers": {
    "vehicle": "2019 Honda Civic",
    "reason": "oil change and tire rotation"
  },
  "source": "voice",
  "call_id": "retell_call_abc123"
}
```
```json
{
  "ok": true,
  "booking_uid": "aB3xY9",
  "starts": "2026-09-08T14:00:00-04:00",
  "spoken_confirmation": "You're booked for Monday the eighth at two in the afternoon.",
  "confirmation_sent_to": "maria.g@example.com"
}
```

The gateway maps `customer` and `answers` onto the event type's `bookingFields`
`responses` object, so the agent never has to know the internal field names. It fills the
required base fields itself: `eventTypeId` as a number, `start`, `timeZone`, `language`,
and `metadata: {}` — all four are mandatory and all four are easy to forget.

**`POST /lookup` — the one genuinely new piece of code**

```json
{ "phone": "+13135550142" }
```
```json
{
  "bookings": [{
    "uid": "aB3xY9",
    "service": "Oil change",
    "starts": "2026-09-08T14:00:00-04:00",
    "spoken": "an oil change on Monday the eighth at two in the afternoon",
    "name_on_booking": "Maria G.",
    "can_reschedule": true,
    "can_cancel": true
  }]
}
```

Scoped to this business, upcoming bookings only, and **`name_on_booking` returns a first
name plus a last initial** so the agent can say "I have an oil change for Maria G. on
Monday" without reading a stranger's full identity to whoever dialled the number.

### Non-negotiable properties of the gateway

- **Idempotency.** Every write takes an `Idempotency-Key` header. A retried Retell tool
  call must not create two bookings. This is the number one cause of embarrassing
  double-bookings in voice systems.
- **Its own Traefik router with a per-key rate limit**, not the global
  `/api/book/event` bucket. Otherwise blocker (1) above bites on day one.
- **Latency budget: under 800ms.** Anything slower and the caller hears dead air. Retell's
  `speak_during_execution` covers a second or two ("let me check the book…") — beyond that
  it sounds broken.
- **Hold TTL of 3 minutes**, released automatically. Long enough to take a name and
  number, short enough that an abandoned call does not block a slot.
- **Every response has a `spoken` variant** of anything the agent will say aloud.
- **Structured errors the agent can act on**, not HTTP status codes:
  `SLOT_TAKEN`, `OUTSIDE_HOURS`, `TOO_SOON` (minimum notice), `LIMIT_REACHED` (daily cap),
  `BOOKING_NOT_FOUND`, `TOO_LATE_TO_CANCEL`, `NEEDS_HUMAN`. Each carries a `spoken` field
  telling the agent what to say.

## F.4 The Retell configuration

Six custom functions. Each posts to the gateway with the business's bearer key. Retell
speaks the `speak_during_execution` line while it waits.

| Function | Speaks while waiting | Calls |
|---|---|---|
| `list_services` | *(silent — pre-loaded into the prompt)* | `GET /services` |
| `check_availability` | "Let me look at the book for you." | `POST /availability` |
| `hold_slot` | *(silent, instant)* | `POST /hold` |
| `create_booking` | "Putting that in now." | `POST /book` |
| `find_my_booking` | "Let me pull that up." | `POST /lookup` |
| `change_booking` | "One moment." | `POST /reschedule` or `/cancel` |

`list_services` should be baked into the agent's prompt at provisioning time rather than
called live — the service list changes rarely and a tool call at the top of every conversation
costs a second of silence for nothing.

**Transfer to a human** is a Retell transfer node, not a tool. Triggered by: the caller
asks for a person, the agent fails the same step twice, an error returns `NEEDS_HUMAN`, or
the caller says anything that sounds like an emergency. **Every business must give you a
transfer number at setup. No exceptions.**

## F.5 The call script

Written for an auto shop. Same skeleton for every vertical; only the service list, the
intake questions and the greeting change.

> **Agent:** Thanks for calling Riverside Auto. This is Ava, the automated assistant — I
> can book you in or get you to someone. What can I do for you?
>
> **Caller:** Yeah, I need an oil change.
>
> **Agent:** Happy to book that. What day works best for you?
>
> **Caller:** Uh, sometime early next week?
>
> **Agent:** *[check_availability]* → "Let me look at the book for you." … I've got Monday
> at two in the afternoon, Monday at half past three, or Tuesday at nine in the morning.
>
> **Caller:** Monday at two.
>
> **Agent:** *[hold_slot — silent]* I've held Monday at two for you. Can I take your name?
>
> **Caller:** Maria Gonzalez.
>
> **Agent:** Maria Gonzalez — is that G-O-N-Z-A-L-E-Z?
>
> **Caller:** That's right.
>
> **Agent:** And the best number for you, in case we need to reach you about the car?
>
> **Caller:** Three one three, five five five, oh one four two.
>
> **Agent:** Let me read that back — three one three, five five five, oh one four two. Correct?
>
> **Caller:** Yep.
>
> **Agent:** And an email address so I can send you the confirmation?
>
> **Caller:** maria dot g at example dot com.
>
> **Agent:** maria dot g at example dot com. Got it. Two quick things the shop needs —
> what's the year, make and model?
>
> **Caller:** 2019 Honda Civic.
>
> **Agent:** And anything else you want them to look at while it's in?
>
> **Caller:** The tires feel off, can they check them.
>
> **Agent:** I'll note tire check. So: oil change and tire check, 2019 Honda Civic, Monday
> the eighth at two in the afternoon, for Maria Gonzalez. Shall I book that?
>
> **Caller:** Yes.
>
> **Agent:** *[create_booking]* → "Putting that in now." … You're all set. Confirmation is
> on its way to maria dot g at example dot com, and there's a link in it if you need to
> move it. Riverside Auto is at 1420 Woodward. Anything else?
>
> **Caller:** No, thanks.
>
> **Agent:** Thanks Maria, see you Monday.

**Six rules the script must never break.**

1. **Say who you are in the first sentence.** Not legally required today (see §F.7), but
   it is honest, it costs one clause, and callers behave better when they know.
2. **Confirm the phone number and the spelling of the name by reading them back.**
   Speech-to-text on a name over a bad line is the single biggest source of a wrong
   booking. Digits and names get read back. Everything else does not.
3. **Hold the slot before you collect details, not after.** Otherwise the slot goes while
   you spell a surname.
4. **Read the whole booking back before writing it.** One sentence: service, vehicle/detail,
   day, time, name.
5. **Never invent availability.** If the tool returns nothing, say what the tool said.
6. **Two failures on the same step means transfer.** Do not let it loop.

**Intake questions come last, after the slot is held and the identity is captured.** If
the caller hangs up mid-intake you still have a held slot and a phone number, and you can
call them back. If you ask intake first you have nothing.

## F.6 Failure modes and what the agent does

| What happens | Gateway returns | Agent says |
|---|---|---|
| Slot taken between hold and book | `SLOT_TAKEN` | "That one just went. I've got [next two] — do either work?" |
| Caller wants a time outside hours | `OUTSIDE_HOURS` | "They're open [hours]. Closest I have is [slot]." |
| Too soon (minimum notice) | `TOO_SOON` | "They need [n] hours' notice. Earliest I can do is [slot]." |
| Day is full (daily cap) | `LIMIT_REACHED` | "Monday's full. Tuesday at nine?" |
| Reschedule/cancel, no booking found | `BOOKING_NOT_FOUND` | "I can't find that on this number. Let me put you through." → transfer |
| Cancel inside the window | `TOO_LATE_TO_CANCEL` | "That one's too close to change. Putting you through now." → transfer |
| Gateway down or times out | *(no response)* | "I'm having trouble with the booking system. Let me get you to someone." → transfer |
| Caller asks for a person | — | Transfer immediately. Never negotiate. |
| Caller describes an emergency | — | Transfer immediately, no questions. **Configure this per vertical.** |
| Caller is abusive | — | One warning, then end the call |

**The hard rule: an unhandled situation ends in a transfer or a callback, never in the
agent guessing.** A wrong booking costs more than a missed one.

## F.7 What the agent must and must not say — the legal position

All verified 3 September 2026. **This is not legal advice; get your own before you take a
regulated customer.**

**Inbound calls (the customer dials the business) — this is your whole product.**

- **No federal consent requirement.** FCC Declaratory Ruling 24-17 (Feb 2024) confirmed
  that AI voices count as "artificial or prerecorded voice" under the TCPA, but the TCPA
  governs calls *initiated to* a consumer. It does not reach a call the consumer places.
- **No federal AI-disclosure requirement.** The FCC's July 2024 NPRM (FCC 24-84) proposed
  requiring an in-call AI disclosure. **It is still a proposal — no order has issued.**
- **California's bot law (BPC §17941) does not apply to phone calls.** Its text is limited
  to communicating "online." This is widely misreported.
- **California AB 3030** (health facilities, GenAI patient communications) requires a
  verbal disclaimer at the start and end of an audio interaction — but it applies only to
  communications containing "patient clinical information" and **expressly excludes
  "administrative matters, such as appointment scheduling and billing."** A booking-only
  agent at a California clinic does not trigger it. The moment it starts discussing
  symptoms, it does.
- **Utah** requires disclosure when there is a clear and unambiguous request to know
  whether the caller is a human or AI — reactive, not proactive. The 2025 amendments
  narrowed the law and expressly exclude routine automated messages such as appointment
  reminders.
- **Colorado** — the AI Act (SB 24-205) was **enjoined 27 April 2026** and has been
  repealed and replaced by SB 26-189 (signed 14 May 2026, effective 1 Jan 2027), which
  **drops the general AI-interaction disclosure requirement.** Anything you read saying
  "Colorado requires AI disclosure as of June 2026" is out of date.

**Net: no US jurisdiction today requires an AI receptionist to proactively announce
itself on a routine inbound booking call.** Utah requires an honest answer if asked.

**Disclose anyway.** One clause in the greeting. It is honest, it future-proofs you
against FCC 24-84, it is a differentiator you can put in the sales deck, and callers who
know they are talking to a machine speak more clearly.

**Outbound calls (you call the customer) — a completely different legal regime.**

Reminder calls, recall campaigns and waitlist calls all need **prior express consent**
under the TCPA because they use an artificial voice. Consent can be revoked "through any
reasonable means" (the FCC's revocation rule, effective 11 April 2025) and must be
honoured within **10 days**. **Do not build outbound voice until you have a consent
capture and revocation flow.** Reminders go by email or SMS.

**Call recording.** Twelve states require all-party consent: California, Connecticut,
Delaware, Florida, Illinois, Maryland, Massachusetts, Montana, New Hampshire, Oregon,
Pennsylvania, Washington. *(Compiled from a secondary source; verify each statute before
relying on it.)* Any agent that records or transcribes needs an announcement.

**Recommendation: do not record calls by default.** Retell transcribes for its own
operation; storing recordings buys you very little and adds a consent obligation, a
retention policy and a breach surface. If a customer wants recordings, announce them:
*"This call may be recorded for quality."*

## F.8 One setup, every business

Every business is the same agent driven by one config object. This is what makes the
product scalable and what makes a 45-minute onboarding possible.

```json
{
  "business_id": "bys_riverside_auto",
  "display_name": "Riverside Auto",
  "vertical": "auto_care",
  "timezone": "America/Detroit",
  "phone_number": "+13135550100",
  "transfer_to": "+13135550101",
  "gateway_key": "bys_agent_<hashed>",

  "greeting": "Thanks for calling Riverside Auto. This is Ava, the automated assistant — I can book you in or get you to someone. What can I do for you?",
  "closing":  "Thanks {first_name}, see you {spoken_day}.",
  "address_line": "1420 Woodward",

  "services": [
    { "id": "oil-change",  "say": "oil change",       "minutes": 30 },
    { "id": "brake-check", "say": "brake inspection", "minutes": 60 },
    { "id": "diagnostic",  "say": "diagnostic",       "minutes": 60, "requires_confirmation": true }
  ],

  "intake": [
    { "key": "vehicle", "ask": "What's the year, make and model?",              "required": true },
    { "key": "reason",  "ask": "Anything else you want them to look at?",       "required": false }
  ],

  "escalate_on": ["smoke", "brake failure", "accident", "won't start on the road"],
  "escalate_phrase": "That sounds like something you should speak to someone about right now — putting you through.",

  "compliance": {
    "record_calls": false,
    "disclose_ai": true,
    "phi": false
  }
}
```

**Per-vertical differences are small and predictable.** Only these four fields change:

| Vertical | services | intake | escalate_on | phi |
|---|---|---|---|---|
| Auto care | job types | vehicle, symptom | smoke, brakes, accident | false |
| HVAC | tune-up, repair, install quote | address, unit type, symptom | no heat, gas smell, no cooling in a heatwave | false |
| Salon | treatments | stylist preference, first visit? | — | false |
| Law firm | consult types | matter type, opposing party *(conflict check)* | anything time-barred, arrest | false |
| Med spa | treatments | first visit?, consent acknowledged | adverse reaction | **true** |
| Dental | exam, cleaning, emergency | insurance carrier, new patient? | pain level, swelling, trauma | **true** |

**Onboarding a new business is: fill in the JSON, provision a number, run twenty test
calls, go live.** Target 45 minutes once you have done five. That is what justifies the
$750 setup fee and what makes 50 customers possible for one person.

**When `phi: true`:** PII redaction on (+$0.01/min), recording off and not negotiable, a
signed BAA on file before the number goes live, and no clinical questions in `intake` —
"what brings you in" is a clinical question, "new patient or returning" is not.

---

# PART G — v2 as an organization

You asked: does the product support a 3-person salon or a 10-person clinic, and does that
need schema changes?

> ## The answer
>
> **Yes it supports it. No, you do not need schema changes.**
>
> The database was never cut down. `packages/prisma/schema.prisma` has been modified
> **exactly once** in this repository's entire history — the initial fork import — and
> the diff between that commit and HEAD on the schema file is **empty**. Every team
> table is intact. The round-robin engine is 889 lines and is *called on the live booking
> path today*. What was removed was screens.
>
> **v2 organization mode is a UI project, not a data project.**

## G.1 What is already there

| Piece | Lines in `schema.prisma` | State |
|---|---|---|
| `Team` (71 fields, incl. `isOrganization`, `parentId`, `slug`, `bookingLimits`) | 557–650 | Fully intact |
| `Membership` (`role`, `accepted`, `customRoleId`) | 744–765 | Fully intact |
| `MembershipRole` = `MEMBER` / `ADMIN` / `OWNER` | 738–742 | Intact |
| `Profile` (org-scoped usernames) | 534–555 | Fully intact |
| `OrganizationSettings` (25 fields) | 704–736 | Fully intact |
| `Host` (`isFixed`, `priority`, `weight`, `scheduleId`, `groupId`) | 61–85 | Fully intact |
| `HostGroup` | 87–98 | Fully intact |
| `SchedulingType` = `ROUND_ROBIN` / `COLLECTIVE` / `MANAGED` | 42–46 | Intact |
| `EventType.teamId`, `.schedulingType`, `.hosts`, `.assignAllTeamMembers`, `.isRRWeightsEnabled` | 171–262 | Fully intact |

**Working code that already uses them:**

- `packages/features/bookings/lib/getLuckyUser.ts` — the round-robin selector, 889 lines,
  DI-registered and invoked from `RegularBookingService.ts:1034` on the live booking path.
  It only *selects* for ROUND_ROBIN event types: `loadAndValidateUsers.ts:158-162` marks
  every host `isFixed` unless the scheduling type is ROUND_ROBIN, so the pool is empty for
  a personal booking.
- `update.handler.ts:456-547` — the full host write path: create/update/delete hosts,
  `isFixed` forced true for COLLECTIVE, host-group reconciliation, and a real guard that
  hosts must be accepted team members.
- Seven mounted host procedures: `getHostsForAvailability`, `getHostsForAssignment`,
  `exportHostsForWeights`, `getChildrenForAssignment`, `getHostsWithLocationOptions`,
  `massApplyHostLocation`, `searchTeamMembers`.
- `viewer.admin.createTeam` — a working admin mutation (PR #44) that creates a team with
  an OWNER and MEMBERs, all `accepted: true`, atomically. Callable at
  `POST /api/trpc/admin/createTeam` with an admin session. No UI calls it.

**And one thing that will surprise you:** `/event-types` is already fully team-aware.
`getUserEventGroups.handler.ts` builds groups from `MembershipRepository` and the listing
view renders team groups with their scheduling type. **The moment a `Membership` row
exists, the user gets a team tab on their Event Types page.** Untested territory in this
fork — test it before a customer finds it.

## G.2 What is missing

| Gap | Effort | Notes |
|---|---|---|
| **The authorization hole** (§A.10) | **1 day** | **Blocking. Do this first.** |
| Admin UI to provision a team | 2 days | The mutation exists; this is a form |
| Assignment tab (assign hosts, round-robin, weights) | 5 days | Pure React. `EventTypeWebWrapper.tsx:48` currently renders `null`, and the tab still appears in the rail for team event types (`useTabsNavigations.tsx:104-114` adds it whenever `team` is set) — clicking it shows a blank pane today. Every server procedure it needs is already mounted |
| Public team booking page `/team/[slug]/[type]` | 3 days | `EventRepository.getPublicEvent` already accepts `isTeamEvent`; `apps/web/lib/d/[link]/[slug]/getServerSideProps.tsx:56-61,112-118` is a working reference implementation |
| Team members screen | 4 days | `apps/web/modules/users/components/UserTable/*` is a **complete orphaned implementation** — table, invite modal, role-change modal, delete modal, bulk actions. It needs a `page.tsx` and a backing router (`viewer.teams` does not exist) |
| Role-based nav and settings | 3 days | See §G.3 |
| Invitation emails and accept flow | 3 days | Absent entirely. `VerificationToken` already has a `teamId` column |
| **Total** | **21 days** | |

**Today a team event type has no public booking URL.** The only live team booking path is
a private hashed link (`/d/<link>/<slug>`), which does resolve team events correctly. That
is a usable stopgap for a pilot.

## G.3 The three views

You want the admin to see everything and the business user to see something simple. Here
is exactly what stands between you and that.

**Today the sidebar has no role gating at all.** `apps/web/modules/shell/navigation/Navigation.tsx:14-69`
is a flat static array. Every logged-in user sees: Event Types, Bookings, Calendar,
Availability, **Apps (the full App Store and Installed Apps)**, More.

**Settings tabs are filtered in one place** —
`apps/web/app/(use-page-wrapper)/settings/(settings-layout)/SettingsLayoutAppDirClient.tsx`,
`getTabs()` at 29–246 and `useTabs()` at 265–374. Two hardcoded kill switches already do
the org-hiding: `orgBranding` is literally `null` at line 276, and permissions are all
`false` at `layout.tsx:19-23`.

### What a plain user sees right now that they must not

| Surface | Visible today? | Where to change it |
|---|---|---|
| **Apps / App Store** (`/apps`, `/apps/installed`, `/apps/categories`) | **YES** | `Navigation.tsx:37-63` + a server guard on the `/apps/**` pages |
| **Settings → Developer → Webhooks** | **YES** | `SettingsLayoutAppDirClient.tsx:106-110` |
| **Settings → Developer → OAuth clients** | **YES** | `:111-115` |
| **Settings → Developer → API keys** | **YES** | `:116-120` |
| Settings → Developer → API docs | already hidden | `:354-358` |
| Admin | admin-only ✓ | `:249, :364-370` |
| Organization | hardcoded off ✓ | `:276` |
| Insights | does not exist anywhere ✓ | — |

**Hiding the nav item is not enough.** `/settings/developer/webhooks` and `/apps` still
resolve by direct URL. Every hidden surface needs a server-side guard as well as a nav
change. Budget for both.

### Target model

| Role | Backed by | Sees |
|---|---|---|
| **Platform admin** (you) | `User.role = ADMIN` | Everything: app store, feature flags, user approval, team provisioning, the operator console |
| **Business owner** | `Membership.role = OWNER` or `ADMIN` | Their team's services, bookings, availability, members, and their own profile. **No app store, no developer settings, no admin.** |
| **Staff** | `Membership.role = MEMBER` | Their own bookings, their own availability, their own profile. Nothing else |

**`MembershipRole` already has exactly these three values.** Do not add a fourth. Map
"staff" → `MEMBER` and "owner" → `OWNER`. That needs zero DDL.

The one piece of plumbing this needs: the session must carry the active team and the
user's role in it. There is an `ctx.user.organization?.isOrgAdmin` shape in the codebase
but it is org-flavoured and `orgBranding` is hardcoded `null`. Expect ~1 day of context
work before the nav filtering is a one-line change.

## G.4 The setup-guide flow you described

> Admin activates the business → sends them a setup guide → they add their own details.

Everything needed already exists or is small:

1. **Admin provisions the team.** `viewer.admin.createTeam` + a form. *(2 days)*
2. **Admin invites the owner.** Invitation flow. *(part of the 3 days)*
3. **Owner receives a link, sets a password, lands on a guided setup** — connect Google
   Calendar, set opening hours, add services, add questions. **The onboarding flow already
   exists in this fork** (`onboarding-v3` is a real feature flag) and PR #43 fixed
   Google Meet defaults inside it. Extending it to a team context is ~2 days, not a rebuild.
4. **Owner adds staff.** Team members screen. *(4 days)*
5. **You configure the voice agent** from §F.8 and hand over the number.

**Total to the flow you described: about 12 engineer-days on top of the authorization
fix.** The remaining items in §G.2 — role-based views, the assignment tab and the public
team page — add 11 more. You need those for round-robin and a shared public link, but not
for a first multi-person pilot.

## G.5 The one decision to make deliberately

**Standalone teams, not organizations.** `Team` supports both shapes: a standalone team
(`parentId = null`, `isOrganization = false`) or a full organization with child teams and
`Profile` rows.

**Choose standalone.** Reasons, all verified:

- `Profile.organizationId` is **non-nullable**, and `Profile.username` is unique per org.
  Adopting the org shape means a data migration for every existing user.
- Organization mode needs `ORGANIZATIONS_ENABLED=1`, which switches on Next.js
  host-based subdomain rewrites. Your own deploy documentation warns that on an apex
  domain this **"degrades and hijacks /:user booking pages."** It would break every
  existing customer's booking link.
- Standalone teams give you everything a 3-person salon or a 10-person clinic needs:
  shared services, host assignment, round-robin, a members list, and role-based views.

**The only schema change you will ever need for this**, and only if team creation becomes
self-serve rather than an admin action: `@@unique([slug, parentId])` does not constrain
standalone teams, because Postgres treats NULLs as distinct. `TeamRepository` compensates
in application code with a check that is racy under concurrency. If two people can create
a team at the same time, add:

```sql
CREATE UNIQUE INDEX team_slug_standalone_key ON "Team"(slug) WHERE "parentId" IS NULL;
```

**That is the entire schema delta for organization mode.** One partial index, and only
when you go self-serve.

---

# PART H — The roadmap

## H.1 The sequencing rule

**Ship the smallest thing that can be sold, then sell it, then build the next thing.**

You have zero customers. The risk is not that you build the wrong feature — it is that
you spend four months building and discover nobody wanted it. So the roadmap is ordered
to put a sellable product in front of a real prospect at **week 5**, not week 20.

Two conversion notes on the estimates below. A day is ~6 productive hours. Nobody gets
five of those a week — meetings, deploys, debugging and life take a share. The calendar
column assumes **4 productive days per week**, which is honest for a solo founder who is
also selling.

## H.2 The phases

### Phase 0 — Stop the product lying · 7 days · ~2 weeks

Nothing here adds a feature. All of it removes a way to lose a customer.

| # | Task | Days |
|---|---|---|
| 0.1 | Hide the BAA-for-HIPAA app card. It advertises a $300/mo BAA you do not offer | 0.25 |
| 0.2 | Hide the Stripe app card and the event-type price UI | 0.25 |
| 0.3 | Hide or relabel WhatsApp / Telegram / Signal so they cannot read as SMS | 0.25 |
| 0.4 | Set `CRON_API_KEY` and schedule `/api/cron/attendeeReminder` — reminders are built and returning 401 | 0.5 |
| 0.5 | **Close the team authorization hole** in `eventTypes/util.ts:161-167` | 1 |
| 0.6 | Nightly `pg_dump` to offsite storage, encrypted, **plus one proven restore** | 1.5 |
| 0.7 | Encrypt `Credential.key`. Google refresh tokens are plaintext on every row | 2 |
| 0.8 | Calendar description redaction — write title and time only | 1 |
| 0.9 | Replace cal.com placeholders in the webhook ping payload | 0.25 |

**Done when:** a database dump no longer hands over every customer's calendar, a reminder
actually arrives, no screen advertises something that does not work, and you have restored
a backup into an empty database at least once.

### Phase 1 — The Booking Gateway and the voice agent · 14.5 days · ~4 weeks

**This is the product.** Everything in §F.

| # | Task | Days |
|---|---|---|
| 1.1 | **Spike (day 1):** point Retell at the existing public endpoints and book one real appointment end to end. Proves the flow before you build the gateway | 1 |
| 1.2 | `/api/agent/v1` routes: services, availability, hold, book | 3 |
| 1.3 | `/lookup` — find a caller's bookings by phone or email, scoped, first-name-plus-initial | 1.5 |
| 1.4 | `/reschedule` and `/cancel` (server-side, CSRF bypassed by key auth) | 1.5 |
| 1.5 | Bearer-key auth: hashed key per business, scoped to one `userId`/`teamId`, mirroring the existing `ApiKey.hashedKey` pattern | 1.5 |
| 1.6 | Idempotency keys on every write | 0.5 |
| 1.7 | `spoken` rendering for times, dates, durations, and structured error codes | 1 |
| 1.8 | Traefik router + per-key rate limit for `/api/agent/**` | 0.5 |
| 1.9 | Retell agent: prompt, 6 tool definitions, transfer node, per-business config loader | 2 |
| 1.10 | Number provisioning and routing | 0.5 |
| 1.11 | **Twenty scripted test calls** covering every failure mode in §F.6 | 1.5 |

**Done when:** you can hand someone a phone number, they call it, and a correct booking
appears in a Google Calendar with the confirmation email sent — twenty times out of twenty,
including the slot-taken and transfer paths.

> ### ► **SELL HERE. Week 5.**
> Front Desk tier, single-person businesses only: auto care, one-truck HVAC, small law.
> Founding-customer pricing. Get three paying customers before you write another line of
> code. If you cannot get three, the rest of this roadmap is the wrong plan and you need
> to know that at week 6, not week 20.

### Phase 2 — Organization mode · 21 days · ~5 weeks

Everything in §G. Unlocks multi-chair salons, insurance offices, and any practice with
more than one provider.

| # | Task | Days |
|---|---|---|
| 2.1 | Session carries the active team and the user's role in it | 1 |
| 2.2 | Admin team-provisioning UI over the existing `createTeam` mutation | 2 |
| 2.3 | Role-based nav and settings; **server guards, not just hidden links** | 3 |
| 2.4 | Team members screen — wire up the orphaned `UserTable` components + a new router | 4 |
| 2.5 | Invitation email and accept flow | 3 |
| 2.6 | Assignment tab — replace the `null` stub | 5 |
| 2.7 | Public team booking page `/team/[slug]/[type]` | 3 |

**Done when:** you provision a 4-person salon, the owner invites three stylists, one
service round-robins between them, and a customer books "next available" from a single
public link.

### Phase 3 — Deposits and no-show fees · 15 days · ~4 weeks

The single highest-value feature for salons, med spas and anyone with a no-show problem.

| # | Task | Days |
|---|---|---|
| 3.1 | Restore the deleted Stripe payment component at `PaymentPage.tsx:154` | 3 |
| 3.2 | Un-404 the Stripe webhook, verify the signature, mark `Payment.success`, confirm the booking | 3 |
| 3.3 | Stripe Connect so each business is paid directly, not through you | 4 |
| 3.4 | No-show fee capture using the existing `PaymentOption.HOLD` | 3 |
| 3.5 | Refund policy UI and end-to-end testing with real cards | 2 |

**Do not touch this before Phase 1 has paying customers.** It is a real project and it
carries money-handling risk.

### Phase 4 — Reminders that work · 5 days + regulatory wait · ~2 weeks

| # | Task | Days |
|---|---|---|
| 4.1 | Twilio SMS provider inside the existing reminder cron | 2 |
| 4.2 | Opt-in capture and STOP handling *(revocation honoured within 10 days — see §F.7)* | 2 |
| 4.3 | **Late-cancellation window** — clones the existing reschedule control | 1 |
| 4.4 | A2P 10DLC registration | *paperwork, 1–3 weeks of waiting* |

**Real SMS cost:** $0.0083/message plus carrier fees (~$0.0035–0.0045) ≈ **$0.012–0.013
per reminder.** Registration: ~$19.50 one-time (brand + campaign vetting), then
$1.50–$2.00/month per campaign. Trivial money, meaningful churn reduction.

### Phase 5 — HIPAA · 16 days + external cost · ~4 weeks

Only start this when you have **at least one dental or medical practice with a signed
letter of intent.** Do not build it speculatively.

| # | Task | Days |
|---|---|---|
| 5.1 | **Migrate off Hostinger.** It does not sign a BAA — and it is both your host *and* your SMTP | 3 |
| 5.2 | HIPAA-eligible email (AWS SES under the AWS BAA, or Paubox) | 2 |
| 5.3 | Audit logging — who accessed what, when | 4 |
| 5.4 | Retention and deletion policy, implemented not just written | 2 |
| 5.5 | Sign the Retell BAA; **verify the Enterprise-gating conflict first** (§I.3) | 0.5 |
| 5.6 | Risk analysis, written policies, workforce training, breach procedure | 4.5 |

### Totals

| Milestone | Engineer-days | Calendar |
|---|---|---|
| Phase 0 + 1 → **first sale** | 21.5 | **~5 weeks** |
| + Phase 2 → multi-person businesses | 42.5 | ~11 weeks |
| + Phase 3 → deposits | 57.5 | ~14 weeks |
| + Phase 4 → SMS | 62.5 | ~16 weeks |
| + Phase 5 → healthcare | 78.5 | **~20 weeks (~5 months)** |

## H.3 Explicitly not building

Write these down so you stop reconsidering them.

| Not building | Why |
|---|---|
| Travel time and route optimisation | Needs a distance-matrix provider, per-tech home bases, and a rewrite of slot generation. This is ServiceTitan's and Jobber's product |
| Resource booking (bays, rooms, chairs) | No resource model exists. Significant work, narrow payoff |
| Full organizations with subdomains | Breaks `/:user` booking pages on an apex domain — your own deploy notes say so |
| Workflows and routing forms | Dropped by migration. Rebuild from scratch, and n8n already covers the need |
| Deploying `apps/api/v2` | Needs Redis, 11 env vars, a second container and a web rebuild. The gateway in §F.3 is a tenth of the work |
| Outbound voice campaigns | TCPA consent regime. Not until Phase 4 gives you a consent record |
| A compliance automation platform | $12,000–28,000/year, observed. More than your first year of revenue |

## H.4 Running this in Claude Code

The repo already has the machinery. Use it rather than inventing a process.

- **One PR per numbered task above.** They are sized to be one PR each.
- **Spec first for anything over a day.** `specs/` and `SPEC-WORKFLOW.md` exist, with
  `specs/cancellation-reason-requirement` as a worked example. Write the spec, get it
  right, then implement — this is where Claude Code pays for itself.
- **`AGENTS.md` (symlinked as `CLAUDE.md`) is the standards file.** Point every session at
  it. `agents/` holds the rules and knowledge base.
- **The gate is `yarn type-check:ci --force` green, `TZ=UTC yarn test` green, and
  `yarn biome check --write .` clean.** CI now has a real `build` job that runs
  `next build`, so a change that only type-checks is not enough.
- **A useful working shape:** ask for the investigation first and the code second. "Read
  X, Y, Z and tell me what actually happens before you change anything" catches the
  stubbed-out-and-always-true class of bug that this codebase is full of.
- **Two deploy traps that have already cost this project time:**
  1. **Merging a change under `deploy/` does nothing.** `docker-compose.yml` and
     `remote-deploy.sh` are read from the host checkout at `/opt/bookyourslot` and are
     never updated by the pipeline. `git pull --ff-only origin main` on the VPS, then
     redeploy. This has silently swallowed two fixes and left the host six commits behind
     while every deploy reported success.
  2. **Never rotate `CALENDSO_ENCRYPTION_KEY` after go-live**, and never run
     `docker compose down -v` in production.

---

# PART I — Prerequisites: what to get ready in parallel

None of this is code. All of it can happen while you build, and every item here will
block a deal if it is missing on the day you need it.

## I.1 Before your first sales call — week 1

| Item | Effort | Cost |
|---|---|---|
| A demo phone number, live, on a demo business you control | half a day | $2/mo |
| One recorded demo call you can play or send | 1 hour | — |
| A one-page price sheet with the three tiers | 1 hour | — |
| Your own booking page as the "book a call with me" CTA | 30 min | — |
| A written list of the six qualifying questions (§D.1) taped to your desk | 10 min | — |
| A target list of 100 local businesses: auto shops, one-truck HVAC, small law | half a day | — |

**Do not build a website first.** The demo number is the website.

## I.2 Before your first paying customer

| Item | Effort | Cost | Notes |
|---|---|---|---|
| Business entity and bank account | — | varies | Whatever you have; do not let this block month 1 |
| A Master Services Agreement | — | **$1,500–3,000 (not verified — get quotes)** | Must cover: uptime expectations, data ownership, what happens on termination, and a limitation of liability |
| A written privacy policy that matches what you actually do | 2 hours | — | You already claim things on the site; make them true |
| Invoicing (Stripe Invoicing or similar) | 1 hour | ~3% | You do not need in-app billing. Invoice manually — the account **lock/unlock** switch in Settings → Admin → Users is your subscription enforcement |
| A written onboarding checklist | 2 hours | — | The §F.8 config plus calendar connection, services, questions, test calls |
| E&O and cyber liability insurance | — | **not verified — get quotes** | Optional for auto shops. **Not optional the day you touch PHI** |
| A 30-day setup-fee refund policy in writing | 30 min | — | It is in your close (§E.6). Make it real |

## I.3 Before your first healthcare customer

You chose to go after clinics properly. This is the honest list.

### The blocker nobody expects

> **Hostinger does not sign a BAA.** Their hosting agreement states the services "are not
> intended to provide a PCI or HIPAA compliant environment." Hostinger is currently
> **both your VPS host and your SMTP provider.** Both must move before a single patient
> record touches your system.

| Vendor | BAA? | Verified |
|---|---|---|
| **Hostinger** | **No** | Third-party quoting Hostinger's own ToS |
| **DigitalOcean** | **Yes** — Droplets, Kubernetes, Spaces, Volumes, Firewalls, backups. No cost or minimum stated | ✅ digitalocean.com/trust/hipaa-at-do |
| **AWS** | **Yes** — self-service via AWS Artifact, ~200 HIPAA-eligible services | ✅ aws.amazon.com/compliance/hipaa-compliance |
| **Vultr** | **Unclear** — holds a "SOC 2+ (HIPAA)" attestation but never states it signs a BAA | ⚠ |
| **Hetzner** | **Could not verify.** Assume no | ⚠ |
| **Google Workspace / Google Calendar** | **Yes.** Google Calendar is on the HIPAA Included Functionality list "as of August 31, 2026" | ✅ workspace.google.com/terms/2015/1/hipaa_functionality/ |
| **Retell AI** | **Yes, no fee** per their docs and blog. ⚠ **But their pricing page's plan table shows HIPAA/BAA as an Enterprise-only feature.** Direct conflict on their own site — **confirm in writing before you quote a clinic** | ⚠ conflict |
| **Twilio** | Yes, **but only on Security or Enterprise Edition, and the price is published nowhere.** Using Retell's bundled telephony under Retell's BAA sidesteps this entirely | ⚠ |

**Practical path: DigitalOcean 8 GB at $48/month + AWS SES under the AWS BAA + Retell's
BAA + the clinic's own Google Workspace BAA.** That is a working chain.

### What the law actually says

- **Appointment data at a medical practice is PHI.** A booking record contains at least
  three of the eighteen Safe Harbor identifiers — name, appointment date, phone number —
  and it relates to "the provision of health care to the individual."
- **You become a business associate** the moment you create, receive, maintain or transmit
  that data for a covered entity. The "conduit exception" does not cover you: it applies
  to mere transmission with transient storage. You store.
- **Appointment reminders are permitted without patient authorization** — HHS classifies
  them as *treatment*, not health care operations. (Commonly misstated, including in
  vendor marketing.)

### The case that should shape your thinking

> **MMG Fusion, LLC — settled with OCR on 5 March 2026.** A **dental practice software
> company operating as a business associate**, handling patient communications. A December
> 2020 intrusion put data on the dark web. The compromised PHI was **"names, phone numbers,
> addresses, email addresses, dates of birth, and appointment information"** — *exactly a
> booking system's data model.* Roughly **15 million individuals affected.** Settlement:
> $10,000 plus a three-year corrective action period. The findings: impermissible
> disclosure, **failure to conduct an accurate and thorough risk analysis**, and failure
> to notify the affected covered entities.

Note what OCR actually penalised: **not having done a risk analysis.** That is the
cheapest item on the entire list and it is the one that gets enforced.

**2026 penalty tiers:** $145 to $73,011 per violation for "no knowledge"; $73,011 to
$2,190,294 for willful neglect uncorrected; annual cap $2,190,294 per identical provision.

### The build list

| Item | Where |
|---|---|
| Documented risk analysis | Phase 5.6 — **do this first, it is what gets enforced** |
| Encryption at rest, including `Credential.key` | Phase 0.7 |
| PHI out of Google Calendar event descriptions | Phase 0.8 |
| Audit logging | Phase 5.3 |
| Retention and deletion policy, implemented | Phase 5.4 |
| BAA template you can sign with clinics | Legal review |
| BAAs signed upstream: host, email, Retell | Phase 5.1, 5.2, 5.5 |
| Breach notification procedure | Phase 5.6 |
| Workforce training (a team of one still needs the record) | Phase 5.6 |

**Do not buy Vanta or Drata.** No vendor publishes a price; marketplace-observed contracts
for a 1–50 person company on a single framework run **$12,000–28,000/year**. For one
person on one framework, hand-written policies plus a $2,000–6,000 third-party risk
assessment is the correct spend.

## I.4 Testing effort

Testing is not a phase. It is roughly **25% of every estimate above and it is already
included in them.** What is *not* included, and what you must budget separately:

| Test | When | Effort |
|---|---|---|
| Twenty scripted voice calls covering every failure mode | End of Phase 1 | 1.5 days *(counted in 1.11)* |
| A real end-to-end booking on production, verified in Google Calendar | After every deploy that touches booking | 10 min |
| **A backup restored into an empty database** | Phase 0, then quarterly | half a day |
| The standing SQL check for bookings that never reached a calendar | Weekly | 2 min |
| A shadow week — the agent answers a real customer's overflow calls, you review every transcript | Before their go-live | 1 hour/day for 5 days |

That last one is the one that closes deals and prevents disasters. **Sell it as part of
onboarding, not as a favour.**

```sql
-- Bookings that got a confirmation email but never reached a calendar.
SELECT count(*) FROM "BookingReference"
WHERE type = 'google_calendar' AND (uid = '' OR uid IS NULL);
```

Google integration failure is silent here — the key lookup throws outside the calendar
service's try block, so a broken calendar shows up only in the database. A booking still
saves and the customer still gets a "confirmed" email.

## I.5 When to pivot

Decide the triggers now, while you are calm.

| Signal | By when | What it means | What you do |
|---|---|---|---|
| **Fewer than 3 paying customers** | 8 weeks after Phase 1 ships | The offer or the vertical is wrong, not the product | Change vertical before you change code. Try dental front-desk overflow or law-firm intake |
| **They buy but do not renew at month 3** | month 4 | The agent is booking badly, or the value is not visible | Instrument it. Show them the booked-appointment count every month, in an email |
| **Every prospect asks for deposits first** | any time | Phase 3 is actually Phase 1 | Reorder. It is 15 days |
| **Every prospect uses Outlook** | after 20 calls | You picked the wrong vertical | Change vertical. Do not build the Outlook app |
| **You win on the booking page, not the phone** | after 10 sales | You are a scheduling company after all | Then price against Square ($0) and Fresha ($19.95) and rethink everything in §E |
| **A clinic signs a letter of intent** | any time | Healthcare is real | Start Phase 5 immediately. It is 5 weeks and it gates a $999 tier |

**The single measurement that decides everything:** for each customer, how many confirmed
appointments came in through the phone that would otherwise have gone to voicemail. If you
cannot show that number, you cannot defend $349/month at renewal.

---

# PART J — Other things you can automate, and how to prove they matter

## J.1 Read this before you put a statistic in a deck

I went looking for the numbers this industry runs on. Almost all of them are broken.

| Claim you will see everywhere | What it actually traces to | Verdict |
|---|---|---|
| "62% of calls to small businesses go unanswered" | 411 Locals, a small SEO company, **2016** | Ten years old, no methodology |
| "85% of callers won't call back" | Attributed to Forbes / BIA Kelsey; **the original study is not locatable** | **Do not cite** |
| "$1,200 is the average value of a missed home-services call" | Attributed to Invoca — **but the figure is not in the Invoca article.** Invoca uses an illustrative model: $4,500 furnace × 20% margin | **Misattributed. Do not use** |
| "73% of calls come outside 9-to-5" | An AI phone vendor's own blog, 2025 | Self-serving, no methodology |
| "% who don't leave a voicemail" | Circulating simultaneously as 85%, 90% and 67% | Mutually contradictory — proof of circular citation |
| "$150 billion a year in US no-show costs" | Untraceable to any primary study | **Do not use** |

**What did survive scrutiny:**

| Fact | Source |
|---|---|
| **18.8% mean no-show rate**, range 12.6% (audiology) to 25.7% (gastroenterology) | Kheirkhah et al., *BMC Health Services Research*, VA medical center + 10 regional hospitals, FY1997–2008 |
| **$196 cost per no-show** — *2008 dollars, VA setting, not private practice* | Same study. **The only defensible per-no-show figure I could verify** |
| Centralized phone reminders cut no-shows from 16.3% to 15.2% | Same study |
| **34% pooled first-appointment nonattendance** in nonspecialist outpatient mental health | *Psychiatric Services* meta-analysis, 2026 |
| Median US receptionist wage **$37,230** (May 2024) | US Bureau of Labor Statistics |
| ~half of appointments booked after hours, 5pm–9am | Zocdoc platform data — real volume, **methodology and year unstated** |
| 27% of calls to home-services businesses unanswered; <3% of callers pushed to voicemail leave a message | Invoca, 2024 — large call-analytics platform, **dataset size not disclosed** |

**There are no credible non-vendor no-show statistics for salons, spas, med spas or home
services. None. I looked.**

### So here is your unfair advantage

Every competitor is quoting the same broken numbers at your prospects. **You are going to
quote the prospect's own numbers back to them.** That is a better pitch than any statistic
and it costs you a week of a pilot.

**The instrumentation, in order:**

1. **Before you touch anything**, run their number through a forwarding step that logs
   every inbound call for two weeks: time, duration, answered or not.
2. That gives you three real numbers for *this business*: calls per week, percentage
   unanswered, and percentage arriving outside opening hours.
3. Go live. Count booked appointments attributed to `source: "voice"`.
4. Multiply by their own average ticket — **ask them for it, do not estimate it.**

### The case study template

> **[Business], [City] — [n] employees**
>
> **Before.** Over 14 days their line took **[n] calls**. **[n]** went unanswered, **[n]**
> arrived outside opening hours. Average ticket, their figure: **$[n]**.
>
> **What we did.** Front Desk on their existing number, [n] services configured, [n]
> intake questions, transfers to [name] during shop hours.
>
> **After.** In the first 30 days the agent booked **[n] appointments**, **[n]** of them
> outside opening hours. At their own average ticket that is **$[n]** of work that
> previously reached voicemail.
>
> **What it cost them.** $750 setup, $349/month.
>
> **In their words:** "[one sentence, recorded, with permission]"

**One real case study built this way beats every statistic in this industry.** Make it a
condition of the founding-customer discount, in writing, at signature.

## J.2 What else you can automate

Ordered by value per unit of work. Everything marked **works today** needs no new product
code — it is webhooks plus n8n, which you already run.

| # | Automation | Real problem | Status | Effort |
|---|---|---|---|---|
| 1 | **After-hours only** — the agent answers only when the office does not | The cheapest possible wedge. Zero threat to their receptionist, so nobody's job is on the line and the objection disappears | Needs Phase 1 | Config |
| 2 | **Review request after the visit** — `BOOKING_CREATED` → n8n → wait until after the appointment → email asking for a Google review | Local businesses live and die on Google reviews and nobody asks consistently | **Works today** | ~4 hours |
| 3 | **Waitlist fill** — `BOOKING_CANCELLED` → n8n → the agent calls the waitlist | A cancelled slot is a dead hour. This turns it into revenue and it is the most visible ROI in the whole product | Phase 1 + outbound consent | ~2 days |
| 4 | **No-show follow-up** — no-show marked → n8n → email with a rebooking link | The appointment is already lost; the customer usually is not | **Works today** | ~2 hours |
| 5 | **CRM and spreadsheet sync** — signed webhook → n8n → their sheet, HubSpot or Jobber | Every business asks for this by month two | **Works today** | ~2 hours each |
| 6 | **Recall campaigns** — six-month dental recall, seasonal HVAC tune-up | Reactivating a past customer is the cheapest revenue in any of these businesses | Phase 4 + **TCPA consent** | ~3 days |
| 7 | **Intake pre-fill for law firms** — conflict-check questions asked on the call, in the calendar event before the consult | An attorney walking into a consult already briefed | Phase 1 | Config |
| 8 | **Daily digest** — one email each morning: today's appointments, yesterday's calls, anything that needed a human | Makes your value visible every single day. **This is your renewal insurance** | **Works today** | ~4 hours |
| 9 | **Quote-to-appointment for HVAC** — quote sent → n8n → three days later the agent calls to book the install | Quotes go cold in silence | Phase 1 + outbound consent | ~2 days |

**#8 is underrated.** Churn happens because the owner forgets the thing is working. A
daily email with a number in it fixes that for four hours of build.

**#3 is the one that sells itself.** "Someone cancelled your two o'clock. By ten past two
it was filled." Nobody has to be convinced that is worth $349.

## J.3 Three problems worth building for, with the honest arithmetic

### The auto shop's service advisor

**The problem.** The person who answers the phone is also the person writing the ticket
and talking to the customer at the counter. Every call is an interruption to billable
work, and the calls that arrive while they are under a car go to voicemail.

**What you can honestly say:** *"Instrument your line for two weeks and we'll both see the
number. Right now neither of us knows it, and I'm not going to quote you someone else's."*

**What it is worth:** the value is one number times another — unanswered calls that would
have booked, times their average ticket. Their ticket is real; get it from them. **Never
present the multiplication as a projection. Present it as their own arithmetic.**

### The four-chair salon's no-shows

**The problem.** A no-show is a dead chair-hour that cannot be recovered. The stylist is
paid or waiting either way.

**Honest state today:** you can record a no-show. You cannot charge for one, cannot enforce
a late-cancellation window, and cannot send the 2-hour SMS that actually moves the number.
The only verified evidence that reminders help is modest — a VA study measured 16.3% → 15.2%
from centralized phone reminders.

**Conclusion: do not lead with no-show reduction until Phase 3 and 4 ship.** Lead with
after-hours booking, which you can actually deliver today.

### The dental front desk

**The problem.** A dental front desk is answering the phone, checking patients in, handling
insurance, and doing recall. The phone loses. This is the vertical where the pain is
highest, the budget is largest (Weave starts at $199/month, NexHealth will not even publish
a price), and the count is largest — **135,665 employer dental offices.**

**Why you cannot sell it yet:** it is PHI, you have no BAA, your host will not sign one,
and every intake answer currently lands in a Google Calendar description in plain text.

**Why it is worth five weeks:** it is the only vertical on your list where all three of
"big market," "already pays $200+," and "the phone is genuinely the bottleneck" are true at
once. **Phase 5 is not overhead. It is the unlock for the best market you have.**

---

# PART K — What you may and may not say

## You may say — every one of these is verified

- Customers book online and it lands in your Google Calendar instantly
- Your calendar blocks your booking page *(true while every calendar connection is
  healthy. **Never promise "you cannot be double-booked"** — see §A.6: a revoked Google
  token is silently dropped from conflict checking)*
- Automatic confirmation from your own domain, and a day-before reminder *(true only once
  Phase 0.4 ships — until then, do not say it)*
- Customers reschedule or cancel themselves and your calendar updates
- Ask any questions you like on the booking form
- Approve each booking manually if you want to
- Put the booking page on your own website
- Every booking can flow into your CRM or a spreadsheet automatically
- Your customers never need an account

## You may not say — every one of these is false today

- Anything about taking payment, deposits, or charging no-show fees
- Anything about SMS or WhatsApp messages
- Anything about HIPAA, BAAs, or suitability for patient data
- "Round-robin to whoever is free"
- "Works with Outlook"
- "Team scheduling" or "your whole staff on one page"
- Recording or transcribing meetings
- "Our API"
- Any missed-call or no-show statistic you have not measured yourself (§J.1)

## Update this list when a phase ships

| Ships | Moves from "may not" to "may" |
|---|---|
| Phase 0.4 | The day-before reminder |
| Phase 1 | Everything about the phone |
| Phase 2 | Round-robin, team page, "your whole staff on one page" |
| Phase 3 | Deposits, no-show fees |
| Phase 4 | SMS reminders, late-cancellation window |
| Phase 5 | HIPAA, BAA |

**Whoever ships the phase updates this table in the same PR.** That is the rule that keeps
this document true.

---

# PART L — Notes from the field

Space for the business side. Dated entries only. Do not edit status tags or file paths
elsewhere in this document — those are verified facts and changing them breaks the
document's purpose. If a status looks wrong, flag it and it gets re-verified against code.

## Discovery calls
<!-- Date · business type · what they asked for · what stopped the deal -->

## Objections heard
<!-- The objection, and the honest answer given -->

## Pricing conversations
<!-- What they said when they heard $750 + $349 -->

## Feature requests from real prospects
<!-- Only things a named prospect actually asked for -->

## Measured numbers from live customers
<!-- Calls, unanswered %, after-hours %, bookings by source, average ticket. See §J.1 -->

---

# Appendix A — Business term to technical term

| A business owner says | The product calls it | Where |
|---|---|---|
| "My services" | Event types | /event-types |
| "My opening hours" | Schedule | /availability |
| "Closed that day" | Date override | Schedule → Date overrides |
| "Time between jobs" | Buffer | Service → Limits |
| "No same-day bookings" | Minimum booking notice | Service → Limits |
| "Only 8 jobs a day" | Booking frequency limit | Service → Limits |
| "I approve each one" | Requires confirmation | Service → Advanced |
| "Questions I ask" | Booking questions | Service → Advanced |
| "Group class" | Seats per time slot | Service → Advanced |
| "Where we meet" | Location | Service → Basics |
| "Hidden link" | Hidden event type / private link | Service → Advanced |
| "Turn a customer off" | Lock user | Settings → Admin → Users |
| "Send it to my CRM" | Webhook | Settings → Developer → Webhooks |
| "Whoever's free" | Round-robin scheduling type | Not available until Phase 2 |
| "Our whole team on one page" | Team event type + public team page | Not available until Phase 2 |

---

# Appendix B — Numbers that could not be verified

Do not put any of these in a proposal without checking first.

| Number | Status |
|---|---|
| **Retell HIPAA plan gating** | Their pricing page lists HIPAA/BAA as an Enterprise feature; their docs and their own blog say it is available on pay-as-you-go at no fee. **Direct conflict on retellai.com. Confirm in writing before quoting a clinic** |
| Your Hostinger VPS monthly cost | Use your actual invoice. Third-party sources report KVM plans from ~$5.49/mo intro with higher renewal |
| Twilio Security Edition price (required for a Twilio BAA) | Published nowhere on twilio.com |
| Google Workspace BAA edition eligibility and fee | Not stated on any Google-owned page. Edition list is third-party (HIPAA Journal) |
| AWS BAA fee | No AWS page explicitly states it is free. Treat "free" as inferred |
| Vultr BAA | Holds a "SOC 2+ (HIPAA)" attestation, never states it signs a BAA |
| Hetzner HIPAA position | No statement found anywhere. Assume no |
| Legal fees (MSA, BAA template) | Get quotes |
| E&O and cyber insurance | Get quotes |
| Vanta / Drata / Thoropass pricing | **No vendor publishes a price.** Only marketplace-observed figures exist |
| Weave, Podium, Numa, NexHealth, ServiceTitan, Zenoti, AppFolio, Lawmatics, AnswerConnect | All quote-gated |
| Ruby, Rosie, Slang.ai overage rates | Not published |
| ElevenLabs Agents overage rate | Their page renders an implausible figure; only stale (Feb 2025) blog numbers exist |
| Synthflow self-serve pricing | No longer published. Only a $30,000/year enterprise floor |
| Bland AI BAA tier and cost | "Flexible BAA terms," no number |
| No-show rates for salon, spa, med spa, home services | **No credible non-vendor source exists** |
| Dental no-show rate | No ADA or peer-reviewed figure located |
| SMB willingness-to-pay for AI receptionists | **No independent survey appears to exist** |
| Med spa average revenue per location | Inside AmSpa's $995 paywalled report |
| All-party-consent state list | Compiled from a secondary source; individual statutes not each verified |
| 2026 HIPAA penalty amounts | From a law-firm summary of the Federal Register notice, not the notice itself |

---

# Appendix C — Sources

**Voice and telephony:** [Retell pricing](https://www.retellai.com/pricing) ·
[Retell compliance](https://docs.retellai.com/general/compliance) ·
[Retell concurrency](https://docs.retellai.com/deploy/concurrency) ·
[Retell HIPAA blog](https://www.retellai.com/blog/hipaa-compliant-voice-ai-without-enterprise-contract) ·
[Twilio voice pricing](https://www.twilio.com/en-us/voice/pricing/us) ·
[Twilio SMS pricing](https://www.twilio.com/en-us/sms/pricing/us) ·
[Twilio A2P 10DLC fees](https://support.twilio.com/hc/en-us/articles/1260803965530-What-pricing-and-fees-are-associated-with-the-A2P-10DLC-service) ·
[Twilio HIPAA](https://www.twilio.com/en-us/hipaa) ·
[Twilio HIPAA accounts](https://www.twilio.com/docs/iam/twilio-editions/hippa) ·
[Vapi pricing](https://vapi.ai/pricing) · [Bland pricing](https://www.bland.ai/pricing) ·
[Synthflow pricing](https://synthflow.ai/pricing) ·
[ElevenLabs Agents pricing](https://elevenlabs.io/pricing/agents)

**Competitors:** [Smith.ai AI](https://smith.ai/ai-receptionist) ·
[Smith.ai](https://smith.ai/pricing) · [Ruby](https://www.ruby.com/pricing/) ·
[Slang.ai](https://www.slang.ai/pricing) · [Rosie](https://heyrosie.com/pricing) ·
[Dialzara](https://dialzara.com/pricing) · [Goodcall](https://www.goodcall.com/pricing) ·
[Abby Connect](https://www.abby.com/pricing) · [Weave](https://www.getweave.com/pricing/) ·
[Podium](https://www.podium.com/pricing/) · [Numa](https://numa.com/pricing) ·
[AnswerConnect](https://www.answerconnect.com/plans)

**Vertical software:** [Housecall Pro](https://www.housecallpro.com/pricing/) ·
[Jobber](https://www.getjobber.com/pricing/) · [ServiceTitan](https://www.servicetitan.com/pricing) ·
[Fresha](https://www.fresha.com/pricing) · [GlossGenius](https://glossgenius.com/pricing) ·
[Booksy](https://biz.booksy.com/pricing) · [Square Appointments](https://squareup.com/us/en/appointments/pricing) ·
[Vagaro](https://www.vagaro.com/pro/pricing) · [Boulevard](https://www.joinblvd.com/pricing) ·
[Mangomint](https://www.mangomint.com/pricing/) · [Aesthetic Record](https://www.aestheticrecord.com/pricing) ·
[Zenoti](https://www.zenoti.com/pricing-zenoti) · [NexHealth](https://www.nexhealth.com/pricing) ·
[Clio](https://www.clio.com/pricing/) · [Lawmatics](https://www.lawmatics.com/pricing/) ·
[Tekmetric](https://www.tekmetric.com/pricing) · [Shopmonkey](https://www.shopmonkey.io/pricing) ·
[Buildium](https://www.buildium.com/pricing/) · [AppFolio](https://www.appfolio.com/pricing)

**Infrastructure:** [DigitalOcean droplet pricing](https://www.digitalocean.com/pricing/droplets) ·
[DigitalOcean HIPAA](https://www.digitalocean.com/trust/hipaa-at-do) ·
[AWS HIPAA](https://aws.amazon.com/compliance/hipaa-compliance/) ·
[AWS HIPAA-eligible services](https://aws.amazon.com/compliance/hipaa-eligible-services-reference/) ·
[Vultr compliance](https://www.vultr.com/legal/compliance/) ·
[Google HIPAA Included Functionality](https://workspace.google.com/terms/2015/1/hipaa_functionality/) ·
[Google Workspace HIPAA](https://knowledge.workspace.google.com/admin/compliance/hipaa-compliance-with-google-workspace-and-cloud-identity) ·
[Vanta](https://www.vanta.com/pricing) · [Drata](https://drata.com/pricing) ·
[Thoropass](https://thoropass.com/pricing/) · [Vendr — Vanta observed contracts](https://www.vendr.com/marketplace/vanta)

**Law and regulation:** [HHS FAQ 286 — appointment reminders](https://www.hhs.gov/hipaa/for-professionals/faq/286/are-appointment-reminders-allowed-under-hipaa-without-authorization/index.html) ·
[HHS Privacy Rule](https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html) ·
[HHS de-identification / Safe Harbor](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html) ·
[HHS business associates](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html) ·
[OCR — MMG Fusion settlement](https://www.hhs.gov/press-room/ocr-mmg-fusion-hipaa-agreement.html) ·
[HHS resolution agreements](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/index.html) ·
[FCC Declaratory Ruling 24-17](https://docs.fcc.gov/public/attachments/FCC-24-17A1.txt) ·
[FCC AI robocall NPRM](https://www.fcc.gov/document/fcc-proposes-first-ai-generated-robocall-robotext-rules-0) ·
[California BPC §17941](https://law.justia.com/codes/california/code-bpc/division-7/part-3/chapter-6/section-17941/)

**Market data:** US Census Bureau, County Business Patterns 2023 and Nonemployer Statistics
2023 (parsed directly from www2.census.gov) ·
[BLS receptionist wage](https://www.bls.gov/ooh/Office-and-Administrative-Support/Receptionists.htm) ·
[Kheirkhah et al., BMC Health Services Research](https://link.springer.com/doi/10.1186/s12913-015-1243-z) ·
[Greenup & Best, BMC Health Serv Res 2025](https://link.springer.com/article/10.1186/s12913-025-12826-2) ·
[AmSpa 2024 Medical Spa State of the Industry](https://americanmedspa.org/blog/amspas-2024-medical-spa-state-of-the-industry-report-shows-medical-aesthetics-continues-steady-growth-after-pandemic)

---

# Appendix D — How this was verified

**Code.** Four independent investigations of the repository at `main @ bfe849b`, each
instructed to refute rather than confirm: the external HTTP surface and booking API; the
teams, organizations and permissions layer; payments, notifications, feature flags and
infrastructure; and the existing document's claims. Findings are quoted with file paths
and line numbers. Where a claim could not be verified by reading code, it says so.

**Market.** Two parallel research passes on 3 September 2026, fetching vendor pricing
pages, government statistics, statutes and regulator publications directly. Every price
carries a source URL. Vendor marketing is labelled as vendor marketing. Six commonly cited
industry statistics were traced to their origin and found to be unusable — see §J.1.

**What was not done.** No running server was queried. No production database was read
during this pass. No load testing. No legal review. The Retell HIPAA gating conflict was
found but not resolved — that needs a human asking Retell directly.

---

# Change log

| Date | Change |
|---|---|
| 2026-09-02 | First version. Parts 1–7: implemented features, vertical fit, what not to say |
| 2026-09-03 | Full rewrite into one engine document. Added: money and pricing with verified competitor and cost data (§E), the voice agent design and gateway spec (§F), organization v2 with the verified schema finding (§G), a phased roadmap with engineer-days (§H), prerequisites including the HIPAA reality (§I), automations and the statistics warning (§J). Corrected the README's "teams removed" claim. Documented the team authorization hole, the unwired reminder cron, and the Hostinger BAA blocker |

**Related documents.** `docs/BACKLOG.md` (engineering debt) · `docs/N8N.md` (automation
setup) · `docs/TESTING.md` (test procedures) · `docs/APP-STORE.md` (integration
reference) · `deploy/production/CHECKLIST.md` (launch and operations) ·
`AGENTS.md` (engineering standards) · `SPEC-WORKFLOW.md` (how to spec a change)
