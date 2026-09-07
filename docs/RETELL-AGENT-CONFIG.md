# Retell agent configuration, filled in

Paste-ready configuration for the `startwithleo` account. Every value below is real,
read from the live system on 7 September 2026, not a placeholder.

For a different client, change only the marked values and give them their own workflow
and their own number. See [VOICE-BOOKING-RUNBOOK.md](VOICE-BOOKING-RUNBOOK.md).

## The values this agent is built on

| Thing | Value | Where it came from |
| --- | --- | --- |
| Account | `startwithleo`, Lohith Kumar | users table |
| Timezone | `America/Detroit` | the store's timezone, not the caller's |
| Hours | Monday to Friday, 09:00 to 17:00 | Availability, days `{1,2,3,4,5}` |
| Service: consultation | `30min`, event type **3**, 30 minutes | Client config node |
| Service: quick question | `15min`, event type **1**, 15 minutes | Client config node |
| Webhook base | `https://bookyourslot.online` | Traefik route, verified live |

**The two service words matter.** The workflow matches on the literal strings
`consultation` and `quick question`, lowercased and trimmed. Anything else falls back to
`consultation` without complaining, so an agent that invents "thirty minute meeting"
books the wrong thing and nothing looks wrong.

---

## 1. Create the agent

Retell dashboard, new **Single Prompt** agent. Not conversation flow: the transfer config
in this repo and the prompt below both assume single prompt.

Settings worth setting deliberately:

| Setting | Value | Why |
| --- | --- | --- |
| AI speaks first | **On**, with the welcome message below | The phone system has already answered |
| Voice | Any natural one | Test it on a real call, not in the preview |
| Interruption sensitivity | Default | Callers interrupt when reading back an email |
| **Max call duration** | 10 minutes | A booking call should take two |
| **Function timeout** | **45 seconds or more** | See the warning below |

**Function timeout is the one people get wrong.** `Read free slots` uses a 20 second
timeout and retries once, so a slow calendar can take about 40 seconds to return the
spoken fallback. If Retell gives up first the caller hears dead air, and the fallback
sentence this repo added never gets spoken. Set it above 40.

---

## 2. Welcome message

```
Hey, you've reached BookYourSlot, this is Maya. How can I help?
```

Change `BookYourSlot` and `Maya` per client.

---

## 3. General Prompt

Paste this whole block. It is the script from
[../automations/retell-agent-script.md](../automations/retell-agent-script.md) with the
four placeholders filled in.

```
ROLE
You are the virtual receptionist for BookYourSlot. You answer the phone and you
book appointments. Sound like a capable member of the team, not an IVR, not a sales
bot, never robotic. Be brief. One question at a time. Let the caller finish.

BOOKING RULE
You have live access to the real calendar through your functions. Only ever offer
times that check_availability returned. Never invent a time, never say "we usually
have space then", and never promise a slot you have not been given. If nothing is
available, say so and offer to look further ahead.

SERVICE NAMES, EXACTLY
There are two services and you must send them to the functions using these exact
words, lower case, nothing else:
- "consultation"    -> the 30 minute appointment
- "quick question"  -> the 15 minute appointment
You may describe them naturally to the caller, for example "a full consultation, that
is half an hour" or "a quick question, about fifteen minutes". But the value you send
in the service parameter is always one of those two strings. Sending anything else
books the wrong appointment and nobody will notice until the caller arrives.

FIRST IMPRESSION
The phone system already answered. Do not say "thanks for calling" twice. Start
naturally: "Hey, you've reached BookYourSlot, this is Maya. How can I help?"

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
1. Which service. Offer a consultation, or a quick question. Never invent one.
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
   "So that's a consultation for Jane Smith, Monday the eighth at nine in the morning,
   and I'll send the confirmation to jane at gmail dot com. Shall I book that in?"
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
- Services: a consultation, which is half an hour, or a quick question, about fifteen
  minutes. Offer to book one.
- Opening hours: Monday to Friday, 9am to 5pm Eastern. If asked about a time outside
  that, say the calendar only offers times the team is actually available and read
  back what you were given.
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
- Never book a service other than "consultation" or "quick question".
- Never claim you can transfer, or that you know where a team member is.

IF YOU CANNOT HELP
Say you will pass it on, take their name and number, and end warmly. Do not guess.
```

---

## 4. Function 1: `check_availability`

**Name** `check_availability`

**URL** `POST https://bookyourslot.online/webhook/bookyourslot/availability`

**Description**

```
Check the real calendar for free appointment times. Call this once you know which
service the caller wants and roughly when suits them. It returns times already
written out in words, ready to read aloud.
```

**Parameters**

```json
{
  "type": "object",
  "properties": {
    "service": {
      "type": "string",
      "enum": ["consultation", "quick question"],
      "description": "Which service the caller wants. Exactly one of these two strings."
    },
    "from": {
      "type": "string",
      "description": "Optional ISO date to search from. Omit for as soon as possible."
    },
    "to": {
      "type": "string",
      "description": "Optional ISO date to search until."
    }
  },
  "required": ["service"]
}
```

The `enum` is doing real work: it stops the model inventing a service name that would
silently book the wrong appointment.

**Speak during execution:** on, something like "Let me check the calendar."
**Speak after execution:** off. The prompt already tells it to read `spoken`.

**What it returns**

```json
{
  "found": true,
  "spoken": "Monday, September 7 at 9:00 AM, or Tuesday, September 8 at 9:00 AM",
  "options": [{ "iso": "2026-09-07T13:00:00.000Z", "spoken": "Monday, September 7 at 9:00 AM" }]
}
```

Read `spoken` aloud. Keep the chosen option's `iso` and send it as `start` when booking.
Never read `iso` to a caller.

If the calendar cannot be read it returns `found: false` with
`"I cannot see the calendar right now..."`. That sentence is deliberate and the agent
should say it rather than claiming nothing is available.

---

## 5. Function 2: `book_appointment`

**Name** `book_appointment`

**URL** `POST https://bookyourslot.online/webhook/bookyourslot/book`

**Description**

```
Book the appointment. Only call this after the caller has confirmed the full summary
back to you. It creates a real booking; do not call it to check anything.
```

**Parameters**

```json
{
  "type": "object",
  "properties": {
    "service": {
      "type": "string",
      "enum": ["consultation", "quick question"],
      "description": "The same value used for check_availability."
    },
    "start": {
      "type": "string",
      "description": "The iso value from the option the caller picked. Never invent one."
    },
    "name": { "type": "string", "description": "Caller's full name, as confirmed back to them." },
    "email": { "type": "string", "description": "Caller's email, spelled back and confirmed." },
    "phone": { "type": "string", "description": "Caller's phone number." },
    "reason": { "type": "string", "description": "Briefly, what they are coming in for." }
  },
  "required": ["service", "start", "name", "email"]
}
```

**Speak during execution:** on, "Booking that in for you now."
**Speak after execution:** off. Say the `speak` field verbatim instead.

**What it returns** — say `speak` word for word:

| Outcome | `speak` |
| --- | --- |
| Booked | "That is booked. You will receive a confirmation email shortly." |
| Slot taken mid-call | "Sorry, that time was just taken. Would another time work?" then call `check_availability` again |
| Missing a detail | Names what is missing. Collect it and retry |
| Service needs payment | "I can't take payment for that one over the phone..." Do not retry |

---

## 6. Assign a number

Buy or import a number and point it at this agent. **One number per client.** A shared
number books whichever business the workflow happens to name, and the caller cannot tell.

---

## 7. Test before a customer calls

Full session in [VOICE-TEST-PLAN.md](VOICE-TEST-PLAN.md). The two-minute version:

Call, book a consultation, then check the booking exists in the app, the confirmation
email arrived, and the calendar entry is right. A spoken "you're booked" is not evidence.

Then call again and ask for a **quick question**, and confirm the booking that lands is
**15 minutes**, not 30. That is the specific failure this configuration is shaped to
avoid, and it is invisible unless you look.

---

## Gotchas that cost a call

- **Payload shape.** Retell sends `{name, call, args}` by default and only sends the
  parameters at the top level when "Payload: args only" is on. The workflow now accepts
  both, so either setting works. Before that fix the default mode booked the wrong
  service and set the attendee name to the function name.
- **Function timeout under 40 seconds** means the caller hears silence instead of the
  fallback sentence.
- **The workflow must be published** after any import, or both webhooks 404 and n8n does
  not tell you.
- **Editing the script file changes nothing on a running agent.** It is a paste source.
  Re-paste into each provisioned agent.
- **A GET to either webhook returns 404.** They are POST only. Not an outage.

## Related

- [../automations/retell-agent-script.md](../automations/retell-agent-script.md), the template with placeholders
- [VOICE-TEST-PLAN.md](VOICE-TEST-PLAN.md), the testing session
- [VOICE-BOOKING-RUNBOOK.md](VOICE-BOOKING-RUNBOOK.md), onboarding another client
