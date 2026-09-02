# BookYourSlot: Product Source of Truth

**The one document.** Everything the product does today, everything it does not,
what each of those means for a business buyer, and what to build next.

| | |
|---|---|
| **Version of record** | `main @ 86f2d34`, deployed and healthy in production |
| **Live at** | https://bookyourslot.online |
| **Last full verification** | 2 September 2026 |
| **Owner** | Lohith Kumar, hello@bookyourslot.online |

---

## How to use this document

This file has two readers and both are first class.

- **Business Owner view** answers: what can I sell, to whom, and what must I never
  claim. Written in the language a prospect uses.
- **Technical Developer view** answers: where does this live, what is its real
  status, and what would it cost to change. Written with file paths.

Every capability below carries both. Where they disagree, the developer view wins,
because it is the one checked against running code.

### Status vocabulary, used consistently

| Tag | Meaning | Safe to sell? |
|---|---|---|
| **LIVE** | Works and a business owner can configure it in the UI today | Yes |
| **BUILT, NO UI** | The code runs but nothing in the interface reaches it | Only if you operate it for them |
| **SCHEMA ONLY** | Database columns or dead components exist, no working path | No |
| **ABSENT** | Does not exist in this codebase | No, and say so plainly |

### Where the business team adds notes

Add your own material under the `> **Business note:**` markers, and in
[Part 7](#part-7-business-team-notes). Do not edit the status tags or the file
paths: those are verified facts and changing them breaks the document's purpose.
If a status looks wrong, flag it and it will be re-verified against the code.

### The standing rule

**Never claim a feature that does not work.** Everything in this document was
checked against the repository, the live site, or the production database. Items
that could not be verified are marked as such rather than assumed.

---

# Part 1: What is implemented

## 1.1 Services and pricing structure (event types)

> **Business meaning:** Each thing you sell is a "service" with its own booking
> link, duration, questions and rules. A salon has one per treatment, an auto shop
> one per job type, an agent one per meeting type.

| Capability | Status | Where the owner configures it |
|---|---|---|
| Service name, URL, description, duration | LIVE | Event Types > service > Basics |
| Multiple selectable durations | LIVE | Basics > "Allow multiple durations" |
| Multiple services per account, unlimited | LIVE | Event Types > New |
| Hidden services (link works, not listed publicly) | LIVE | Event Types > toggle |
| Private one-off links with expiry and usage cap | LIVE | Advanced > Private links |
| Redirect to your own page after booking | LIVE | Advanced |

**Sharp edges.**
Durations come from a fixed menu (5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 80,
90, 120, 150, 180, 240, 300, 360, 420, 480 minutes). A 35 minute or 100 minute
service cannot be offered as a selectable duration, only as its own service.
Turning on seats silently clears the multiple-duration setting.

**Developer view.** `apps/web/modules/event-types/components/tabs/setup/EventSetupTab.tsx:131,192,322-334`;
duration menu at `packages/lib/constants.ts:79-85`.

> **Business note:**

---

## 1.2 Where the appointment happens (locations)

> **Business meaning:** This is what makes the product work for physical
> businesses, not just video calls. It covers the customer's address, your shop
> address, and phone appointments.

Six built-in location types are always available on a personal service, with no
app install required:

| Location type | What it does | Who needs it |
|---|---|---|
| **In person (attendee address)** | Customer types their address on the booking page; it lands in the calendar event's location field, so it is tappable and opens Maps on a phone | HVAC, mobile services |
| **In person (organizer address)** | You publish your shop address | Salons, auto care, clinics, Med Spas |
| **Custom attendee location** | Free text from the customer | Flexible field work |
| **Attendee phone number** | Customer gives a number, you call them | Insurance, consultations |
| **Organizer phone number** | You publish a number to call | Inbound phone consults |
| **Link meeting** | Any URL you paste | Anything |

Plus **Google Meet**, which works and is the practical default for video.

**Sharp edges.**
The value of Organizer Address, Organizer Phone and Link meeting is stripped from
the public booking page unless "Display on booking page" is ticked per location.
An auto shop that types its address and forgets that checkbox has customers who
only learn the address from the confirmation email.
Addresses are unvalidated free text. Nothing checks the address is real or inside
your service area.
Switching a service from Google Meet to attendee address silently removes the join
link from the reminder email.

**Developer view.** `packages/app-store/locations.ts:105-205`; the address input is
rendered by `packages/features/bookings/lib/getBookingFields.ts:147-151`; written to
Google at `packages/app-store/googlecalendar/lib/CalendarService.ts:213`.

> **Business note:**

---

## 1.3 Working hours and availability

| Capability | Status | Where |
|---|---|---|
| Named schedules with multiple ranges per day | LIVE | Availability |
| Per-service schedule (different hours per service) | LIVE | Service > Availability tab |
| Date overrides (closures, special hours) | LIVE | Schedule > Date overrides |
| Out of office / vacation blocks | LIVE | Settings > Out of office |
| Public holiday auto-blocking by country | LIVE | Settings > Out of office > Holidays |
| Availability troubleshooter ("why is Tuesday closed?") | LIVE | /availability/troubleshoot |
| Timezone shown correctly to the customer | LIVE | Automatic |

**Sharp edges.**
The **schedule's** timezone drives slot generation, not your profile timezone. A
shop that changes its profile timezone and forgets the schedule will publish the
wrong hours.
Date overrides belong to one schedule, not the account, so a business with three
schedules enters the same holiday closure three times. Adding a new override does
support picking several dates at once.
Public holiday blocking needs `GOOGLE_CALENDAR_API_KEY` on the server. If a user
picks a country and that key is missing, the booking page breaks rather than
degrading gracefully.
If an assigned schedule is deleted, the service quietly falls back to the default
schedule instead of erroring, so it can start taking bookings on the wrong hours.

**Developer view.** `packages/features/availability/lib/getUserAvailability.ts:425-434`
(timezone), `:822-849` (holidays); `packages/lib/holidays/GoogleCalendarClient.ts:40-43`.

> **Business note:**

---

## 1.4 Booking controls that protect the schedule

> **Business meaning:** These are the rules that stop customers booking at 3am, or
> booking twelve slots, or booking with no notice.

| Control | Status | Business use |
|---|---|---|
| Buffer before / after the appointment | LIVE | Clean-up time, travel pad, room turnover |
| Minimum booking notice | LIVE | "No same-day bookings" |
| Time-slot interval | LIVE | Start times on the hour or half hour |
| How far ahead customers can book | LIVE | Rolling days, or a fixed date range |
| Bookings per day / week / month / year | LIVE | Bay count, chair count, daily capacity |
| Total booked minutes per day / week / month | LIVE | Cap hours rather than count |
| Cap on upcoming bookings per customer | LIVE | Stop one person hoarding slots |
| Offset start times | LIVE | Show 9:05 instead of 9:00 |

**Sharp edges.**
Buffers are a fixed menu (0, 5, 10, 15, 20, 30, 45, 60, 90, 120). A 25 minute
drive-time pad is not expressible.
The rolling-window mode that skips unavailable days is hard-capped at 61 days.
Booking with a longer horizon needs the plain rolling or fixed-range mode.
The per-customer cap is **per service**, and it counts only accepted bookings. A
customer capped on "Oil change" can still book "Tire rotation" the same day, and on
a requires-confirmation service they can stack unlimited pending requests until you
approve one.

**Developer view.** `packages/features/eventtypes/components/tabs/limits/EventLimitsTab.tsx:498-854`;
61 day cap at `packages/lib/constants.ts:205`.

> **Business note:**

---

## 1.5 Taking the booking

| Capability | Status | Notes |
|---|---|---|
| Public booking page | LIVE | Mobile responsive |
| Booking questions / intake form, 13 answer types | LIVE | Short text, long text, number, email, phone, address, URL, single-select, multi-select, radio, checkbox group, single checkbox, multi-email |
| Required vs optional per question | LIVE | |
| Requires confirmation (you approve each booking) | LIVE | Always, or only under a notice threshold |
| Seats per time slot (group classes) | LIVE | Yoga, workshops, group sessions |
| Recurring bookings | LIVE | Weekly, monthly, yearly; up to 24 occurrences |
| Embed the booking page on your own website | LIVE | Event Types > Embed |

**Sharp edges.**
**There is no file upload and no signature field.** No insurance card, no driving
licence photo, no signed consent form. This rules out the intake that doctors and
Med Spas actually need.
There is no conditional logic. Every question shows to every customer. Routing
forms, which would have solved this, were removed from this fork.
The Name and Location questions can be relabelled but never hidden. A shop with one
fixed address still has to show a Location question.
Turning seats on force-disables requires-confirmation, so you cannot screen and seat
the same service.
Approving a pending booking is one tap from a signed link in your email and needs no
login. Convenient, but anyone who receives a forwarded copy of that email can approve
or reject the booking.

**Developer view.** `packages/features/form-builder/fieldTypes.ts` defines 15 types,
of which 2 are `systemOnly: true` (`name` at :15, `radioInput` at :136), leaving 13
a business can add. Approval links at `apps/web/app/api/link/route.ts`.

> **Business note:**

---

## 1.6 Calendars

| Provider | Status | Notes |
|---|---|---|
| **Google Calendar** | LIVE | Two-way. Busy times block your slots; bookings write real events with Meet links |
| **Apple Calendar / iCloud** | LIVE | Needs an app-specific password from appleid.apple.com |
| **CalDAV** (Fastmail, Nextcloud, Zimbra, SOGo) | LIVE, beta | Owner must know their CalDAV URL |
| **Outlook / Office 365 / Exchange** | ABSENT | Deleted in the app prune. Not recoverable by a setting |

**This is a qualifying question, not a support question.** Insurance offices and
HVAC companies skew Microsoft. Ask what calendar they use before the demo, not
after.

**Sharp edges, and one of them causes double bookings.**
When a Google token is revoked and the credential is flagged invalid, that calendar
is **silently dropped from conflict checking**. The booking page keeps offering
times over real appointments. Nobody is told.
A calendar connection with zero calendars ticked is skipped entirely rather than
defaulting to the primary, with the same result.
Only the primary calendar is auto-ticked on connect. A shared "Shop Floor" calendar
must be ticked by hand or its events block nothing.
Apple and CalDAV have no invalidation path at all, so a changed password zeroes the
booking page with no warning.

**Developer view.** `packages/features/calendars/lib/getCalendarsEvents.ts:101,159-166`.

> **Business note:**

---

## 1.7 After the booking

| Capability | Status | Notes |
|---|---|---|
| Confirmation email to customer and to you | LIVE | Authenticated: SPF, DKIM, DMARC all pass |
| Calendar invite (.ics) attached | LIVE | |
| Day-before reminder email to the customer | **BUILT, NO UI** | Includes the Google Meet join link |
| Reschedule by the customer | LIVE | Moves the real calendar event |
| Reschedule requested by you | LIVE | Bookings > row menu |
| Cancellation by either side, with reason | LIVE | |
| Require a cancellation reason | LIVE | Advanced tab |
| Disable cancelling or rescheduling entirely | LIVE | Advanced tab |
| Minimum reschedule notice | LIVE | Advanced tab |
| No-show marking | LIVE | Bookings > row menu |
| Bookings list with filters | LIVE | /bookings |

**Sharp edges that matter commercially.**
**The reminder is 24 hours, email only, always on, with no per-service control and
no second reminder.** The 2 hour SMS that actually reduces no-shows cannot be sent.
The reminder needs an external scheduler. If the n8n schedule stops, reminders stop
silently.
A booking made less than 2 hours before the reminder run never gets one.
**There is no late-cancellation window anywhere in the product.** "No cancellations
within 24 hours" cannot be enforced. Cancelling is either open until the start time
or disabled outright.
A no-show can be recorded but carries no consequence, because no money can be taken.
You cannot mark a no-show before the appointment start time.
A reschedule request releases the slot immediately and fires the cancellation
webhook, so automations see it as a lost appointment.
**There is no CSV export and no REST API.** Bulk data out means direct database
access.
Reply-To on a confirmation lists the other attendees' email addresses. On a
multi-guest booking at a clinic or law practice, clients see each other's addresses.

**Developer view.** Reminder: `apps/web/app/api/cron/attendeeReminder/`.
Export button commented out at `BookingListContainer.tsx:188`.

> **Business note:**

---

## 1.8 Email

Email is **the only notification channel that works**. 28 of 49 templates can fire;
21 cannot, because they belong to payments, Cal Video recordings, team invitations
or workflows, none of which exist here.

**A standing hazard.** There is a global feature flag named `emails` with inverted
meaning: setting it to **enabled = true silently stops every outbound email** in the
product, with nothing but a console warning. It must stay false. Nothing in the UI
warns about this.

Email send failures are swallowed. A rejected confirmation is logged and forgotten,
so a business can believe a customer was told when they were not.

**Developer view.** `packages/emails/templates/_base-email.ts:34-39` (kill switch),
`:88-96` (swallowed failures).

> **Business note:**

---

## 1.9 Accounts and administration

| Capability | Status | Notes |
|---|---|---|
| Signup with admin approval gate | LIVE | New accounts land locked; you approve |
| Email and password login | LIVE | 7 character minimum, not configurable |
| Sign in with Google | LIVE | |
| Two-factor authentication | LIVE, partial | See below |
| Admin user list, search, pending filter | LIVE | Settings > Admin > Users |
| Lock and unlock an account | LIVE | This is your subscription kill switch |
| Operator SQL console | BUILT, NO UI | `scripts/console.sql`, needs SSH |
| Self-service account deletion | LIVE | Cascades to all bookings, no export first |

**Sharp edges.**
A user who signed up with Google has no password, so **two-factor setup fails** with
an error. The UI does not block them from trying.
**Promoting someone to admin does not give them admin access** unless their password
is longer than 14 characters and 2FA is on. Otherwise they are downgraded to an
inactive admin at login, with no explanation.
**Admin delete is `prisma.user.delete` with no export and no soft delete.** Deleting
a host destroys every booking they ever took and every attendee record on those
bookings. No undo.
Settings > Admin > Users > Add creates an account with no password and unlocked, so
an empty profile becomes publicly bookable immediately. Do not use it.
Magic-link sign-in tokens are valid for ten **hours**, despite a code comment saying
ten minutes. Do not advertise this login method.

**Developer view.** Admin downgrade at `next-auth-options.ts:263-279`;
cascade at `schema.prisma:856`.

> **Business note:**

---

## 1.10 Multi-person and teams

**Status: partially built, not usable by a customer.**

| Piece | Status |
|---|---|
| Team and Membership database tables | LIVE |
| Round-robin selection engine | BUILT, NO UI |
| Host table with per-host priority and weight | BUILT, NO UI |
| Provision a team and members | **BUILT, NO UI** (admin-only server mutation, PR #44) |
| Authorization on team services | LIVE (PR #44) |
| Team creation screen | ABSENT, `/teams` returns 404 |
| Host assignment screen | ABSENT, stubbed to render nothing |
| Invitation emails | ABSENT |

**What a multi-person business gets today:** one account per person, one booking
link each, and a page on their own website listing them. That is honest and it
works. It means no shared availability view, no combined bookings list, and each
person is approved individually at signup.

**Do not demo `/alice+bob`.** The multi-user link exists but is COLLECTIVE: it books
every named person into the same appointment. It is the opposite of "whoever is
free".

**Developer view.** Engine at `packages/features/bookings/lib/getLuckyUser.ts`;
host stub at `EventTypeWebWrapper.tsx:48`; provisioning at
`packages/trpc/server/routers/viewer/admin/createTeam.handler.ts`.

> **Business note:**

---

## 1.11 Automation and integration

| Capability | Status | Notes |
|---|---|---|
| Webhooks with HMAC signing | LIVE | Header `X-Cal-Signature-256` |
| Webhook create, edit, ping test | LIVE | Settings > Developer > Webhooks |
| Per-service or account-wide webhook scope | LIVE | |
| n8n receives booking events | LIVE | The real integration path |
| n8n creates, reschedules, cancels bookings | LIVE | Via the public booking endpoint |
| n8n reads or lists anything | ABSENT | No REST API is served |
| Analytics: GA4, Plausible, Meta Pixel | LIVE | Per service, not per account |
| CRM: HubSpot, Salesforce | SCHEMA ONLY | Needs OAuth keys in server env and a redeploy |

**The asymmetry to design around: n8n can receive and write, but cannot read.** Any
state an automation needs must live in n8n.

**Sharp edges.**
There is **no webhook retry and no delivery log**. One attempt; failures are logged
server-side and discarded. A business cannot see that yesterday's bookings never
reached their CRM.
`MEETING_STARTED` and `MEETING_ENDED` are selectable and look like they work, but
are only flushed when something POSTs the cron route.
Of 19 triggers offered, **7 can never fire here** (payments, recordings, Cal Video
no-shows, wrong-assignment).
The ping test payload uses Cal.com placeholder addresses, so a prospect watching a
demo sees cal.com email addresses.
**Nothing in this repository schedules any cron route.** `vercel.json` is inert on a
VPS deploy.

**Developer view.** `packages/features/webhooks/lib/sendPayload.ts:296-299,316`.

> **Business note:**

---

## 1.12 Infrastructure (developer view)

| | |
|---|---|
| Host | Hostinger VPS, Docker Compose behind Traefik 3.7.8 |
| Stack | Next.js 16.2.3, TypeScript strict, Postgres 16, Prisma 6.16.1, tRPC, NextAuth |
| Deploy | GitHub Actions to GHCR, SSH cutover, health gate, automatic rollback |
| Monitoring | Hourly off-box uptime probe with Telegram alerts |
| Email | Hostinger SMTP, SPF, DKIM and DMARC all passing |
| Backups | Pre-deploy `pg_dump` only |

**Known infrastructure gaps, all real.**
No nightly backup. The recovery point is the last deploy, so a fortnight of bookings
with no deploy has no snapshot.
**A failed backup does not stop the deploy.** It logs a warning and proceeds.
Backups sit unencrypted on the same VPS as the database. Nothing is offsite.
`Credential.key` holds Google refresh tokens **in plaintext**. Anyone with a database
dump gets live read and write access to every connected customer calendar.
The calendar cache is disabled, so every slot query hits Google live. Booking-page
speed is bounded by Google's response time and quota.
No audit logging. Nothing records who approved a signup, promoted an admin, or
deleted a user.

> **Business note:**

---

# Part 2: What does not exist

State these plainly. Guessing wrong here costs a customer.

| Not available | Why it matters | Buildable? |
|---|---|---|
| **Payments, deposits, no-show fees** | Stripe webhook is a hardcoded 404 | Yes, a real project. Highest leverage single build |
| **SMS and WhatsApp sending** | The SMS manager rate-limits and returns without sending | Yes, one provider inside the existing reminder cron |
| **Cal Video and recordings** | `DAILY_API_KEY` unset | Config plus testing |
| **Outlook / Office 365 calendar** | Deleted in the app prune | Restoring the app package |
| **Round-robin with a UI** | Engine exists, screens do not | 3 PRs, moderate |
| **Team or company page** | `/teams` is 404 | Part of the same build |
| **File upload, signature capture** | No such field type | Real work |
| **Travel time, service areas, routing** | No geography anywhere in the product | Do not build. This is ServiceTitan's product |
| **Resource booking (bays, rooms, chairs)** | No resource model | Significant |
| **Late-cancellation window** | Not in the codebase | Small, clones the reschedule control |
| **CSV export or REST API** | `apps/api/v2` is pruned from the build | Large |
| **Audit logs** | Table exists, nothing writes to it | Moderate |
| **HIPAA posture of any kind** | See Part 3 | A programme, not a feature |
| **Workflows, routing forms** | Dropped by migration | Rebuild from scratch |

---

# Part 3: Three things to fix before any demo

These are live surfaces that will actively mislead a prospect.

### 3.1 The HIPAA app is a liability

`/apps/baa-for-hipaa` returns **200 and needs no login**. It carries the
BookYourSlot page title, is listed in the app store, and advertises a **$300 per
month subscription**. It has **zero runtime code**: it is a config file, an icon, and
an external link to `https://cal.com/BAA`.

A doctor or Med Spa prospect who finds it will reasonably conclude BookYourSlot
offers a Business Associate Agreement. **It does not.** The link goes to Cal.com,
Inc., a different company that is not the data processor here.

**Action: hide this card before any healthcare conversation.**

### 3.2 The Stripe card implies deposits work

`/apps/stripe` returns 200 and the install route answers 401 rather than 404, so an
owner can begin an install and set a price on a service. The payment webhook is a
hardcoded 404, so those bookings would sit unconfirmed forever and no customer would
ever be charged.

**Action: hide this card, or never open the app store in front of a prospect who
wants deposits.**

### 3.3 The messaging apps read as SMS reminders

WhatsApp, Telegram and Signal appear in the app store. They are **meeting location
providers**: they add a clickable chat link to a booking. Nothing on this deployment
sends a message. A salon owner will assume they mean WhatsApp reminders.

---

# Part 4: Vertical fit

## Verdict table

| Vertical | Verdict | The one thing missing |
|---|---|---|
| **Auto care shops** | **SELL NOW** | Drop-off and pick-up as a pair |
| **Salons and barbers** | Sell with a caveat | Deposits |
| **Insurance agent teams** | Sell with a caveat | Round-robin lead routing |
| **HVAC, one truck** | Sell now, narrowly | Nothing structural |
| **HVAC, multi truck** | **Do not sell yet** | Travel time and service areas |
| **Med Spas** | **Do not sell yet** | Deposits, consent capture, PHI handling |
| **Doctors and clinics** | **Do not sell yet** | Any HIPAA posture at all |

---

## 4.1 Auto care shops — SELL NOW

**Frame it precisely as an appointment book, not a shop management system.**

**What they get today:** service types with durations up to 8 hours, the shop
address as a fixed location, per-day booking caps standing in for bay throughput,
before and after buffers, requires-confirmation for diagnostics, and intake
questions collecting make, model, year, VIN as text and service type as a dropdown.
Day-before reminder and no-show marking both work.

**Missing: the drop-off and pick-up pair.** This product books one interval against
one person. An auto shop books a drop-off at 8am and a pick-up at 5pm with the car
occupying a bay in between while the technician is free. Nothing models a resource
held across a span independent of a person.

**The honest cheap version, zero code:** two short services, "Drop-off" and
"Pick-up", 15 minutes each, plus a per-day booking cap standing in for bay count.

**Say up front:** quoted durations are fixed per service, so a job that runs long
does not push the next customer. The shop still has to phone them.

> **Business note:**

---

## 4.2 Salons and barbers — SELL WITH A CAVEAT

**Sell to a single-chair barber or a booth-rent stylist. Do not sell to a four-chair
salon that wants deposits.**

**What they get today:** a public link, per-service types with selectable durations,
after-event buffers for clean-up, per-day caps, intake questions,
requires-confirmation, disable-rescheduling with a minimum notice, a day-before
reminder, no-show marking, calendar sync so personal commitments block slots, and an
embed for their own site.

**Missing: deposits.** No-shows are the core economic problem of this business and
the only lever here is recording that one happened, after the fact.

**Also missing:** a salon-level page. `/teams` is 404 and the multi-user link books
every stylist at once. "Book with whoever is free" does not exist in any form.

**Also missing:** a late-cancellation window. Cancelling is open until the
appointment starts, or disabled entirely.

> **Business note:**

---

## 4.3 Insurance agent teams — SELL WITH A CAVEAT

**Sell to a solo agent or a small office where each agent has their own link. Never
pitch "leads round-robin to the next available agent".**

**What they get today:** each agent as a separate approved user with their own link
and calendar sync, services with fixed or multiple durations, buffers, minimum
notice, per-period caps, requires-confirmation, intake questions with select and
radio types for policy type, phone-call or Google Meet locations, a day-before
reminder, no-show marking, and signed webhooks pushing every booking into n8n for
CRM entry.

**Missing: round-robin lead distribution with a UI.** The engine, the host table with
priority and weight, and the persistence path all exist. Team creation is an
admin-only server mutation, `/teams` is 404, and the path has never been driven end
to end.

**Qualifying question:** what calendar does the office use? If it is Outlook or
Microsoft 365, this product cannot serve them today.

> **Business note:**

---

## 4.4 HVAC and field service — SPLIT VERDICT

**Sell now to a one-truck operator working a small radius. Do not sell to a
multi-truck company.**

**What the one-truck operator gets, and it is real value:** the customer types their
own address on the booking page, it lands in the calendar event location, and the
technician taps it on their phone to open Maps. Add intake questions for unit type
and symptom, requires-confirmation for dispatch triage, buffers as a crude travel
pad, per-day job caps, recurring events for maintenance plans, and webhooks into
n8n. For someone who just wants to stop playing phone tag, that is a sale.

**Missing, and it is structural: this codebase has no geography at all.** No zip
code, no coordinates, no distance, no routing. Three things a real field-service
company hits on day one:

1. **No travel time.** The after-event buffer is a fixed number of minutes applied
   identically to every booking. A job 40 miles out and a job next door get the same
   pad, and the system will happily book them back to back.
2. **No service-area limit.** A customer 90 miles outside the territory can book and
   nobody finds out until the technician reads the address.
3. **No route optimisation and no path to it.** The model is organizer availability,
   not routing.

**Worth building:** a service-area gate. Today it is pure configuration, a required
dropdown of served zip codes as a booking question. Advisory only, but useful.

**Not worth building:** travel time. It needs a distance-matrix provider, a per-tech
home base, and a rewrite of slot generation. That is ServiceTitan's and Jobber's
product, not this one.

> **Business note:**

---

## 4.5 Med Spas — DO NOT SELL YET

**The worst fit of the six. All three defining needs are on the missing list.**

**What works:** per-practitioner links, per-treatment services with multiple
durations, buffers for room turnover, intake questions, requires-confirmation,
recurring events for treatment packages, seats for group events, a day-before
reminder, no-show marking.

**Missing, all three:**

1. **Deposits.** Treatments run $300 to $2000, so a no-show is a real loss, and the
   only tool here is recording it afterwards.
2. **Consent and personal health information.** Intake answers go verbatim into the
   Google Calendar event description with no toggle that stops it. There is no file
   or signature field. And the app store advertises a BAA app from Cal.com, Inc.
3. **A spa-level page** listing practitioners.

**The honest cheap version of consent:** a required checkbox, "I have read and agree
to the consent form", pointing at a form hosted elsewhere. An afternoon of
configuration, and what most small spas will accept.

> **Business note:**

---

## 4.6 Doctors and clinics — DO NOT SELL YET

**Do not sell this as a medical scheduler.**

**The scheduling half genuinely works:** per-provider link, calendar sync and
busy-blocking, buffers, minimum notice, per-day caps, requires-confirmation, intake
questions, disable-rescheduling with a minimum notice, a day-before reminder,
no-show marking, and mail that reliably lands in inboxes.

**Missing: any HIPAA posture, and it is worse than simply having no BAA.**

**Every intake answer a patient types is written verbatim into the Google Calendar
event description**, alongside attendee name and email. Neither privacy toggle stops
it:

- "Hide notes in calendar" nulls only the free-text notes field, and only on the
  email path.
- "Hide calendar event details" only marks the .ics attachment as private.

So a clinic that turns both on and then asks "what brings you in today?" still ships
that answer to Google. **Never tell a healthcare prospect these toggles keep patient
information out of the calendar.**

`Booking.responses` sits as plaintext JSON in Postgres. There is no file or signature
field, so no insurance card, no ID, no signed consent.

**What a defensible posture would take:** BAAs with the VPS host and the mail
provider, real redaction before the calendar write, encryption at rest, audit
logging, a retention policy. Months, plus legal advice.

**The cheap partial, about a day:** make the calendar description carry only title
and time. That closes the worst leak and still does not make you compliant.

**The narrow sale that is honest today:** a cash-pay practice booking non-clinical
introductory consults, with intake questions switched off, stated plainly as having
no BAA.

> **Business note:**

---

## 4.7 How to assess a vertical not listed here

Ask these six questions. They map to the product's real fault lines.

1. **Does one named person do the work, or does anyone available?** Anyone available
   means round-robin, which has no UI.
2. **Does money change hands at booking time?** Deposits do not exist.
3. **Does the work happen at the customer's address?** Then ask how far apart jobs
   are. There is no travel time.
4. **Do they need a signature, a photo or a document at booking?** Not possible.
5. **What calendar do they use?** Microsoft is not supported.
6. **Is the data regulated?** Intake answers reach Google Calendar in plain text.

---

# Part 5: What to build next

Ordered by revenue unlocked per unit of work.

| # | Build | Unlocks | Size |
|---|---|---|---|
| 1 | **Hide the Stripe and BAA cards** | Removes two false claims from the live product | Hours |
| 2 | **Calendar description redaction** | Makes any regulated conversation possible at all | ~1 day |
| 3 | **Round-robin UI** (PRs 2 to 4) | Insurance teams, multi-chair salons, HVAC dispatch | 2 to 4 days |
| 4 | **Deposits via Stripe** | Salons and Med Spas together. Build once, sell twice | Real project |
| 5 | **SMS reminders**, one provider in the existing cron | The reminder that actually cuts no-shows | Days |
| 6 | **Late-cancellation window** | Clones the existing reschedule control | Small |
| 7 | **Service-area dropdown** | HVAC and mobile services, advisory gate | Hours |
| 8 | **Nightly offsite backup** | Removes the "we lose a fortnight" risk | Days |
| 9 | **Encrypt `Credential.key`** | Removes plaintext Google tokens | Multi-site migration |
| 10 | **CSV export** | Every business asks eventually | Small |

**Explicitly not on this list:** travel time and route optimisation, resource
booking, organizations, workflows, routing forms.

---

# Part 6: What you may and may not say

**You may say, because it is verified:**

- Customers book online and it lands in your Google Calendar instantly
- Your calendar blocks your booking page, so you cannot be double booked
- Automatic confirmation and a day-before reminder, from your own domain
- Customers reschedule or cancel themselves, and your calendar updates
- Ask any questions you like on the booking form
- Approve each booking manually if you want to
- Put the booking page on your own website
- Every booking can flow into your CRM or a spreadsheet automatically

**You may not say, because it is false:**

- Anything about taking payment, deposits, or charging no-show fees
- Anything about SMS or WhatsApp messages
- Anything about HIPAA, BAAs, or being suitable for patient data
- "Round-robin to whoever is free"
- "Works with Outlook"
- "Team scheduling" or "your whole staff on one page"
- Recording or transcribing meetings
- "Our API"

---

# Part 7: Business team notes

Space for the business side. Add dated entries.

## Discovery calls

<!-- Date, business type, what they asked for, what stopped the deal -->

## Objections heard

<!-- The objection, and the honest answer given -->

## Pricing conversations

<!-- Manual invoicing today; the locked flag is the on/off switch -->

## Feature requests from real prospects

<!-- Only things a named prospect actually asked for -->

---

# Appendix: business term to technical term

| A business owner says | The product calls it | Where |
|---|---|---|
| "My services" | Event types | /event-types |
| "My opening hours" | Schedule | /availability |
| "Closed that day" | Date override | Schedule > Date overrides |
| "Time between jobs" | Buffer | Service > Limits |
| "No same-day bookings" | Minimum booking notice | Service > Limits |
| "Only 8 jobs a day" | Booking frequency limit | Service > Limits |
| "I approve each one" | Requires confirmation | Service > Advanced |
| "Questions I ask" | Booking questions | Service > Advanced |
| "Group class" | Seats per time slot | Service > Advanced |
| "Where we meet" | Location | Service > Basics |
| "Hidden link" | Hidden event type / private link | Service > Advanced |
| "Turn a customer off" | Lock user | Settings > Admin > Users |
| "Send it to my CRM" | Webhook | Settings > Developer > Webhooks |

---

## Verification method

Six parallel investigations of the codebase, each re-checked by an independent agent
instructed to refute rather than agree, followed by hand verification of the
highest-risk claims against the live site and the production database. Twenty-two
findings were corrected or downgraded during that pass. Claims that could not be
verified are marked in place rather than presented as fact.

**Related documents.** `docs/BACKLOG.md` (engineering debt),
`docs/N8N.md` (automation setup), `docs/TESTING.md` (test procedures),
`docs/APP-STORE.md` (integration reference),
`deploy/production/CHECKLIST.md` (launch and operations).
