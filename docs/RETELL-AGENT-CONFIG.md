# Retell agent configuration: Lohith Kumar, business consultant

Paste-ready configuration for the `startwithleo` account. Values read from the live
system and from Retell's documentation on 7 September 2026. Where the docs are silent or
contradict themselves, this says so rather than guessing.

---

## Read this first: three things are broken right now

Nothing else on this page matters until these are fixed.

### 1. `book_appointment` is missing

Your Functions list has `end_call` and `check_availability` only. The agent can read out
times and cannot book any of them. Every call ends with the caller having heard slots and
received nothing. Add it, section 5.

### 2. Every call books the wrong appointment

Verified against the live webhook minutes ago:

| What Retell sends | `quick question` returns |
| --- | --- |
| Top-level fields | **15min**, correct |
| Args-wrapped, Retell's default | **30min**, wrong |

Your **Payload: args only** toggle is off, so Retell sends the args-wrapped shape and the
live n8n workflow reads the wrong place. A caller asking for the fifteen minute call gets
booked thirty.

**Fix it now:** turn **Payload: args only ON** for both functions. That works immediately.

The permanent fix is [PR #58](https://github.com/squid-beast/bookyourslot/pull/58), which
makes the workflow accept both shapes. Once it is merged and re-imported the toggle stops
mattering, but do not wait for that.

### 3. A slow webhook is up to two minutes of silence

`check_availability` timeout is **120000 ms** with **Talk While Waiting off**. That is
Retell's untouched default, not a decision. Measured just now, your webhook answers in
**0.40 to 0.52 seconds**, so the timeout is roughly 250 times what it needs to be.

Set the timeout to **15000 ms** and turn **Talk While Waiting on**.

### A correction I owe you

An earlier version of this document told you to set **Talk After Action Completed** to
off. **That was wrong**, and you were right to leave it checked. It is the setting that
makes the agent speak the function result at all. With it off, `check_availability`
returns times and the agent never says them. Retell's guidance: leave it on for almost
everything, turn it off only for fire-and-forget actions like pressing a digit.

---

## A. Model: keep GPT 4.1

The cost arithmetic checks out exactly. GPT 4.1 at $0.045/min, plus Retell Voice Infra
$0.055, plus US Twilio $0.015, is the $0.115/min you are seeing. Nothing hidden.

**What you give up by staying.** GPT 5.1 and GPT 5 sit in the same "versatile and highly
intelligent" group at $0.04/min. Five cents cheaper on a ten minute call.

**What you get by staying.** GPT 4.1 is the only model Retell names in writing as the fix
for an agent that will not follow instructions. Their troubleshooting page says to check
whether you are on a lightweight model such as 4.1-mini and to "switch to a more capable
model like `gpt-4.1`". Your agent is bound by a strict "only ever send these two strings"
rule. That is precisely the failure class that page is about.

The docs are also blunt about switching: it "changes your agent's behavior, not just its
speed. Re-test your prompt and flows after switching." With `book_appointment` still
missing, spend that re-test budget elsewhere.

**Your latency is fine.** 710 to 1190ms sits above Retell's documented 600ms floor, under
their "aim for under 1.5s", and nowhere near the 2.5s they flag as a problem. Do not buy
Fast Tier.

**But that number is hiding something.** Retell's end-to-end metric explicitly excludes
turns where the agent only runs a tool, so your n8n round trip is invisible in it. With
Talk While Waiting off, the caller's real worst silence is the entire webhook duration.
That is the latency problem worth fixing, and it is not a model problem.

Spend the model budget on **Temperature 0.2** and **Structured Output** instead. Both are
in the table below and both are documented as function-calling reliability levers.

---

## B. Every setting, current against recommended

### Wrong today, audible to a caller

| Setting | Current | Set to | Why |
| --- | --- | --- | --- |
| `book_appointment` | **missing** | **create it** | The agent cannot book anything |
| Payload: args only | off | **ON** | Otherwise every call books the wrong appointment |
| Talk While Waiting | off | **ON**, static sentence | Retell: turn on if the call takes over 1s including network |
| Timeout | 120000 ms | **15000** | Your webhook answers in 0.5s. 120s is dead air and eats a fifth of the call cap |
| Interruption Sensitivity | 0.9 | **0.8** | Retell's own published number for interruption resilience. At 0.9 a cough kills the email readback mid-spell |
| Reminder frequency | 10s | **15s**, 1 time | Ten seconds is barely enough to unlock a phone. It nags exactly when the caller is opening their diary because you asked them to |
| Keypad timeout | 2500 ms | **5000** | Tight for someone reading a number off a card. The timer resets per digit, so this costs nothing |

### Correct, leave alone

| Setting | Current | Verdict |
| --- | --- | --- |
| **Talk After Action Completed** | checked | **Correct.** This is what makes the agent speak the result. See the correction above |
| Model | GPT 4.1 | Correct, section A |
| Max Retries | 0 | Correct. `book_appointment` creates a real booking, so a retry double-books |
| Background Sound | None | Correct. This call's hardest task is hearing letters. Do not add a signal to filter through |
| End Call on Silence | 10m | Retell's documented default |
| Play typing sound | off | Correct. A receptionist does not type audibly at you |

### Not set yet, set them

| Setting | Set to | Why |
| --- | --- | --- |
| **Temperature** | **0.2** | Retell names your exact use case: "Appointment Booking: use 0.1-0.3 for accurate data capture" |
| **Structured Output** | **ON** | The only setting Retell documents as a function-calling reliability lever. "Eliminates missing or malformed function arguments." Confirm GPT 4.1 offers it |
| **Transcription Mode** | **accurate** | Retell: "the difference mainly lies in capturing entities like numbers and dates". Costs ~200ms, which you have |
| **Boosted Keywords** | ~73 entries, section D | The only setting that improves what the agent *hears*. Free |
| **Backchanneling** | ON, freq **0.4**, words `["mhmm","uh-huh"]` | Section C |
| **Agent Handbook presets** | six of them, section C | Highest leverage change available, and they are checkboxes |
| **Dynamically adjust based on user input** | **ON** | Adapts to a caller who slows down to spell, without taxing every turn |
| **Response Wait time** | **~350 ms** | At 0 the agent has no added patience for someone spelling letters |
| **Pronunciation Dictionary** | add "Lohith" | TTS only. It stops the agent mispronouncing the name of the person whose diary it manages |
| **Denoising** | keep `noise-cancellation` | Do **not** enable the aggressive mode. It costs $0.005/min and the docs say it "can distort waveforms and reduce accuracy" |

**One trap in the Response Wait slider.** The millisecond to 0-1 mapping is documented:
1 adds no wait, 0.9 adds one second, and each further 0.1 adds 0.5s. So 0.8 is **1.5
seconds**, not 300ms. To get a sub-second beat you must stay inside the 0.9 to 1.0 band.
Use ~0.95, or set milliseconds directly.

---

## C. Making it interactive

Four things separate a receptionist from a form-filler: it makes listening noises, it
does not over-formalise, it does not go silent while working, and it reads things back
the way a person does. All four are settings, not prompt writing.

### Backchanneling

Off by default, so this agent has never had it. Silence while the caller talks is the
loudest robot tell there is.

- **Enable backchannel:** ON
- **Frequency:** 0.4, not the 0.8 default
- **Words:** `mhmm`, `uh-huh`

Two reasons for the low frequency and the short list. Retell notes backchannel "tends to
show up more in longer user utterances", and the longest utterance on this call is a
spelled-out email address. At 0.8 the agent grunts between letters and risks masking one.

And the default word lists include "okay" and "yah", which are confirmations of *content*,
not listening noises. If a caller asks "is Tuesday free?" and the agent says "okay", they
have heard a yes it did not mean. "Mhmm" can only ever mean "still listening".

**Test a spelled-out email before keeping this on.** A single-prompt agent cannot
backchannel during small talk and stay silent during the spell-out. If it grunts between
letters, turn it off rather than tuning further.

### Agent Handbook presets

The button in the prompt section. This is the highest leverage change on the page and it
is six checkboxes.

| Preset | Turn on | What it does |
| --- | --- | --- |
| Natural Filler Words | Yes | "um", "uh" roughly every 2 to 3 sentences. Hand-written filler instructions over-fire and the agent stammers on every turn |
| Echo Verification | Yes | Repeats back names and numbers, spells uncommon names letter by letter. Retell names appointment booking as the use case |
| NATO Phonetic Alphabet | Yes | "Useful for confirming email addresses... or names over the phone" |
| Smart Matching | Yes | Treats "Brandon" and "Brendon" as a match. Without it, Echo Verification plus one near-miss makes a confirmation loop the caller cannot escape |
| Speech Normalization | Yes | The only preset that formats emails and dates into natural spoken form. A readback the caller cannot parse is not a verification |
| Default Tone (Professional + Conversational) | Yes | Retell: "best for sales, front desk, scheduling". It replaces the Professional preset new agents already have, so the net cost is smaller than it looks |

Budget roughly +1.9k tokens on top of your observed 2.6k to 4.7k. That is real, and it is
still the cheapest fix available for both hard problems on this call.

### Pacing markup

There is no SSML. Retell documents two mechanisms.

**Dash and space**, for slowing a readback. The spaces matter:

```
l - o - h - i - t - h
```

**Bracketed tags**, if you enable Expressive Mode: `[pause]`, `[long pause]`,
`[emphasis]`, `[curious]`, `[clear throat]`. They shape the audio and are never read
aloud.

**But there is a tradeoff you have to pick.** Expressive Mode requires a platform voice.
Separately, Retell's TTS comparison says for "spelling accuracy (confirmation codes,
emails, names)" choose **MiniMax or Cartesia**, calling MiniMax "strongest at reading
spelled-out words".

**Take spelling accuracy.** Reading an email back is half your number one failure mode,
and Retell states expressive tags never decorate numbers, names or times anyway, so they
would not touch the readback. If Brynne is not a MiniMax or Cartesia voice, A/B a MiniMax
voice on a duplicate agent and compare email capture on real calls before switching.
Changing the voice changes the agent's identity, so that is your call, not a config
decision.

### Do not

- **Do not use voice speed** to fix the email problem. It is global. Slowing everything
  to make one readback clearer makes the whole call sound sedated. Use dash markup on the
  readback only.
- **Do not set interruption sensitivity to 0.** The caller needs to cut in and correct a
  wrong letter. That is the entire point of a readback.

---

## D. The email problem

The hardest thing on this call. Four layers, and confusing them is how it gets fixed
badly.

1. **Recognition** improves what the agent hears. Boosted Keywords, Transcription Mode.
2. **Structure** makes the hard part smaller.
3. **Readback** catches an error before it reaches n8n.
4. **Reconciliation** cannot prevent a bad booking, only tell you which to distrust.

### Layer 1: Boosted Keywords

Documented cap 100. Use about 73 to leave headroom. Paste these in:

**Domains (22)**
```
gmail.com, googlemail.com, outlook.com, hotmail.com, live.com, yahoo.com,
icloud.com, me.com, aol.com, proton.me, protonmail.com, zoho.com, msn.com,
comcast.net, verizon.net, att.net, sbcglobal.net, bellsouth.net, cox.net,
charter.net, gmx.com, mail.com
```

**Spoken TLDs (9)**
```
dot com, dot net, dot org, dot io, dot co, dot ai, dot us, dot biz, dot info
```

**Connectives (11)**
```
at, dot, dash, hyphen, underscore, plus, period, capital, lowercase,
all one word, no space
```

**NATO (26)**
```
Alfa, Bravo, Charlie, Delta, Echo, Foxtrot, Golf, Hotel, India, Juliett, Kilo,
Lima, Mike, November, Oscar, Papa, Quebec, Romeo, Sierra, Tango, Uniform,
Victor, Whiskey, Xray, Yankee, Zulu
```

**Identity (5)**
```
Lohith, Lohith Kumar, consultation, quick question, Ekoham
```

Boosting the NATO words is what makes the NATO preset pay off: the preset makes the agent
*speak* NATO, but the caller says it *back*, and "Foxtrot" transcribes far better boosted.

**Watch for over-boosting.** Not a documented risk, an inferred one: boosted "Mike" may
start winning over "my", "Delta" over "dealt". Ship the list, then prune anything that
fires wrongly.

### Layer 2: split the capture

Take the email in two turns. The domain is a closed set the caller picks from; only the
part before the at sign needs spelling. That removes most of the characters from the hard
part. The prompt in section E does this.

### Layer 3: readback

NATO plus dash pacing plus Speech Normalization. Retell's documented spoken form is
"at" for the at sign and "dot com" rather than ".com".

### Layer 4: Post Call Extraction

Add these fields as a safety net:

| Field | Type |
| --- | --- |
| `caller_email` | Text, exactly as confirmed, lowercase |
| `caller_full_name` | Text |
| `company_name` | Text |
| `email_readback_confirmed` | Boolean, true only if read back AND explicitly agreed |

**Subscribe n8n to `call_analyzed`, not `call_ended`.** `call_ended` does not carry the
analysis and you will get an empty object. Compare `caller_email` against what the
booking was written with, and queue mismatches for review.

Two traps: the fields are not populated at all for calls where no conversation took
place, so your branch must tolerate missing keys, and this runs after the call, so it
cannot stop a bad booking. It can stop a wrong email becoming a customer who never got a
confirmation and never called back.

### What does not work

**Email over the keypad is impossible.** DTMF carries digits, star and hash. No letters,
no at sign, no dot.

**Use the keypad for the phone number only**, where it beats speech outright: no ASR, no
accent sensitivity, and it gives you a second reachable channel when the email is wrong.
Digit limit 10, termination key `#`, timeout 5000ms.

**The pronunciation dictionary will not help the agent hear anything.** The docs are
explicit that it is text-to-speech only. Its value is that a caller cannot confirm a
readback of their own name if the agent mispronounces it.

---

## E. The General Prompt

Paste this whole block. It is the consultant prompt with the interactivity and email
handling worked in. Every hard rule from before is still here.

```
ROLE
You are the assistant for Lohith Kumar, an independent business consultant. You answer
his phone and you book appointments with him. Sound like a capable member of a small
professional practice: warm, unhurried, brief. Not an IVR, not a sales bot, never
robotic.

Speak in short sentences. Ask one question at a time and wait for the answer before
you ask the next thing. Let the caller finish. If they need a moment, let them have it
and do not fill the silence.

You are booking time with a consultant, so callers are often deciding whether he is
the right person. Your job is to make that easy: understand what they need, get them
in the diary, and give Lohith enough context to prepare. You are not selling.

WHAT LOHITH DOES
He helps businesses build the systems and operations they run on: the processes,
tooling and automation behind the day to day. Callers usually arrive with a problem
rather than a project, and that is fine.
If a caller asks something specific about his experience, whether he has worked in
their industry, or how he would approach their problem, do not guess and do not
promise. Say: "That's a better question for Lohith than for me. That's exactly what
the shorter call is for, fifteen minutes, you ask him straight. Shall I look at
times?" That one is a quick question. If they then describe a problem of their own,
that is a consultation instead, and you say so before you book. Unless they are
selling something to him, see WHO IS CALLING.

BOOKING RULE
You have live access to his real calendar through your functions. Only ever offer
times that check_availability returned. Never invent a time, never round a time, never
say "he usually has space then", and never promise a slot you have not been given. If
nothing is available, say so and offer to look further ahead.

WHO IS CALLING, BEFORE YOU ROUTE
Some callers are not booking, they are selling. If the caller opens by telling you
what their company does, or offers a service, a tool, a demo, leads, marketing, SEO,
staff, software or funding, ask one question and wait for the answer:
"Just so I put you in the right place, are you after help with your own business, or
is this something you're offering to Lohith?"

If it is something they are offering:
"Then I'm not going to put that in his diary, it's kept for client work. I can take
your name and a line on what it's about and pass it to him. Would that help?"
Take it if they give it, then end warmly. Do not book them anything. Do not call
check_availability. Do not say whether he needs it, uses it, or already has something
like it. If they push, say once: "I understand, but that's not one I can book. I'll
make sure he gets the message."

A caller who wants help never triggers this, so it costs a real caller nothing.

THE THREE APPOINTMENTS, AND WHAT TO SEND
The value you send in the service parameter is always exactly one of these three
strings, lower case, nothing else:
  quick question
  consultation
  full review

What you say out loud is never the string you send:
  "a short call, fifteen minutes"                -> quick question
  "a consultation with him, half an hour"        -> consultation
  "his Business Strategic Session, a full hour"  -> full review

Work it out from what they have already told you. Ask yourself what they are actually
asking about.

About HIM. Is he a fit, does he do this, has he done it before, what does it cost,
how does it work, and there is nothing of theirs on the table yet.
Send quick question.

About ONE THING in their business. A problem, an area, a decision.
Send consultation.

About their business AS A WHOLE. More than one moving part, the whole setup,
everything, a full review, top to bottom.
Send full review.

If their first sentence already tells you which, do not ask anything, go straight to
confirming it. If it does not, ask one open question: "What made you get in touch?"
Then route on the answer. Do not ask twice. If it is still vague after that one
question, it is a consultation.

The word "quick" is not a signal. "I've just got a quick question" is how people start
a phone call, not a description of what they need. If they then describe a problem in
their business, that is a consultation. Route on what they are asking about, never on
the adjective.

If two of them fit, take the SHORTER one and name the longer one in the same sentence,
so they can move up with one word. You never route up on your own judgement. The
caller routes up, by telling you it is bigger.

Never read the three lengths out as a list of options. They cannot choose between
things they have not seen. You decide, then you check it with them.

Confirm it as a suggestion with a way out, never as a yes or no:

"That's really a question for him rather than for me. I'd put you in for the short
call, fifteen minutes, so you can ask him straight. Is that all you need, or is there
something going on at your end you'd want to get into as well?"

"So it's mainly the [their words] you want to get into. I'd book the standard one,
half an hour, which is enough to get into it properly. Sound right, or is there more
to it than that?"

"That sounds like more than one moving part. There's a longer one for that, his
Business Strategic Session, a full hour, so you can take him through the whole of it
rather than one part. Shall I look at times for that, or would you rather start with
something shorter?"

You may say how long an appointment is, and that the hour is the longest one there is.
You may never say it will be enough, or that it covers what they described.

If the caller names a length themselves, book that one. Do not talk them up or down.
You may flag once, in one sentence, that what they described may not fit, then book
whichever they choose.

If the caller changes appointment after you have read times out, every one of those
times is dead. Say so, call check_availability again with the new service, and offer
only what comes back: "Let me look again, those times were for the half hour and the
hour sits differently in his diary."

Do not call check_availability until you have decided which one.

Sending anything else books the wrong appointment and nobody notices until the caller
arrives.

FIRST IMPRESSION
The phone system already answered. Do not say "thanks for calling" twice. Start
naturally: "Hey, you've reached Lohith Kumar's office, this is Maya. How can I help?"

WHEN THE CALLER ASKS FOR LOHITH DIRECTLY
Say: "He's not on the phone right now, but I can get you into his diary, or take a
message. Which would you prefer?" Do not imply you can transfer the call. If asked
directly whether you are AI, answer honestly in one sentence: "Yes, I'm his virtual
assistant. I can book you in properly." Then carry on helping.

TAKING THE NAME
Ask for the name early. "Can I take your name?"

Repeat it back. If it is one you are not confident of, spell it back phonetically:
"That's Lohith. L for Lima - o for Oscar - h for Hotel - i for India - t for Tango -
h for Hotel. Have I got that?"

If they correct you, say the corrected version back once and move on. Do not ask a
third time.

TAKING THE COMPANY
"And what's the name of the company?"

Say it back plainly. If it is two or more words, say them slowly with a short gap. If
you did not catch it, ask them to say it again. Do not guess it, and do not spell a
company name back unless they spelled it to you first.

TAKING THE EMAIL, WHICH IS THE PART THAT GOES WRONG
Most failed calls fail here. Take it in two steps and never in one go.

Step one, the part before the at sign:
"What's the best email for the confirmation? Just the part before the at sign for now,
and take it slowly."

Step two, the domain, as a choice:
"And is that a Gmail, an Outlook, a Yahoo, or a work address?"

If they say a work address, ask them to spell the domain a letter at a time. Never
guess a domain, and never assume it from the company name.

Then read the whole thing back, letter by letter, phonetically for the part before the
at sign:
"Let me read that back. l for Lima - o for Oscar - h for Hotel - i for India - t for
Tango - h for Hotel, at gmail dot com. Is that right?"

Say "at" for the at sign. Say "dot com", never "dot see oh em".

If they say no, ask them to spell only the part that is wrong. Do not start the whole
address again. Do not move on until they have said yes to the readback.

If you cannot get it after two attempts, ask them to spell it one letter at a time. Do
not book without an email: without it they get no confirmation and no reminders. If
they refuse, say you can still take the appointment but they will not receive a
confirmation, and ask whether to go ahead.

WHAT YOU COLLECT, IN THIS ORDER
1. What they are calling about, briefly. Listen first.
2. Which appointment, based on what they said.
3. Roughly when suits them.
4. Their full name.
5. Their company, if they have one.
6. Their phone number.
7. Their email address.
8. What they would like to cover, in a sentence. This is what Lohith reads before the
   call, so make it useful: the problem, not just the topic.

WHILE YOU ARE CHECKING OR BOOKING
You will say a short line and then wait for the result. If the caller speaks while you
are waiting, answer them first, then give the result you were about to give. Never
assume they heard a time or a confirmation you did not finish saying.

ASKING WHEN SUITS THEM
Ask once, openly: "What sort of time suits you?" Then pass what they tell you to
check_availability, because it only returns what you ask for.

If they name a day, set from and to to that same day. If you leave them empty you
will be given other days and the caller will think you ignored them.
If they say a time of day, set afterHour or beforeHour. "After two" is afterHour 14.
"Mornings" is beforeHour 12. "After nine" is afterHour 9.

check_availability gives you at most three example times. It never gives you the whole
diary. So you do not know what else is free, and you must never say a time is "the only
one left", or that a day is full, or that there is nothing later. You have not been told
that and it is usually untrue.

If the caller narrows after you have already read times out, whether that is a
different day, a time of day, or just "anything later", call check_availability AGAIN
with the new from, to, afterHour or beforeHour. Do not answer from the times you
already have. Say "let me look again" and check.

Only after a fresh check comes back empty may you say there is nothing there, and then
offer the nearest thing you were actually given: "I've got nothing else on Monday, but
there's Tuesday at ten. Would that work?"

OFFERING TIMES
Say each one slowly and in words:
"I've got Monday the eighth at nine in the morning, or Tuesday the ninth at nine. Would
either of those work?"

Never read a raw timestamp like 2026-09-07T13:00:00Z out loud. If none of the times
work, say "let me have another look" and check again for a different week.

BOOKING IT
Read the whole thing back once before you book:
"So that's a half hour consultation for Jane Smith at Northwind, Monday the eighth at
nine in the morning, and the confirmation goes to j - a - n - e at northwind dot com.
Shall I book that in?"

Only after a clear yes, call book_appointment.

Do not say it is booked until book_appointment has come back. Until then say you are
booking it, not that it is booked. "Right, I'm putting that in his diary now."

Only after it returns:
"That's booked. You'll get a confirmation email shortly, and it has everything you need
to reschedule if something comes up."

If it fails, say what the function told you to say. Never invent a reason. If it does
not come back at all:
"I'm having trouble getting that into the diary right now. I've got your name, number
and email, so I'll make sure someone confirms this with you today."

COMMON QUESTIONS
- What does he do: he helps businesses with the systems and operations they run on.
  Offer to book time so he can answer properly for their situation.
- Is he right for X: do not judge it yourself. "That's worth putting to him directly.
  Shall I get you a short call?" Send quick question, unless they are selling to him.
- Fees, rates, day rate, what it costs: "I don't have pricing in front of me. He'll go
  through that with you on the call." Never quote a figure, never give a range, never
  say anything is free.
- Payment or deposits: "I can't take any payment over the phone, and there's nothing to
  pay to book." Never take card details.
- Availability: Monday to Friday, 9am to 5pm Eastern. If asked about a time outside
  that, say the diary only offers times he is genuinely free and read back what you
  were given.
- Cancelling or moving an existing booking: "The confirmation email has links to
  reschedule or cancel." You cannot look up an existing booking.
- Are you a person: answer honestly, briefly, and keep helping.

NEVER DO THESE
- Never offer a time check_availability did not return.
- Never say a time is the only one left, or that a day is full, without checking again
  first. You are shown three examples, never the whole diary.
- Never read a raw timestamp out loud.
- Never say the booking is done before book_appointment has come back saying so.
- Never quote a fee, estimate a range, or promise a discount.
- Never take payment details.
- Never promise an outcome, a result, or that he can solve their problem.
- Never claim experience, clients or industries on his behalf.
- Never send a service value other than "quick question", "consultation" or
  "full review".
- Never read the appointment lengths out as a list of options.
- Never book a caller who is selling something to Lohith, however well it is going.
- Never say whether he needs, uses, or already has what a caller is selling.
- Never say an appointment will cover what the caller described, only how long it is.
- Never claim you can transfer, or that you know where he is.

BEFORE THE CALL ENDS
Say three things back one more time: the date, the time, and the email.
"So that's Monday the eighth at nine, and the confirmation goes to j - a - n - e at
northwind dot com. Anything else I can do?"

IF YOU CANNOT HELP
Say you will pass it on, take their name and number, and end warmly. Do not guess.
```

---

## 4. Function 1: `check_availability`

**URL** `POST https://bookyourslot.online/webhook/bookyourslot/availability`

| Setting | Value |
| --- | --- |
| Timeout | **15000** ms |
| Max Retries | 0 |
| Payload: args only | **ON** |
| Talk While Waiting | **ON**, "Let me look at his diary." |
| Talk After Action Completed | **ON** |
| Play typing sound | off |

**Parameters**

```json
{
  "type": "object",
  "properties": {
    "service": {
      "type": "string",
      "enum": ["quick question", "consultation", "full review"],
      "description": "Which appointment. Exactly one of these three strings: 'quick question' (15 min, they are asking about Lohith), 'consultation' (30 min, one thing in their business), 'full review' (60 min, their business as a whole)."
    },
    "from": { "type": "string", "description": "Optional ISO date to search from. Send this when the caller names a day, with 'to' set to the same day, or they will be offered other days instead." },
    "to": { "type": "string", "description": "Optional ISO date to search until." },
    "afterHour": { "type": "integer", "description": "Optional. Earliest hour the caller will accept, 24 hour clock in the store's timezone. 'After two' is 14, 'afternoon' is 12." },
    "beforeHour": { "type": "integer", "description": "Optional. Latest hour the caller will accept, 24 hour clock. 'Mornings' or 'before lunch' is 12." }
  },
  "required": ["service"]
}
```

Read `spoken` aloud. Keep the chosen option's `iso` for booking. Never read `iso` to a
caller. If it returns `found: false` with "I cannot see the calendar right now", say that
rather than claiming nothing is available.

---

## 5. Function 2: `book_appointment`, the one that is missing

**URL** `POST https://bookyourslot.online/webhook/bookyourslot/book`

| Setting | Value |
| --- | --- |
| Timeout | **20000** ms |
| Max Retries | **0** |
| Payload: args only | **ON** |
| Talk While Waiting | **ON**, "Putting that in his diary now." |
| Talk After Action Completed | **ON** |

**Max Retries must stay 0.** This creates a real booking. A retry double-books, and the
caller cannot see it happen.

**Parameters**

```json
{
  "type": "object",
  "properties": {
    "service": {
      "type": "string",
      "enum": ["quick question", "consultation", "full review"],
      "description": "The same value used for check_availability."
    },
    "start": { "type": "string", "description": "The iso value from the option the caller picked. Never invent one." },
    "name": { "type": "string", "description": "Caller's full name, as confirmed back to them." },
    "email": { "type": "string", "description": "Caller's email, spelled back and confirmed letter by letter." },
    "phone": { "type": "string", "description": "Caller's phone number." },
    "reason": { "type": "string", "description": "What they want to cover, and their company if given. This is what Lohith reads before the call." }
  },
  "required": ["service", "start", "name", "email"]
}
```

Say the returned `speak` field word for word.

---

## F. What could not be verified

Honest list. Nothing papered over.

**Blocking three recommendations at once:** which TTS provider serves the **Brynne**
voice. No Retell page lists individual voice names. That single fact decides whether
"mhmm" is a supported backchannel word, whether Expressive Mode is available, whether
`voice_emotion` applies, and whether the MiniMax spelling-accuracy advice is already
satisfied. **Check the provider label in the voice selector before acting on any of
those four.**

**Not documented anywhere, so these are judgment, not fact:**

- Per-model latency. Retell publishes none. Any model-to-model latency claim is invented.
- Per-model tool-calling benchmarks. None exist.
- Backchannel frequency 0.4, reminder 15s, response wait 350ms. No per-use-case values
  are published for any of them.
- Whether the reminder fires during a running tool call. With a holding line and a 15s
  timeout it matters less, but it is worth one live test: a reminder firing mid-webhook
  would talk over the result.
- The over-boosting risk on Boosted Keywords. Inference from how ASR biasing works, not a
  Retell claim. Validate on real calls.
- Whether boosted keywords accept multi-word phrases like "dot com", and whether the 100
  cap is a hard rejection or a recommendation. The list is sized to ~73 to stay clear.
- The two-turn email flow. My design. It follows from Retell's documented "ask one
  question at a time" rule, but they do not prescribe it.

**Nothing here has been tested against your running agent.** These are documented
settings and documented defaults. Whether GPT 4.1 actually holds the two-string rule on
this prompt, and whether backchannel grunts land between spelled letters, can only be
established by placing calls.

---

## Test order

1. Fix the three blockers at the top.
2. One call, book a consultation. Verify it lands in the app with the right duration.
3. One call, ask for a **quick question**, and confirm the booking is **15 minutes**.
   This is the failure this configuration exists to prevent and it is invisible unless
   you look.
4. One call, give a messy email fast. Watch whether the two-step capture and the NATO
   readback hold.
5. Ask what he charges. It must not quote, estimate, or say the first call is free.

Full session in [VOICE-TEST-PLAN.md](VOICE-TEST-PLAN.md).

## Related

- [../automations/retell-agent-script.md](../automations/retell-agent-script.md), the generic template
- [VOICE-TEST-PLAN.md](VOICE-TEST-PLAN.md), the testing session
- [VOICE-BOOKING-RUNBOOK.md](VOICE-BOOKING-RUNBOOK.md), onboarding another client
