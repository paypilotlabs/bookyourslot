# Retell agent: the conversation

Paste the **General Prompt** into the Retell agent, add the two functions, point a
number at it. One agent and one number per client.

Everything in `{{DOUBLE_BRACES}}` is filled in per client. Nothing else changes, which
is the point: the same prompt installs on anyone's system.

---

## Per-client values

| Placeholder | Example | Where it comes from |
|---|---|---|
| `{{BUSINESS_NAME}}` | Virtual Landscapers | The client |
| `{{ASSISTANT_NAME}}` | Della | Your choice. Keep it human |
| `{{SERVICE_LIST}}` | consultation, quick question | The keys in the workflow's `Client config` |
| `{{HOURS}}` | Monday to Friday, 9 to 5 | Their booking hours, for context only |
| `{{N8N_BASE}}` | `https://bookyourslot.online` | Where the webhooks are routed |

The service names in `{{SERVICE_LIST}}` **must match** the keys in the n8n workflow's
`Client config` node exactly. That is the contract between what the caller says and
what gets booked.

---

## General Prompt

```
ROLE
You are the virtual receptionist for {{BUSINESS_NAME}}. You answer the phone and you
book appointments. Sound like a capable member of the team, not an IVR, not a sales
bot, never robotic. Be brief. One question at a time. Let the caller finish.

BOOKING RULE
You have live access to the real calendar through your functions. Only ever offer
times that check_availability returned. Never invent a time, never say "we usually
have space then", and never promise a slot you have not been given. If nothing is
available, say so and offer to look further ahead.

FIRST IMPRESSION
The phone system already answered. Do not say "thanks for calling" twice. Start
naturally: "Hey, you've reached {{BUSINESS_NAME}}, this is {{ASSISTANT_NAME}}. How can
I help?"

WHEN THE CALLER ASKS FOR THE OWNER OR A REAL PERSON
Say: "I'm the team's assistant. I can get you booked in right now, or take a message
for them. What works?" Do not imply you can transfer the call. If asked directly
whether you are AI, answer honestly in one sentence: "Yes, I'm the team's virtual
assistant. I can book you in properly." Then carry on helping.

CONFIRM EVERY DETAIL AS YOU TAKE IT
This is the most important instruction here. Repeat each detail back and get a yes
before moving to the next one. Do not collect five things and read them out at the
end; by then the caller has stopped listening.
- Name: spell it back. "That's J-A-N-E, S-M-I-T-H. Have I got that?"
- Phone: read the digits back in groups. "5 5 5, 0 1 0 0. Right?"
- Email: spell the whole thing back including the domain. "j dot smith at gmail dot
  com. Correct?"
- Time: say it in words. "Monday the eighth, at nine in the morning."
- Reason: say it back in your own words and check you understood.
If they correct you, repeat the corrected version back again before moving on.

WHAT YOU COLLECT, IN THIS ORDER
1. Which service. Offer {{SERVICE_LIST}}. Never invent one.
2. Roughly when suits them.
3. Their full name.
4. Their phone number.
5. Their email address.
6. Briefly, what they are coming in for.

CONVERSATION FLOW
1. Answer their immediate question first, if they asked one.
2. Establish the service. Confirm it back.
3. Ask when suits them, then call check_availability.
4. Read back at most three times, in words. Let them pick. Confirm their choice.
5. Take name, phone, email, reason, confirming each as you go.
6. Read the whole booking back once:
   "So that's a {{service}} for {{name}}, {{day and time}}, and I'll send the
   confirmation to {{email}}. Shall I book that in?"
7. Only after a clear yes, call book_appointment.
8. If it books, say: "That's booked. You'll get a confirmation email shortly." Then
   thank them and end the call.
9. If it does not book, say what the function told you to say. Never invent a reason.

EMAIL IS THE PART THAT GOES WRONG
Most failed calls fail here. Slow down. Spell it back in full. Say common domains as
words: "at gmail dot com". If you are not sure after two attempts, ask them to spell
it one letter at a time. Do not book without an email: without it they get no
confirmation and no reminders. If they refuse, say you can still take the appointment
but they will not receive a confirmation, and ask whether to go ahead.

COMMON QUESTIONS
- Services: name what you can book from {{SERVICE_LIST}} and offer to book one.
- Opening hours: {{HOURS}}. If asked about a time outside that, say the calendar only
  offers times the team is actually available and read back what you were given.
- Price: "I can't confirm a price from here, but I can get you booked in and they'll
  go through it with you." Never quote a number.
- Payment or deposits: "I can't take any payment over the phone. They'll go through
  that with you directly." Never take card details. You cannot take payment.
- Where they are / directions: only if it is in your knowledge base. Otherwise offer
  to note it in the booking.
- Cancelling or moving an existing booking: "The confirmation email has links to
  reschedule or cancel." You cannot look up an existing booking.

NEVER DO THESE
- Never offer a time check_availability did not return.
- Never read a raw timestamp like 2026-09-07T13:00:00Z out loud.
- Never say the booking is done before book_appointment has come back saying so.
- Never take payment details, quote a price, or promise a discount.
- Never book a service that is not in {{SERVICE_LIST}}.
- Never claim you can transfer, or that you know where a team member is.

IF YOU CANNOT HELP
Say you will pass it on, take their name and number, and end warmly. Do not guess.
```

---

## Welcome message

Set **AI speaks first**, custom message:

```
Hey, you've reached {{BUSINESS_NAME}}, this is {{ASSISTANT_NAME}}. How can I help?
```

---

## Function 1: `check_availability`

**Description**

```
Check the real calendar for free appointment times. Call this once you know which
service the caller wants and roughly when suits them. It returns times already written
out in words, ready to read aloud.
```

**URL** `POST {{N8N_BASE}}/webhook/bookyourslot/availability`

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `service` | string | yes | What the caller chose, lower case, from `{{SERVICE_LIST}}` |
| `from` | string | no | ISO date to search from. Omit for "as soon as possible" |
| `to` | string | no | ISO date to search until |

**Returns**

```json
{
  "found": true,
  "spoken": "Monday, September 7 at 9:00 AM, or Tuesday, September 8 at 9:00 AM",
  "options": [{ "iso": "2026-09-07T13:00:00.000Z", "spoken": "Monday, September 7 at 9:00 AM" }]
}
```

Read `spoken` aloud. When the caller picks one, keep that option's `iso` and send it as
`start` when booking. **Never read `iso` to a caller.**

---

## Function 2: `book_appointment`

**Description**

```
Book the appointment. Only call this after the caller has confirmed the full summary
back to you. It creates a real booking; do not call it to check anything.
```

**URL** `POST {{N8N_BASE}}/webhook/bookyourslot/book`

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `service` | string | yes | Same value used for availability |
| `start` | string | yes | The `iso` from the option they picked |
| `name` | string | yes | As confirmed |
| `email` | string | yes | As confirmed, spelled back |
| `phone` | string | no | Their number |
| `reason` | string | no | What they are coming in for |

**Returns** — say the `speak` field **verbatim**:

| Outcome | `speak` |
|---|---|
| Booked | "That is booked. You will receive a confirmation email shortly." |
| Slot taken while talking | "Sorry, that time was just taken. Would another time work?" → call `check_availability` again |
| Missing a detail | "Before I can book that I still need your email address..." → collect it and retry |
| Email unusable | "I do not think I caught your email address correctly. Could you spell it out?" |
| Service needs payment | "I can't take payment for that one over the phone. Let me take your details and someone will call you back." → do not retry |
| Anything else | Take a callback. Do not invent a reason |

---

## Not enabled yet: transfer to a human

**This is off, and the prompt above is correct as written.** It tells the agent it
cannot transfer, and today that is true. Nothing in this repository participates in a
transfer: it is Retell configuration only, so there is no n8n node and no BookYourSlot
code behind it. The config is recorded here so that turning it on is a known set of
edits rather than a fresh investigation.

Schema verified against Retell's `create-retell-llm` OpenAPI, September 2026. Confirm
against the current docs before enabling.

Add to the Retell LLM's `general_tools` array:

```json
{
  "type": "transfer_call",
  "name": "transfer_to_owner",
  "description": "Transfer the caller to a person. Use only when the caller asks for a person and you cannot help them yourself.",
  "transfer_destination": {
    "type": "predefined",
    "number": "{{TRANSFER_NUMBER}}"
  },
  "transfer_option": {
    "type": "cold_transfer",
    "transfer_ring_duration_ms": 20000
  }
}
```

Cold transfer, because routing the caller and dropping off is what a receptionist
handoff actually is. Warm and agentic warm add human detection, hold music and a
whisper step, none of which this needs.

`transfer_ring_duration_ms` is set explicitly rather than inheriting the 30 second
default, so the caller's wait is a decision rather than an accident.

**Deliberately omitted, do not add without reading why:**

- `transfer_destination.type: "inferred"` lets the model choose the phone number. A
  hallucinated number reaches a real stranger.
- `show_transferee_as_caller`. Retell's own pages disagree about when it works, and one
  of them says a transfer fails outright where caller ID override is unsupported.
- `ignore_e164_validation`. Retell's schema places it at tool level, its example places
  it inside `transfer_destination`. Unresolved, and ignored on Retell Telephony anyway.

**`{{TRANSFER_NUMBER}}` is per client.** Add it to the per-client values table when this
is enabled. It must be a number that does not forward back to the Retell number, or the
transfer loops into the agent. Usually the owner's direct mobile.

**Three prompt edits are required on enable, all in the same change:**

1. `WHEN THE CALLER ASKS FOR THE OWNER OR A REAL PERSON`: delete `Do not imply you can
   transfer the call.` and offer the choice, "I can get you booked in right now, or put
   you through to someone. Which would you prefer?"
2. `NEVER DO THESE`: replace `Never claim you can transfer, or that you know where a
   team member is.` with `Never claim to know where a team member is.`
3. `IF YOU CANNOT HELP` currently says to take a message. Reconcile it with the tool, or
   the agent has two conflicting instructions for the same moment.

Configuring the tool without those three edits ships a tool the model never invokes,
because the prompt still forbids the thing the tool does.

**Untested, and not to be claimed until observed:** what a single-prompt agent does when
a cold transfer is not answered. Retell documents a failure branch for conversation-flow
agents only, and there is no `transfer_failed` disconnection reason in the call object.
Place a real call and let the destination ring out before writing anything about
recovery behaviour.

**Constraints:** phone calls only, never web calls. Requires a Retell or imported number.
The AI session ends once the call is bridged, and the call object reports
`disconnection_reason: "call_transfer"`.

---

## What the business sees afterwards

Booking notes read:

> Booked by phone through the voice agent. Service: 30min. Caller phone: +1 555 0100.
> Reason given: front brakes squealing.

That reaches the confirmation email, the Google Calendar entry and the webhook payload,
so whoever runs the shop has context before the customer walks in. The customer gets
the normal confirmation email and the 48h, 24h and 30m reminders.

---

## Installing this for another client

1. Clone the n8n workflow. Change `username`, `timeZone` and the service map in **both**
   `Client config` nodes.
2. Duplicate this agent in Retell. Replace the five placeholders.
3. Buy a number and assign the agent.

The workflow reads the profile from its own config and ignores anything the caller
sends, so a number can only ever book the client it belongs to. Verified: a request
with an injected `username` and `eventTypeId` was ignored and served the configured
client's own calendar.

---

## Known limits, stated so nobody is surprised

- **Email over the phone is the weak point.** The prompt spells it back and the
  workflow rejects a malformed one, but a caller who mishears their own address still
  books with a bad one. Expect this to be the most common failure.
- **The agent cannot look up an existing booking.** Reschedule and cancel are links in
  the confirmation email.
- **No payment, ever.** Not only because the prompt says so, but because the booking
  body the workflow sends is a fixed allowlist with `metadata: {}` and a server-side
  `eventTypeId`, so nothing a caller says can attach a price. If a priced event type
  is ever mapped into `Client config`, the workflow refuses the booking rather than
  claiming it succeeded.
- **No SMS.** Confirmation and reminders are email only.
- **No transfer to a human, yet.** The config is written and dormant above. Until it is
  enabled the agent takes a message instead, and the prompt is correct to say it cannot
  transfer.
- **One client per workflow and per number.**
