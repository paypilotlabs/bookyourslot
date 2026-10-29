# Voice booking test plan

A testing session you can run top to bottom. Tick as you go, and log anything that
misbehaves in [Bug log](#bug-log) at the bottom.

Covers the phone path end to end plus the reminders. Local and web testing is separate
and lives in [TESTING.md](TESTING.md).

## State as of 7 September 2026, 00:05

Verified against the live system just now, so you are not testing blind:

| Thing | State |
| --- | --- |
| Deployed image | `sha-5fa3431`, matches `main`, site 200 |
| VPS source checkout | up to date, 0 behind |
| Availability webhook | live, returning real slots |
| Booking webhook | live, correctly refuses incomplete details |
| Reminders | **working**, all three bands firing, dedupe proven |
| n8n voice workflow | **stale, missing the availability fix** |
| Calendar event name | **not set** on either event type |

Two of those are things only you can fix, and they are Part 0.

---

# Part 0. Do these first

**Everything in Part 1 and 2 tests the old behaviour until Part 0 is done.** This is the
part that catches people out: the code is merged and deployed, but two of these live
outside the repo entirely.

## 0.1 Re-import the voice workflow into n8n

**Confirmed not done.** I checked the live workflow against the repo:

| Marker | Live n8n | Repo |
| --- | --- | --- |
| `continueRegularOutput` | 0 | 1 |
| `cannot see the calendar` | 0 | 1 |
| `res.body` | 1 | 2 |

Your n8n screenshot agrees: "Last updated 17 hours ago", and the fix merged two hours
ago. So a failed slots lookup still returns silence to a caller.

At `http://<tailnet-ip>:5678/`:

- [ ] Open the **existing** "BookYourSlot voice booking (Retell)" workflow. Import
      `automations/bookyourslot-retell-voice.n8n.json` **into it**, not as a new workflow.
      A fresh import creates a second workflow claiming `bookyourslot/availability`, the
      old published one keeps winning, and nothing you test afterwards means anything.
- [ ] **Re-publish it.** The exported file carries `"active": false`. Webhooks 404 while
      a workflow is unpublished and n8n does not warn you.
- [ ] **Check both `Client config` nodes** still say `startwithleo` and
      `America/Detroit`. The import overwrites them with whatever the file carries.

Confirm the import actually took, from your laptop:

```bash
curl -s -X POST https://bookyourslot.online/webhook/bookyourslot/availability -H 'Content-Type: application/json' -d '{"args":{}}' -w '\nHTTP %{http_code}\n'
```

- [ ] Still returns HTTP 200 with real times in `spoken`. If it now returns
      "I cannot see the calendar right now", the response path is wrong and **every**
      caller will hear that. Stop and tell me.

## 0.2 Name the calendar slot after the caller

**Confirmed not set** — both event types have `eventName` null, so a phone booking lands
on your calendar as "30 mins discussion between Lohith Kumar and Priya Raman" rather than
leading with the customer.

For each event type you let the agent book (ids 1 and 3):

- [ ] Event Types → the service → **Advanced** → **Event name in calendar** →
      `{Scheduler} - {Event type title}` → Save.

## 0.3 Retell agent

- [ ] Paste `automations/retell-agent-script.md` General Prompt into the agent, filling
      the four placeholders: `{{BUSINESS_NAME}}`, `{{ASSISTANT_NAME}}`,
      `{{SERVICE_LIST}}`, `{{HOURS}}`.
- [ ] Add function `check_availability` → `POST https://bookyourslot.online/webhook/bookyourslot/availability`
- [ ] Add function `book_appointment` → `POST https://bookyourslot.online/webhook/bookyourslot/book`
- [ ] Confirm a phone number is assigned to this agent, and that it is not shared with
      another client.
- [ ] **Check the function timeout** in Retell against 40 seconds. The slots node retries
      once at a 20s timeout, so a hung server can take ~40s to produce the spoken
      fallback. If Retell's timeout is shorter, the caller hears dead air first. Note the
      value in the bug log either way.

---

# Part 1. Pre-flight, no phone needed

*5 minutes.* Run these from your laptop. They prove the plumbing before you spend a call.

## T1.1 Availability returns real times

```bash
curl -s -X POST https://bookyourslot.online/webhook/bookyourslot/availability -H 'Content-Type: application/json' -d '{"args":{}}' -w '\nHTTP %{http_code}\n'
```

- [ ] HTTP 200, `"found": true`, `spoken` names three times on different days, `options`
      carries matching `iso` values.

## T1.2 Booking refuses incomplete details

```bash
curl -s -X POST https://bookyourslot.online/webhook/bookyourslot/book -H 'Content-Type: application/json' -d '{"args":{"name":"Test Caller"}}' -w '\nHTTP %{http_code}\n'
```

- [ ] HTTP 200, `"booked": false`, and `missing` lists what is absent. **No booking is
      created.** This is the PR #54 guard; if it books, stop immediately.

## T1.3 A garbage time is refused, not booked

```bash
curl -s -X POST https://bookyourslot.online/webhook/bookyourslot/book -H 'Content-Type: application/json' -d '{"args":{"name":"Test Caller","email":"test@example.com","start":"not-a-time"}}' -w '\nHTTP %{http_code}\n'
```

- [ ] `"booked": false`. Whatever it says, it must not be "That is booked".

## T1.4 The availability fallback (only meaningful after 0.1)

This is the fix you just imported, and it is worth proving rather than assuming.

In the n8n editor, open `Read free slots` and append a character to the `getSchedule`
URL so it 404s. Save. Then run T1.1 again.

- [ ] HTTP **200** with `spoken: "I cannot see the calendar right now..."` — **not** an
      empty body, and **not** "nothing in the next two weeks".
- [ ] Revert the URL and save. Re-run T1.1 and confirm real times come back.

Optional but it is the half that is otherwise untested: set `timeout` to `1`, save, run
T1.1, confirm the same fallback sentence (that is `onError` working, not `neverError`),
then restore `20000`.

- [ ] Timeout path produces the fallback.

---

# Part 2. The call

*20 minutes.* The real test. Have a notepad open; log wording that felt wrong even if it
technically worked.

## T2.1 Happy path

Call the number and book an appointment normally. Give a real email you can check.

- [ ] Agent greets with the business name.
- [ ] It offers **three** times, spoken as words, never a raw timestamp like
      `2026-09-07T13:00:00Z`.
- [ ] It reads your name back and your email back before booking.
- [ ] It says the booking is done **only after** it actually completed.
- [ ] Total call feels under two minutes.

## T2.2 Email over the phone, the known weak point

Call again. Say your email naturally, at speed, with an "at" and a "dot".

- [ ] It spells the address back to you.
- [ ] If it mishears, it asks you to spell it letter by letter rather than guessing.

## T2.3 Refuse to give an email

- [ ] It explains you will not get a confirmation or reminders, and asks whether to go
      ahead anyway. It must not silently book with a fake address.

## T2.4 Ask for a human

Say "can I speak to the owner".

- [ ] It offers to book you in or take a message. It must **not** claim it can transfer
      you, because transfer is deliberately off.

## T2.5 Ask about price and payment

Ask "how much does this cost" and then "can I pay now with my card".

- [ ] It does not quote a number.
- [ ] It says it cannot take payment over the phone and redirects.
- [ ] It never asks for card details.

## T2.6 Ask for a time that was not offered

Ask for something outside the offered slots, e.g. "do you have 3am Sunday".

- [ ] It does not invent a time. It re-reads what is genuinely available.

---

# Part 3. After the call

*10 minutes.* Verify what the call claims actually happened. A spoken "you're booked" is
not evidence.

## T3.1 The booking exists

- [ ] It appears in Bookings in the app, with the right time and attendee.

## T3.2 The calendar entry reads correctly

- [ ] The Google Calendar event title is **`Caller Name - Service`**, which proves 0.2
      took. If it reads "30 mins discussion between ... and ...", the event name is not
      set on that event type.

## T3.3 The confirmation email arrived

- [ ] Landed, and in the inbox rather than spam.
- [ ] The **Where** block carries a working Google Meet link, not just the provider name.

## T3.4 Cancel and reschedule

- [ ] The links in the confirmation email work.
- [ ] Cancelling frees the slot: run T1.1 and confirm that time is offered again.

---

# Part 4. Reminders

Already proven working at the system level, so this is a spot check rather than a hunt.
All three bands fired tonight and correctly skipped a booking already reminded:

```
attendeeReminder[24h]: sent=0 skipped=0 failed=0
attendeeReminder[30m]: sent=0 skipped=0 failed=0
attendeeReminder[48h]: sent=0 skipped=1 failed=0
```

- [ ] Book something ~35 minutes out, wait for the 30m band (runs every 10 minutes),
      confirm the reminder email arrives with the Meet link.
- [ ] Confirm it arrives **once**, not on every subsequent run.

```bash
ssh root@<server-ip> 'docker logs production-bookyourslot-1 2>&1 | grep attendeeReminder | tail -5'
```

- [ ] `sent=1` on the run that sent it, `skipped=1` on the next one.

---

# Part 5. Regression

The voice path is new; these are the things it must not have broken.

- [ ] **Web booking still works.** Book from a private window at
      `https://bookyourslot.online/startwithleo/30min`.
- [ ] **Holidays settings page loads.** Settings → Out of office → Holidays. This was
      showing customers `GOOGLE_CALENDAR_API_KEY environment variable is not set` until
      today's deploy. It should now load with the country dropdown populated. Picking a
      country shows "no holidays found", which is correct until the key is set.
- [ ] **App store still hidden from customers.** As a non-admin, `/apps` should not offer
      anything beyond the calendar category.
- [ ] **No paid event type is bookable by voice.** Do not put a price on ids 1 or 3. If
      one ever gets a price, the agent now refuses rather than falsely confirming, but
      the booking would still be unconfirmable.

---

# Bug log

Copy a block per issue. Be specific about what you did and what you saw, because the
wording is usually the bug.

```
### BUG-01
Test:        T2.x
What I did:  
What I saw:  
Expected:    
Call ID:     (from the Retell dashboard, if it was a call)
Severity:    blocker / annoying / cosmetic
```

### Known and expected, do not log these

- Picking a holiday country shows "no holidays found". Correct until
  `GOOGLE_CALENDAR_API_KEY` is set. Backlog 13c.
- The agent cannot look up, cancel or reschedule an existing booking. Those are links in
  the confirmation email. Not built.
- No SMS confirmation. Email only, by design.
- The agent cannot transfer to a human. Deliberately off; the config is written and
  dormant. Backlog 16.
- A GET to either webhook returns 404. They are POST only. Not an outage.

---

## Related

- [OPS-RUNBOOK.md](OPS-RUNBOOK.md), the VPS work
- [VOICE-BOOKING-RUNBOOK.md](VOICE-BOOKING-RUNBOOK.md), setting up a new voice client
- [TESTING.md](TESTING.md), local and web testing
- [BACKLOG.md](BACKLOG.md), what is knowingly not done
