# Appointment reminders, end to end

Three reminder emails per booking (48 hours, 24 hours and 30 minutes before the
start), plus the job that makes `MEETING_STARTED` and `MEETING_ENDED` fire at all.

The app decides **who** to remind and **when**. n8n only decides **how often to
ask**. Nothing schedules these inside the app, so if n8n stops, reminders stop.

---

## How it works

BookYourSlot splits the runway into three bands. A booking travels down it and
collects one reminder per band.

| Band | Fires when the booking starts | Skips bookings made less than | Marker written | n8n must call |
|---|---|---|---|---|
| `48h` | 24 to 48 hours away | 2 hours ago | `reminderSentAt48h` | hourly |
| `24h` | 30 minutes to 24 hours away | 2 hours ago | `reminderSentAt` | hourly |
| `30m` | 0 to 30 minutes away | 30 minutes ago | `reminderSentAt30m` | **every 10 minutes** |

The bands touch but never overlap, so a booking cannot collect the same reminder
twice. Each band writes its own marker onto the booking, so calling a window twice
in a row sends nothing the second time.

**A booking made a week ahead gets all three. A booking made three hours ahead gets
two** (the `24h` band, then the `30m` band). One made ten minutes ahead gets none,
which is deliberate: the confirmation email it just received is the reminder.

Cancelled and rescheduled bookings are handled for free. Every run re-queries live
state and only looks at bookings that are still `ACCEPTED`, so a booking cancelled
after a reminder was scheduled is simply not there any more.

### Why the 30 minute band needs a 10 minute cadence

Its band is only 30 minutes wide. An hourly schedule would step straight over most
bookings and they would never be reminded. The other two bands are 24 and 23.5
hours wide, so hourly is ample.

---

## Setup

### 1. Get the key

On the VPS:

```bash
grep '^CRON_API_KEY=' /opt/bookyourslot/deploy/production/.env
```

Copy the value. It is not in the workflow file and must not be committed anywhere.

### 2. Import the workflow

n8n is reachable on your tailnet at `http://<tailnet-ip>:5678`. It is not exposed
publicly, which is correct and should stay that way.

In n8n: **Workflows** then **Import from File**, and choose
`automations/bookyourslot-schedulers.n8n.json` from this repository.

You get one workflow, **BookYourSlot schedulers**, holding four independent chains.
They are deliberately not connected to each other.

### 3. Create the credential

**Credentials** then **New**, type **Header Auth**:

| Field | Value |
|---|---|
| Name | `Authorization` |
| Value | the `CRON_API_KEY` from step 1 |

**No `Bearer` prefix.** The route compares the header to the key exactly, so
`Bearer abc123` fails where `abc123` succeeds.

Call the credential `BookYourSlot CRON key`.

### 4. Attach it to all four HTTP nodes

Each imported HTTP Request node shows `REPLACE_ME` where the credential goes. Open
each of the four and pick the credential you just made. Missing one is the most
common setup mistake, and its symptom is that three reminders work and one silently
does not.

### 5. Activate

Toggle the workflow **Active**. Schedule triggers do not run while a workflow is
inactive, and n8n gives no warning about this.

---

## Verify it works

### Each chain, by hand

Open a chain and press **Execute step** on its HTTP node. A healthy response:

```json
{ "window": "24h", "sent": 0, "skipped": 0, "failed": 0, "considered": 0 }
```

`considered: 0` just means nothing is in that band right now. That is a pass.

| Response | Meaning |
|---|---|
| `401 Not authenticated` | Credential missing, wrong, or has a `Bearer` prefix |
| `400 Unknown window` | The `?window=` value was mistyped. Valid: `48h`, `24h`, `30m` |
| `405` | The node is set to GET. These routes are POST only |

### End to end, with a real booking

1. Book a slot **more than 48 hours out** on your own link.
2. Wait two hours, so the booking clears the creation floor.
3. Run the `48h` chain by hand. It will report `considered: 1`, `sent: 1`.
4. Check the inbox. Subject: `Reminder: <service> with <name> at <date>`, and it
   carries the Google Meet join link.
5. Confirm the marker was written:

```bash
docker exec -i production-database-1 sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "select id, metadata from \"Booking\" order by id desc limit 3;"'
```

You should see `reminderSentAt48h` on that booking. Run the same chain again: it
reports `skipped: 1, sent: 0`. That is the dedupe working.

### Confirm the schedule is actually running

```bash
cd /opt/bookyourslot/deploy/production && docker compose \
  -f docker-compose.yml -f docker-compose.registry.yml -f docker-compose.override.yml \
  logs --since 2h bookyourslot | grep attendeeReminder
```

You want lines like `attendeeReminder[24h]: sent=0 skipped=0 failed=0`, several per
hour. **No lines at all means n8n is not calling and no reminders are being sent.**

---

## Troubleshooting

**Nothing in the logs.** The workflow is inactive, or the trigger is disabled, or
n8n is down. Check n8n's own **Executions** tab first.

**`401` after it had been working.** The key was rotated in `.env` without updating
the n8n credential.

**Reminders stopped for one band only.** That band's HTTP node lost its credential,
or its trigger was disabled. The other three carry on, which is why this is easy to
miss.

**A customer got two reminders in a day.** Expected when a booking is made inside
24 hours: it lands in the `24h` band immediately and then passes through `30m`.

**A customer got none.** Check the booking is `ACCEPTED` rather than pending, and
that it was created long enough before the appointment to clear the floor.

---

## What this does not do

Stated plainly so nothing here is oversold:

- **Email only.** No SMS and no WhatsApp. The SMS layer in this codebase checks a
  rate limit and returns without sending. The 30 minute reminder is the one that
  most wants to be a text and cannot be.
- **No per-service control.** Reminders are on for every accepted booking on the
  instance. There is no toggle in the UI.
- **No reminder to the host**, only the attendee.
- **Delivery is not confirmed.** SMTP failures are logged and swallowed, so
  `sent: 1` means handed to the mail server, not read by a human.
- **If n8n stops, reminders stop silently.** Nothing alerts on their absence. Worth
  putting an n8n error workflow on these four nodes.

---

## Related

- [VOICE-BOOKING-RUNBOOK.md](VOICE-BOOKING-RUNBOOK.md), the ordered setup for a new client

- `automations/bookyourslot-schedulers.n8n.json` - the importable workflow
- `apps/web/app/api/cron/attendeeReminder/window.ts` - the band definitions
- `docs/N8N.md` - webhooks from BookYourSlot into n8n, the other direction
- `docs/PRODUCT-SOURCE-OF-TRUTH.md` - what may and may not be claimed
