# Feature ledger

**Every feature that has been asked for, built, deferred or ruled out, in one place.**

This file exists because things were getting lost. Capabilities discussed in a
conversation were never written anywhere checkable, and twice the answer to "where
did that go?" was "you asked for it and nobody wrote it down." This is the fix.

| | |
|---|---|
| **Verified against** | `main`, and the running production instance |
| **Last verification** | 5 September 2026 |
| **Companion docs** | [PRODUCT-SOURCE-OF-TRUTH.md](PRODUCT-SOURCE-OF-TRUTH.md) for what may be sold, [BACKLOG.md](BACKLOG.md) for engineering debt |

## Status vocabulary

| Tag | Meaning |
|---|---|
| **LIVE** | Works, and a client can use it today |
| **BUILT, NOT ON** | Code is merged and correct, but nothing switches it on |
| **HALF BUILT** | Some of it merged, the rest was never started |
| **UNREACHABLE** | The code exists and runs, but no path in the product reaches it |
| **NOT BUILT** | Asked for, agreed, never started |
| **CANNOT** | Blocked by something structural, named per row |
| **RULED OUT** | A deliberate decision not to build. The reason is recorded |

## The three shapes, which are not the same thing

Most confusion here comes from collapsing these together.

1. **Many client businesses on one instance.** A salon, a clinic and an agency, each
   independent. **This is what BookYourSlot sells.** It works today.
2. **One client with several staff.** Ten stylists in one salon, sharing a page,
   round-robin to whoever is free. Half built.
3. **One client with several locations or sub-teams.** A franchise with five
   branches. Off, and staying off.

---

# Tier 1: Many client businesses on one instance

**This is the product being sold today.** Each client is a separate account.

## Booking, end to end

| Feature | Status | Evidence |
|---|---|---|
| Public booking page per client | LIVE | |
| Services with fixed or multiple durations | LIVE | menu is fixed, 5 to 480 minutes |
| Unlimited services per client | LIVE | |
| Hidden services reachable by direct link | LIVE | |
| Private links with expiry and usage cap | LIVE | |
| Booking questions, 13 answer types | LIVE | `form-builder/fieldTypes.ts`, 15 types, 2 `systemOnly` |
| Requires confirmation, with accept and reject | LIVE | approve from a signed email link, no login |
| Seats per slot for group classes | LIVE | mutually exclusive with requires-confirmation |
| Recurring bookings | LIVE | up to 24 occurrences |
| Reschedule and cancel, both sides | LIVE | moves the real calendar event |
| No-show marking | LIVE | flag only, no fee, no report |
| Embed the booker on the client's own site | LIVE | |

## Where the appointment happens

**This was asked for specifically and it already works.** Six location types need no
app install, and the customer picks between them when a service offers more than one.

| Location | Status |
|---|---|
| In person, **attendee's address** (they type it, lands in the calendar, opens Maps) | LIVE |
| In person, **your shop address** | LIVE |
| Custom attendee location, free text | LIVE |
| **Attendee phone** (they give a number, you call) | LIVE |
| **Your phone** (you publish a number) | LIVE |
| Any link you paste | LIVE |
| Google Meet | LIVE |
| Cal Video | CANNOT, `DAILY_API_KEY` unset |
| Zoom | CANNOT, needs admin OAuth keys, `/apps/zoom` 404s |

The customer-facing picker is the `location` booking field, `getOptionsAt: "locations"`
in `getBookingFields.ts`, with typed inputs for address, text and phone.

**Sharp edge:** your shop address, your phone and a pasted link are all stripped from
the public page unless "Display on booking page" is ticked per location.

## Calendars

| Provider | Status |
|---|---|
| Google Calendar, two-way | LIVE |
| Apple Calendar / iCloud | LIVE, needs an app-specific password |
| CalDAV (Fastmail, Nextcloud, Zimbra) | LIVE, beta, client must know their URL |
| **Outlook / Office 365 / Exchange** | CANNOT, deleted in the app prune |

Outlook is a qualifying question before a demo, not a support ticket after one.
Insurance offices and HVAC skew Microsoft.

## Availability

| Feature | Status | Note |
|---|---|---|
| Named schedules, multiple ranges per day | LIVE | |
| Per-service schedules | LIVE | |
| Date overrides for closures | LIVE | multi-date on create, per schedule not per account |
| Out of office | LIVE | |
| Public holiday auto-blocking | LIVE **with a landmine** | see Open risks |
| Buffers before and after | LIVE | fixed menu, so no 25 minute drive-time pad |
| Minimum notice, slot interval | LIVE | |
| Caps per day / week / month / year | LIVE | per service, counts only accepted bookings |
| Availability troubleshooter | LIVE | |

## Notifications

| Feature | Status | Note |
|---|---|---|
| Confirmation email, both sides | LIVE | SPF, DKIM and DMARC all pass |
| Calendar invite attached | LIVE | |
| Reminder at **48h, 24h, 30m** | **BUILT, NOT ON** | PR #48. Nothing calls it yet |
| Meeting link inside the reminder | LIVE | was broken, fixed, proven on a live booking |
| Host reminder for unanswered requests | UNREACHABLE | endpoint exists, nothing calls it |
| SMS / WhatsApp | **CANNOT** | `sms-manager.ts` rate-limits and returns without sending |

## Automation

| Feature | Status | Note |
|---|---|---|
| Webhooks with HMAC signing | LIVE | header `X-Cal-Signature-256` |
| n8n receives booking events | LIVE | |
| n8n creates / reschedules / cancels bookings | LIVE | `/api/book/event` takes no session |
| n8n **reads** anything | CANNOT | no REST API is served |
| Scheduler workflow file | BUILT, NOT ON | `automations/bookyourslot-schedulers.n8n.json` |
| Analytics: GA4, Plausible, Meta Pixel | LIVE | per service, not per account |
| CRM: HubSpot, Salesforce | CANNOT | needs OAuth keys in server env plus a redeploy |
| CSV export | NOT BUILT | button is commented out |

## Running it as a business

| Feature | Status | Note |
|---|---|---|
| Signup with your approval gate | LIVE | your onboarding step |
| `locked` flag as subscription kill switch | LIVE | server-enforced on every route |
| Admin user list, search, pending filter | LIVE | |
| Operator SQL console | LIVE, no UI | needs SSH |
| **Hide the app store from clients** | **NOT BUILT** | asked for 5 Sep. `/apps` is 200 logged out |
| **Admin configures apps for a client** | **NOT BUILT** | see the OAuth limit below |
| Owner's view across all clients | NOT BUILT | SQL only |
| Per-client branding on the booking page | NOT BUILT | |
| Audit log of admin actions | NOT BUILT | table exists, nothing writes to it |

**A limit worth designing around, not discovering later:** an admin **cannot**
connect a client's Google Calendar for them. Google requires that account holder to
click consent. Admin-side configuration can cover analytics keys and static links.
Calendar connection has to stay a client action.

---

# Tier 2: One client with several staff

**Half built. One of four planned PRs merged, and the remaining two were never
started.** No client can use teams today.

| Piece | Status | Evidence |
|---|---|---|
| Team and Membership tables | LIVE | survived the fork's strip |
| Provision a team with members | **LIVE** | PR #44, admin-only mutation |
| Authorization on team services | **LIVE** | PR #44 replaced a stub that returned `true` |
| Round-robin selection engine | UNREACHABLE | `getLuckyUser.ts`, fully intact |
| Host priority and weight | UNREACHABLE | `Host` model |
| **Create a team service** | **DONE** | Guard removed; teamId and ROUND_ROBIN injected at mutate time |
| **Assign hosts to a service** | **DONE** | Real tab built on the surviving CheckedTeamSelect and AssignAllTeamMembers |
| Shared team booking page | NOT BUILT | `/teams` returns 404 |
| Invitation emails | RULED OUT for now | memberships are written pre-accepted; no invite flow exists |
| Role enforcement inside a team | NOT BUILT | permission service is still a stub |
| Collective booking, everyone attends | LIVE | `/alice+bob/30min`. **Not** round-robin, it intersects availability |

## What is left to do

1. **Team service creation.** Remove the `teamId` guard, add a scheduling-type
   control. Small.
2. **Host assignment UI.** Replace the null stub with a member picker and an
   `isFixed` toggle. The update handler already validates and persists hosts. This is
   the real work, roughly 150 to 250 lines.
3. **Ship on `/d/<link>/<slug>`**, which already branches on `eventType.team`. A
   pretty `/team/<slug>` URL only when someone asks.

**Do not offer `/alice+bob` as "book whoever is free."** It books every named person
into the same appointment. It is the opposite.

---

# Tier 3: One client with several locations

**Off, and staying off.** `ORGANIZATIONS_ENABLED` is empty in production, verified,
and must stay empty. Organizations are stripped from this fork.

A franchise with five branches is five separate accounts today. Anything else is a
project, not a setting.

---

# Asked for and not built

Recorded with provenance so they stop disappearing.

| Feature | Asked | Status | Size |
|---|---|---|---|
| **Hide the app store, admin configures for clients** | 5 Sep | NOT BUILT | Small for the hiding, larger for admin-side config |
| **Retell voice agent books by phone** | 5 Sep | NOT BUILT | Real project |
| **Team service creation** (PR 2 of 4) | 2 Sep | **DONE** | Shipped with PR 3 |
| **Host assignment UI** (PR 3 of 4) | 2 Sep | **DONE** | Plus a DI stub fix the build uncovered |
| Turn the reminder schedulers on | 5 Sep | BUILT, NOT ON | 15 minutes |
| Nightly and offsite backups | ongoing | NOT BUILT | Days |
| Encrypt `Credential.key` | ongoing | NOT BUILT | Multi-site migration |

## Retell voice booking, since it is the largest

`packages/app-store/retell-ai` is `"__template": "link-as-an-app"` with an external
link and **no runtime code**. Same category as the BAA card. There is no integration.

The shape is at least clear: Retell handles the call and posts to a webhook; that
webhook finds a free slot and creates a booking. The booking half is already
reachable because `/api/book/event` needs no session. Availability lookup for a voice
agent is the part that needs designing.

---

# Cannot be built without a bigger project

| Feature | Blocked by |
|---|---|
| Payments, deposits, no-show fees | Stripe webhook is a hardcoded 404 |
| SMS and WhatsApp sending | the sender is a stub that returns without sending |
| Cal Video, recordings, transcripts | `DAILY_API_KEY` unset |
| Outlook / Office 365 calendars | app packages deleted in the prune |
| File upload, signature capture | no such field type |
| Resource booking: bays, rooms, chairs | no resource model |
| Any HIPAA posture | a programme with legal advice, not a feature |

## Ruled out on purpose

| Feature | Why |
|---|---|
| **Travel time and route optimisation** | No geography exists at any layer. This is ServiceTitan's and Jobber's product. Sell to one-truck operators instead |
| Organizations | Stripped, and `ORGANIZATIONS_ENABLED` stays empty |
| Workflows, routing forms | Dropped by migration. n8n covers the same ground |
| Porting the whole Cal.com API | `apps/api/v2` is pruned out of the Docker build |

---

# Open risks

| Risk | State |
|---|---|
| **Tenant isolation has never been audited** | Everything read so far is user-scoped, but not having seen leakage is not proof there is none. Worth an audit before a clinic and a salon share the box |
| **`GOOGLE_CALENDAR_API_KEY` unset** | Latent. Zero clients have set a holiday country. The first who does breaks their own booking page: the holiday client is built eagerly and throws outside the try/catch |
| Reminders are not scheduled | The feature exists and does nothing until n8n is wired |
| Three misleading cards are live | `/apps/stripe`, `/apps/baa-for-hipaa`, `/apps/whatsapp` all return 200. Hiding the app store closes all three at once |
| No nightly or offsite backup | Recovery point is the last deploy, and a failed backup does not stop a deploy |
| `Credential.key` in plaintext | Live Google refresh tokens for every connected client sit unencrypted |

---

# Keeping this file honest

- **Every row carries a status, and statuses are checked, not remembered.** If you
  cannot point at a file or an observed response, the row is not LIVE.
- **When something is asked for, it goes in "Asked for and not built" the same day**,
  with the date. That is the whole point of this file.
- **When something ships, move it and say what proved it.** "Merged" is not "works."
- **A row that turns out to be wrong gets corrected, not deleted.** Being wrong once
  is cheaper than a claim in a sales call that nobody can trace.
