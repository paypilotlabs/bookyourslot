# Setting up voice booking for a client, in one sitting

The ordered version of what is already documented in detail elsewhere. Follow this
top to bottom for a new client. Roughly 45 minutes if the client's Google Calendar
is already connected, longer if it is not.

This runbook sequences two deep documents and does not restate them:

- [RETELL-VOICE-BOOKING.md](RETELL-VOICE-BOOKING.md), the voice workflow itself
- [N8N-REMINDERS.md](N8N-REMINDERS.md), the 48h / 24h / 30m reminder bands

## Have these open before you start

| Thing | Where |
|---|---|
| n8n editor | `http://100.91.157.6:5678/`, tailnet only, not public |
| The app, as the client's user | `https://bookyourslot.online` |
| Retell dashboard | your Retell account |
| `CRON_API_KEY` | `/root/production/.env` on the VPS, only needed for reminders |

You do not need a BookYourSlot API key. There is no working REST API on this
deployment. The voice flow uses the two public endpoints the booker itself uses.

## Already live, do not redo

Traefik already routes `/webhook/bookyourslot/` to n8n. Confirm in one command
rather than reconfiguring:

```bash
curl -s -X POST https://bookyourslot.online/webhook/bookyourslot/availability \
  -H 'Content-Type: application/json' -d '{"args":{}}' -w '\nHTTP %{http_code}\n'
```

Both webhooks are **POST only**. A plain `curl` with no `-X POST` returns 404 even
when everything is working, so do not use a GET as a health check.

A `200` with a `spoken` field means routing and the workflow are both live. A `404`
means the path reaches n8n but no active workflow claims it, which is the expected
state before you import. A `502`, a timeout, or a Traefik error page means the
routing itself regressed, and that is a separate problem to fix before continuing.

The n8n editor must stay unreachable from the internet. Confirm:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://bookyourslot.online/rest/login
```

`404` is correct, `/rest/login` is an n8n API route and nothing on this domain
should answer it. Anything else means the editor is exposed and you should stop and
fix that before going further.

## 1. The client's event types

Each service the agent can book needs its own event type. Create them first,
because the workflow references them by numeric id.

Open each one and note the id from the URL, `/event-types/3?tabName=setup` means
the id is `3`. Slugs will not work, the booking endpoint takes an id.

## 2. Name the calendar slot after the caller

This is the step that is easy to miss, and it is per event type. A new event type
leaves it blank, so it is part of onboarding every client.

By default a booking is titled:

```
30 mins discussion between Lohith Kumar and Priya Raman
```

The business owner scanning tomorrow's column wants the customer's name first, not
their own. Set a custom name:

**Event Types, pick the service, Advanced tab, "Event name in calendar":**

```
{Scheduler} - {Event type title}
```

which produces:

```
Priya Raman - Consultation
```

The pencil icon beside the field opens the variable list. The ones worth knowing:

| Variable | Becomes |
|---|---|
| `{Scheduler}` | the person who booked, so the caller |
| `{Scheduler first name}` | the first word of that name |
| `{Event type title}` | the service name |
| `{Organiser}` | the host |
| `{Location}` | Google Meet, In person, and so on |
| `{Event duration}` | `30 mins` |

Where the custom name actually lands:

- Google Calendar event title, yes
- Bookings list in the app, yes
- Reminder email body, yes
- Reminder email **subject line**, no

The subject deliberately keeps the service name. That is a decision, not a bug, and
it is commented at `apps/web/app/api/cron/attendeeReminder/route.ts:116`. A customer
receiving "Reminder: Consultation" reads better than one addressed with their own
name.

For a phone booking the name is whatever the agent captured and read back, so this
setting is only ever as good as the name confirmation in the agent prompt. That is
why the prompt confirms every field as it is taken.

Leaving the field blank is a valid choice. It falls back to the old
"X between A and B" wording, nothing breaks.

## 3. Import and configure the voice workflow

`automations/bookyourslot-retell-voice.n8n.json`, then edit **both** `Client config`
nodes. They carry the same block and both need it.

Full field reference in
[RETELL-VOICE-BOOKING.md section 2](RETELL-VOICE-BOOKING.md#2-configure-the-client).

One workflow and one Retell number per client. A shared number books the wrong
business, silently.

## 4. Activate, then collect the two URLs

Webhooks return 404 while a workflow is inactive and n8n gives you no warning.
Activate first, then copy the production URLs for the availability and booking
webhooks.

## 5. Build the Retell agent

Paste `automations/retell-agent-script.md` as the General Prompt and fill the four
placeholders. Everything in double braces is per client, nothing else in the prompt
changes, which is what makes it installable on anyone's system:

| Placeholder | Example |
|---|---|
| `{{BUSINESS_NAME}}` | Northside Dental |
| `{{ASSISTANT_NAME}}` | Maya |
| `{{SERVICE_LIST}}` | consultation, cleaning |
| `{{HOURS}}` | Mon to Fri, 9 to 5 |

Add the two custom functions pointing at the URLs from step 4.

## 6. Assign a number

Point a Retell number at the agent. Verify it is not shared with another client.

## 7. Reminders for this client

Follow [N8N-REMINDERS.md](N8N-REMINDERS.md). The scheduler workflow is instance wide,
not per client, so if it is already active you have nothing to do here beyond
confirming it is still running.

## 8. Call it yourself before a customer does

Place a real call and book a real slot. Then verify, in order:

1. The booking appears in the app
2. The calendar event title reads `Caller Name - Service`, which proves step 2
3. The confirmation email arrived
4. Google Meet link is present, if the event type is a video location
5. Cancel the test booking

A 200 from a webhook is not evidence a booking exists. Check the bookings list.

## If something is wrong

| Symptom | Cause |
|---|---|
| Webhook 404 from the internet | You sent a GET, the webhooks are POST only. Otherwise the workflow is inactive, or the path is not under `/webhook/bookyourslot/` |
| Agent books, nothing appears | Check the n8n execution, the booking node returns `neverError` so failures look like success |
| Calendar title still "X between A and B" | Step 2 not set on that specific event type |
| Caller reaches silence after giving details | The validation IF node, see the troubleshooting section in RETELL-VOICE-BOOKING.md |
| No reminder | Nothing in the app schedules reminders, an external caller must hit the cron route |

## Related

- [RETELL-VOICE-BOOKING.md](RETELL-VOICE-BOOKING.md)
- [N8N-REMINDERS.md](N8N-REMINDERS.md)
- [FEATURE-LEDGER.md](FEATURE-LEDGER.md), what is real on this deployment
