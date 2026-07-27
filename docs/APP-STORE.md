# BookYourSlot App Store — reference & pruning guide

What every integration in this codebase is for, the business problem it solves,
who actually profits from it, and whether it is safe to delete. Use this to
decide what to keep for a **lean, small-business** BookYourSlot and what to cut.

There are **105 real apps** in `packages/app-store/`. Most are inert — they do
nothing until a user installs them and pastes API keys — but they clutter your
store and carry the upstream "Cal.diy / cal.com" branding. This guide tells you
exactly which ones are wired into the running product (**never delete**) and
which are free to remove.

> How to use this: read the category tables, then fill in the
> [Deletion worksheet](#deletion-worksheet) at the bottom with the slugs you
> want gone. I verify each one (and its related wiring) before deleting.

---

## 1. How the app store actually works

Four moving parts. Understanding them tells you why deletion is riskier than
hiding, and why some apps show up on their own.

1. **The app folder** — `packages/app-store/<dirName>/`. Self-contained: config,
   logo, API adapter, setup UI.
2. **12 generated import maps** — `packages/app-store/*.generated.ts(x)`
   (`apps.metadata.generated.ts`, `video.adapters.generated.ts`,
   `calendar.services.generated.ts`, `payment.services.generated.ts`, etc.).
   **Every app is listed in these.** They are built by the app-store CLI. If you
   delete an app folder by hand *without* regenerating these, the build breaks
   because a generated file still imports the folder you removed. This is the
   whole reason you use the CLI to delete, never `rm` alone.
3. **The seed** — `scripts/seed-app-store.ts` runs on every boot
   (`scripts/start.sh`). It writes one row per app into the DB `App` table and
   sets `enabled`. An app with a **key schema but no keys** is seeded
   `enabled: false`; an app that **needs no keys** is seeded `enabled: true`.
4. **The store query** — `_appRegistry.ts` lists only apps where
   `enabled = true`. That is why Apple Calendar and Paypal appear in your setup
   wizard on their own (no keys required → auto-enabled), while Zoom and Stripe
   stay hidden until you add keys.

**Delete vs hide.** Deleting removes the folder + regenerates the maps + drops
the app from the codebase permanently (what you chose). Hiding just flips
`enabled: false`. Deleting is cleaner for a shipped product; hiding is reversible.
This guide is written for deletion, with the safe procedure in
[section 11](#11-how-to-delete-an-app-safely).

---

## 2. Load-bearing apps — NEVER delete

These are wired into core booking, calendar, email, or payment flows. Removing
any of them breaks a working feature, not just a store card.

| App | dir | Why it is load-bearing |
| --- | --- | --- |
| Cal Video | `dailyvideo` | The **default meeting location**. Referenced in booking, confirmation emails, and recording flows. Delete it and "Cal Video" location + its emails break. |
| Google Calendar | `googlecalendar` | Two-way calendar sync you are shipping. Your keep-set. |
| Apple Calendar | `applecalendar` | CalDAV/iCloud sync, no API keys needed. Your keep-set. |
| CalDAV | `caldavcalendar` | Generic CalDAV — Fastmail, Nextcloud, etc. Backs Apple + others. |
| Outlook / Microsoft 365 | `office365calendar` | Microsoft calendar sync. Your keep-set. |
| Google Meet | `googlevideo` | Meeting location option you are keeping. Depends on Google Calendar. |
| Zoom | `zoomvideo` | Meeting location option. Your keep-set. |
| Stripe | `stripepayment` | Payments/deposits. Your keep-set. The only payment app you keep. |

Also do not touch the non-app folders: `_utils`, `_components`, `templates`,
`tests`, `repositories`, `routing-forms`.

---

## 3. Your lean keep-set (decided)

Everything you keep, in one place. This is a tidy store for a dentist, salon, or
consultant — no AI call-centers, no enterprise CRM.

- **Calendars:** Google, Apple, CalDAV, Outlook
- **Video:** Cal Video (built-in), Google Meet, Zoom
- **Payments:** Stripe
- **Analytics:** kept per your choice (trim recommended — see
  [section 8](#8-analytics-12-apps))

Everything in sections 4–10 that is not above is a **delete candidate** for your
confirmation.

---

## 4. Calendars (14 apps)

**Problem solved:** stop double-bookings by reading the owner's real calendar and
writing new bookings back to it. **Who profits:** every owner — this is the core
value. You only need the calendar systems your users actually run.

| App | dir | Solves for / who profits | Verdict |
| --- | --- | --- | --- |
| Google Calendar | `googlecalendar` | Gmail/Workspace users — the majority | **KEEP** (load-bearing) |
| Apple Calendar | `applecalendar` | iCloud users, Mac/iPhone owners | **KEEP** (load-bearing) |
| CalDAV | `caldavcalendar` | Fastmail, Nextcloud, generic CalDAV | **KEEP** (load-bearing) |
| Outlook / 365 | `office365calendar` | Microsoft users | **KEEP** (load-bearing) |
| Microsoft Exchange (EWS) | `exchangecalendar` | On-prem corporate Exchange | DELETE candidate — enterprise IT, not SMB |
| Exchange 2013 | `exchange2013calendar` | Legacy on-prem Exchange | DELETE candidate — obsolete |
| Exchange 2016 | `exchange2016calendar` | Legacy on-prem Exchange | DELETE candidate — obsolete |
| Lark Calendar | `larkcalendar` | ByteDance/Lark users (mostly Asia) | DELETE candidate |
| Feishu Calendar | `feishucalendar` | Feishu users (China) | DELETE candidate |
| Zoho Calendar | `zohocalendar` | Zoho suite users | DELETE candidate |
| Notion Calendar (Cron) | `cron` | Notion Calendar users | DELETE candidate — nice-to-have |
| Amie | `amie` | Amie productivity-app users | DELETE candidate — niche |
| Vimcal | `vimcal` | Power users of Vimcal | DELETE candidate — niche |
| ICS Feed | `ics-feedcalendar` | Read-only import of any ICS feed | DELETE candidate (keep only if you want feed import) |

Keeping the four mainstream ones covers ~99% of small businesses.

---

## 5. Conferencing / video (29 apps)

**Problem solved:** attach a meeting link automatically so nobody swaps Zoom
links by hand. **Who profits:** anyone meeting online. You need **one built-in +
the two everyone asks for**, not 29 providers.

**KEEP:** Cal Video (`dailyvideo`, load-bearing) · Google Meet (`googlevideo`) ·
Zoom (`zoomvideo`).

**DELETE candidates (all 26 others)** — obscure providers, niche communities, or
duplicate "jump on a call" apps:

`eightxeight` (8x8) · `campfire` · `demodesk` · `dialpad` · `discord` ·
`element-call` · `facetime` · `horizon-workrooms` · `jelly` · `lyra` ·
`office365video` (Teams video) · `mirotalk` · `nextcloudtalk` · `ping` ·
`riverside` · `roam` · `salesroom` · `shimmervideo` · `sirius_video` · `skype` ·
`sylapsvideo` · `webex` · `whereby` · `huddle01video` · `jitsivideo` ·
`tandemvideo`

> Note: `office365video` is **Teams video meetings** and is separate from
> `office365calendar` (Outlook calendar sync, which you keep). Deleting the video
> one does not touch calendar sync.

---

## 6. Payments (6 apps)

**Problem solved:** take a deposit or full payment at booking to kill no-shows.
**Who profits:** salons, spas, clinics, paid consultants — your exact verticals.

| App | dir | Notes | Verdict |
| --- | --- | --- | --- |
| Stripe | `stripepayment` | Cards, mainstream, load-bearing for paid events | **KEEP** |
| Paypal | `paypal` | PayPal balance/cards | DELETE candidate |
| HitPay | `hitpay` | SE-Asia local payments | DELETE candidate |
| Alby | `alby` | Bitcoin/Lightning | DELETE candidate — crypto |
| BTCPayServer | `btcpayserver` | Self-hosted Bitcoin | DELETE candidate — crypto |
| Mock Payment | `mock-payment-app` | Test fixture only | DELETE candidate — used by payment E2E tests you don't run |

---

## 7. CRM (7 apps)

**Problem solved:** log each booking as a contact/deal in a sales CRM. **Who
profits:** sales teams and larger orgs with a pipeline — **not** a solo dentist
or salon. This whole category is enterprise weight you can drop.

**DELETE candidates (all 7):** `hubspot` · `salesforce` · `pipedrive-crm` ·
`closecom` · `attio` · `zohocrm` · `zoho-bigin`

Keep one only if you personally run that CRM and want bookings pushed into it.

---

## 8. Analytics (12 apps)

**Problem solved:** measure booking-page traffic and conversions. **Who
profits:** whoever runs marketing/ads. You chose to **keep analytics** — sensible
if you'll run ads to your booking page. But 12 near-identical trackers is
overkill; most are Google-Analytics alternatives.

**Recommended keep (2–3):** `ga4` (Google Analytics) · `plausible`
(privacy-friendly) · `metapixel` (only if you run Meta/Instagram ads).

**Trim candidates (redundant GA-alternatives):** `fathom` · `matomo` · `umami` ·
`posthog` · `twipla` · `databuddy` · `insihts` · `dub` · `gtm`

All are inert until keys are added, so keeping them is harmless — but a shorter
list is a cleaner store. Your call on how hard to trim.

---

## 9. Automation (22 apps)

Two very different groups live here.

**9a. AI phone / voice receptionists — the "AI notes and calls" you want gone.**
These are AI call-center agents that answer phones and book by voice. Great for a
100-seat sales floor, pure clutter for a small booking site.

**DELETE candidates:** `bolna` · `caretta` · `elevenlabs` · `famulor` ·
`fonio-ai` · `greetmate-ai` · `lindy` · `millis-ai` · `monobot` · `retell-ai` ·
`synthflow` · `telli` · `vital` · `autocheckin` · `clic` · `raycast` · `wipemycalother`

**9b. General automation (webhook bridges).** Trigger external workflows when a
booking is created/cancelled. Genuinely useful *if* you'll wire automations —
otherwise cut them too.

| App | dir | Verdict |
| --- | --- | --- |
| Zapier | `zapier` | OPTIONAL — keep only if you'll use Zapier |
| Make | `make` | OPTIONAL — keep only if you'll use Make |
| n8n | `n8n` | OPTIONAL — keep only if you self-host n8n |
| Pipedream | `pipedream` | OPTIONAL — developer automation |
| Intercom | `intercom` | DELETE candidate — support chat, enterprise |

For a small-business launch, deleting all of 9a and 9b is a clean default. Keep a
webhook bridge later only when you have a concrete automation to build.

---

## 10. Messaging & Other (15 apps)

**Messaging (3)** — meet over a chat app instead of video. Marginal.

| App | dir | Verdict |
| --- | --- | --- |
| WhatsApp | `whatsapp` | OPTIONAL — relevant for salons/local/international clients |
| Telegram | `telegram` | DELETE candidate |
| Signal | `signal` | DELETE candidate |

**Other (12)** — grab bag. A few are genuinely useful for your verticals:

| App | dir | Solves for / who profits | Verdict |
| --- | --- | --- | --- |
| BAA for HIPAA | `baa-for-hipaa` | US healthcare compliance — dentists/clinics | OPTIONAL — keep if targeting US healthcare |
| QR Code | `qr_code` | Print booking link on flyers/reception desk — local shops | OPTIONAL — cheap win for local businesses |
| WordPress | `wordpress` | Embed booking into a WordPress site — small-biz sites | OPTIONAL — keep if your users run WordPress |
| Framer | `framer` | Embed into Framer sites | DELETE candidate |
| Granola | `granola` | **AI meeting notes (macOS)** — the "AI notes" you want gone | DELETE candidate |
| Chatbase | `chatbase` | AI chatbot booking | DELETE candidate |
| Sendgrid | `sendgrid` | Transactional email — you already use Hostinger SMTP | DELETE candidate |
| Basecamp3 | `basecamp3` | PM tool status | DELETE candidate |
| Linear | `linear` | Engineering PM | DELETE candidate |
| Deel | `deel` | HR/payroll calendar | DELETE candidate |
| Weather in your Calendar | `weather_in_your_calendar` | Novelty | DELETE candidate |
| Giphy | `giphy` | GIFs in confirmations — novelty | DELETE candidate |

---

## 11. How to delete an app safely

The CLI handles the folder **and** regenerates the 12 import maps in one step —
that is the part a manual `rm` gets wrong.

```bash
# 1. Delete the app (removes packages/app-store/<slug>/ + regenerates all maps)
yarn app-store delete
#    → pick the app from the list, or it accepts the slug

# 2. Double-check nothing else references it (locations, tests, i18n, constants)
grep -rn "<slug>" packages/ apps/ --include=*.ts --include=*.tsx --include=*.json

# 3. Confirm the build still type-checks
yarn type-check:ci --force

# 4. Commit the folder removal + regenerated *.generated.* files together
```

**On the DB side:** you don't need to touch it. A deleted app is gone from
`apps.metadata.generated.ts`, so the seed stops creating/updating its row, and
the store query (which joins metadata) stops showing it. Any leftover DB row is
inert. On your production server the change lands with a normal `./deploy.sh`.

**Related items to expect** for each app (step 2 surfaces them): most inert apps
are fully self-contained. The ones with extra wiring are the video/calendar/
payment apps (they register locations or services) — which are exactly the ones
you are **keeping**, so your deletions should be clean. I verify each slug on
your list before running anything.

---

## 12. How to build a new app

When you want to add an integration later (say a new payment provider or a
Calendly-import tool):

```bash
yarn app-store create
#    → prompts for name, slug, category, publisher; scaffolds
#      packages/app-store/<slug>/ and regenerates the maps
yarn app-store:build   # regenerate maps if you edited config by hand
```

The scaffold gives you `config.json` (name, description, categories, publisher),
a logo slot, an API adapter for the category (calendar/video/payment/crm/…), and
a setup UI. Fill in the adapter, add a key schema if it needs credentials, seed,
enable.

**What makes a good app to build** — frame it as a business, not a feature:

- **Problem** — what booking pain does it remove? (e.g. "clients pay a deposit so
  they show up.")
- **Who profits** — which of your verticals asks for it? (dentists want reminders
  + deposits; salons want deposits + WhatsApp; consultants want payments + video.)
- **Willingness to pay** — an integration people will switch or upgrade for is
  worth building; a novelty is not.
- **Maintenance cost** — every app is a credential flow and an external API that
  can break. Keep the store small on purpose.

Publisher/description on any app you create or keep should read **BookYourSlot**,
not Cal.diy — the leftover upstream branding is cleaned as part of the pruning
pass.

---

## Deletion worksheet

List the slugs you want removed (copy from the tables above). I'll verify each is
safe, find any related wiring, delete + regenerate, type-check, and commit.

```
# Calendars to delete:
# Conferencing to delete:
# Payments to delete:
# CRM to delete:
# Analytics to delete:
# Automation to delete:
# Messaging to delete:
# Other to delete:
```

**Do not list:** anything in [section 2](#2-load-bearing-apps--never-delete)
(Cal Video, the four calendars, Google Meet, Zoom, Stripe) — those are wired into
the product.
