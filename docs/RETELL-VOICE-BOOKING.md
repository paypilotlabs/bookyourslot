# Voice booking with Retell, end to end

A customer calls the shop's number. Retell answers, works out what they want, checks
real availability, takes their details, books it, and the customer gets the same
confirmation and reminders as any web booking.

Nothing about the app changes. Retell talks to n8n, and n8n uses the same two public
endpoints the booking page itself uses.

```
caller -> Retell number -> Retell agent
                             |  check_availability  -> n8n -> GET  /api/trpc/slots/getSchedule
                             |  book_appointment    -> n8n -> POST /api/book/event
                                                                     |
                                             confirmation email + calendar event + webhook
                                                                     |
                                              48h / 24h / 30m reminders (if scheduled)
```

## Why this works without an API key

There is no REST API on this deployment, and `/settings/developer/api-keys` mints
keys nothing accepts. But two endpoints are reachable without a session, because the
**public booking page needs them**:

| Endpoint | Auth | Verified |
|---|---|---|
| `GET /api/trpc/slots/getSchedule` | none | 200 with real slots, no session, no key |
| `POST /api/book/event` | none | resolves the user as `session?.user?.id \|\| -1` |

That is the same surface any visitor with a browser has. It is rate limited per IP.

The booking payload was verified against production using `_isDryRun`, which runs
the whole path including the availability check and the responses schema, then skips
the database write and the email. It returned `200` with `uid: "DRY_RUN_UID"` and the
booking count was unchanged.

---

## Setup

### 1. Import the workflow

`automations/bookyourslot-retell-voice.n8n.json`. It has two webhook chains and no
credentials, because none are needed.

### 2. Configure the client

Edit the **two** `Client config` nodes. They hold the same block; both need it.

```js
const CLIENT = {
  username: 'startwithleo',
  timeZone: 'America/Detroit',      // the STORE's timezone
  services: {
    'consultation':   { slug: '30min', eventTypeId: 3, minutes: 30 },
    'quick question': { slug: '15min', eventTypeId: 1, minutes: 15 },
  },
  defaultService: 'consultation',
};
```

**Finding `eventTypeId`:** open the service in the app; the URL is
`/event-types/3?tabName=setup`, so the id is `3`. It is required because the booking
endpoint takes an id, not a slug.

**One workflow per client.** Each client gets their own Retell number and their own
copy of this workflow. A shared number would book the wrong business.

**Name the calendar slot after the caller.** Separate from the workflow, and per
event type. Without it every phone booking lands on the calendar as
"30 mins discussion between Owner and Caller", which reads backwards when the owner
is scanning a day. Event Types, the service, Advanced, "Event name in calendar",
set `{Scheduler} - {Event type title}`. Full detail in
[VOICE-BOOKING-RUNBOOK.md](VOICE-BOOKING-RUNBOOK.md#2-name-the-calendar-slot-after-the-caller).

### 3. Activate the workflow

Webhooks 404 while a workflow is inactive, and n8n does not warn you.

### 4. Build the Retell agent

Follow `automations/retell-agent-script.md`. Paste the General Prompt, add the two
functions with the URLs your n8n gives you.

### 5. Webhook routing, so Retell can reach n8n

Retell is a cloud service and n8n listens only on the tailnet, so the two webhook
paths are routed through Traefik on the existing domain. No DNS record is needed and
no new subdomain.

The n8n container carries these labels:

```
traefik.enable=true
traefik.docker.network=bys
traefik.http.routers.n8n-hooks.rule=(Host(`bookyourslot.online`) || Host(`www.bookyourslot.online`)) && PathPrefix(`/webhook/bookyourslot/`)
traefik.http.routers.n8n-hooks.entrypoints=websecure
traefik.http.routers.n8n-hooks.tls.certresolver=letsencrypt
traefik.http.routers.n8n-hooks.priority=100
traefik.http.services.n8n-hooks.loadbalancer.server.port=5678
traefik.http.middlewares.n8n-hooks-rl.ratelimit.average=30
```

**The prefix is `/webhook/bookyourslot/`, not `/webhook`.** That matters: this n8n
holds dozens of unrelated workflows, several with their own webhooks, and a bare
`/webhook` prefix would publish every one of them. The editor is not routed at all
and stays reachable only on the tailnet.

Verify all three after any change to this:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'Content-Type: application/json' \
  -d '{"service":"consultation"}' https://bookyourslot.online/webhook/bookyourslot/availability   # 200
curl -s -o /dev/null -w '%{http_code}\n' https://bookyourslot.online/rest/login                  # 404, editor not exposed
curl -s -o /dev/null -w '%{http_code}\n' https://bookyourslot.online/webhook/waitlist            # 404, other workflows not exposed
```

**On authentication.** These two paths are unauthenticated. That is a smaller gap
than it looks: `/api/book/event` is already public and session-free because the
booking page needs it, so a shared secret here would not protect anything an attacker
could not reach directly. What does apply is the Traefik rate limit above. If you
later want a secret anyway, add a header check in the first Code node of each chain.

### 6. Point a number at the agent

Buy a number in Retell and assign the agent. That number is now that client's
booking line.

---

## Test it before it takes a real call

**Availability, from your machine:**

```bash
curl -s -X POST https://<your-n8n>/webhook/bookyourslot/availability \
  -H 'Content-Type: application/json' -d '{"service":"consultation"}' | python3 -m json.tool
```

Expect `found: true` and a `spoken` string a person could read aloud. If you get
404, the workflow is not active.

**Booking, without creating one:** use Retell's test call rather than curl, so you
exercise the agent's confirmation flow, which is where real calls fail.

**A real end-to-end call.** Ring the number and book yourself. Then check, in order:

1. The booking appears under Bookings, Upcoming
2. Its notes read `Booked by phone through the voice agent. Service: ... Caller phone: ... Reason given: ...`
3. A confirmation email arrives
4. The event is in Google Calendar with a Meet link
5. Cancel it through the UI afterwards, which is what removes the calendar event

---

## What the host sees

Notes on the booking, carried into the confirmation email, the calendar entry and the
webhook payload:

> Booked by phone through the voice agent. Service: 30min. Caller phone: +1 555 0100.
> Reason given: front brakes squealing.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Webhook 404 | Workflow is not active |
| Agent offers no times | `found: false`. Check the username, the service slug, and that the account has availability |
| `I could not complete that booking` | Look at the n8n execution. `Say what happened` carries the status and message |
| Books at the wrong time | `timeZone` in `Client config` is the caller's, not the store's |
| Booking has no notes | The agent called `book_appointment` without `reason` or `phone` |
| No confirmation email | Check the `emails` feature flag is **false**. Enabled means all mail is off |
| No reminders | The reminder schedulers are not running, see [N8N-REMINDERS.md](N8N-REMINDERS.md) |

---

## Limits worth stating plainly

- **Email over the phone is the weak point.** The agent spells it back and the
  workflow rejects a malformed address, but a caller who mishears their own address
  still books with a bad one. Expect this to be the most common failure.
- **A slot can go between reading it out and the caller agreeing.** Handled: the
  agent is told to offer another time.
- **No payment.** The agent is instructed never to discuss it.
- **No SMS.** Confirmation and reminders are email only.
- **Reminders only fire if scheduled.** A voice booking gets the same 48h, 24h and
  30m reminders as any other booking, and the same nothing if the schedulers are off.
- **One client per workflow and per number.**

## Related

- [VOICE-BOOKING-RUNBOOK.md](VOICE-BOOKING-RUNBOOK.md), the ordered setup for a new client

- `automations/bookyourslot-retell-voice.n8n.json` - the workflow
- `automations/retell-agent-script.md` - the prompt and function definitions
- [N8N-REMINDERS.md](N8N-REMINDERS.md) - the reminders a voice booking inherits
- [FEATURE-LEDGER.md](FEATURE-LEDGER.md) - what exists and what does not
