# Automating BookYourSlot with n8n

BookYourSlot pushes booking events to n8n over webhooks. That covers the
automations most businesses actually want: notify a channel when someone books,
log bookings to a sheet, send a WhatsApp reminder, push a contact into a CRM,
kick off an onboarding sequence.

Nothing needs to be installed or enabled first. The webhook feature is part of
the app, and n8n's built-in **Webhook** node is the other half.

## What works, and what does not

**Works today, no setup beyond this guide:** BookYourSlot → n8n. Every booking
event can trigger an n8n workflow.

**Does not work:** n8n's official **Cal Trigger** node. That node talks to Cal
API v1, which this fork does not contain, so pointing it at
`bookyourslot.online` will fail. Use the generic **Webhook** node instead, which
is what this guide covers. Anything the Cal Trigger node would have given you
for booking events, a Webhook node gives you too.

**Not available:** driving BookYourSlot *from* n8n (creating or cancelling
bookings through an API). That needs the API service, which is not deployed on
this instance. Events flow out, not in.

## Set it up

### 1. Create the trigger in n8n

Add a **Webhook** node to a new workflow. Set the method to **POST**. n8n shows
two URLs, a test one and a production one. Copy the **production** URL, and
remember to activate the workflow when you are done, or only the test URL will
respond.

### 2. Point BookYourSlot at it

In BookYourSlot, go to **Settings → Developer → Webhooks** and create a new
webhook:

- **Subscriber URL**: the n8n production URL from step 1.
- **Event triggers**: pick what you need. The common three are
  `BOOKING_CREATED`, `BOOKING_RESCHEDULED` and `BOOKING_CANCELLED`.
- **Secret**: set one. It is optional but you want it, see
  [verifying the signature](#verify-the-signature-recommended).
- Leave the webhook **active**.

You can attach a webhook to your whole account or to a single event type, which
is useful when only one appointment type should trigger an automation.

### 3. Test it

Book a slot on your own booking page from a private window. The n8n execution
list should show a run within a second or two. If nothing arrives, see
[troubleshooting](#troubleshooting).

## What BookYourSlot sends

A POST with a JSON body in this shape:

```json
{
  "triggerEvent": "BOOKING_CREATED",
  "createdAt": "2026-07-28T09:15:00.000Z",
  "payload": {
    "title": "30 Min Meeting between Anna and Sam",
    "startTime": "2026-08-04T10:00:00Z",
    "endTime": "2026-08-04T10:30:00Z",
    "type": "30min",
    "attendees": [
      { "name": "Sam", "email": "sam@example.com", "timeZone": "Europe/London" }
    ],
    "organizer": { "name": "Anna", "email": "anna@example.com", "timeZone": "Asia/Kolkata" },
    "uid": "abc123",
    "location": "integrations:daily",
    "additionalNotes": "First visit"
  }
}
```

The three envelope fields (`triggerEvent`, `createdAt`, `payload`) are always
present. What sits inside `payload` depends on the event. Rather than trusting
this example, run one real booking and read the actual body in the n8n execution
view, then build your workflow against that.

In n8n, the booking fields are at `{{ $json.payload.title }}`,
`{{ $json.payload.attendees[0].email }}` and so on.

### Available events

`BOOKING_CREATED`, `BOOKING_REQUESTED`, `BOOKING_RESCHEDULED`,
`BOOKING_CANCELLED`, `BOOKING_REJECTED`, `BOOKING_PAID`,
`BOOKING_PAYMENT_INITIATED`, `BOOKING_NO_SHOW_UPDATED`, `MEETING_STARTED`,
`MEETING_ENDED`, `RECORDING_READY`, `RECORDING_TRANSCRIPTION_GENERATED`,
`FORM_SUBMITTED`, `FORM_SUBMITTED_NO_EVENT`, `OOO_CREATED`.

Payment, meeting and recording events only fire if the matching feature is
configured, so on a default install stick to the booking ones.

## Verify the signature (recommended)

Your n8n webhook URL is reachable by anyone who learns it. If you set a secret,
BookYourSlot signs every request so your workflow can reject anything it did not
send.

The signature is an **HMAC-SHA256 of the raw request body**, keyed with your
secret, sent in the **`X-Cal-Signature-256`** header.

Add a **Code** node straight after the Webhook node:

```javascript
const crypto = require("crypto");

const secret = "PASTE_YOUR_WEBHOOK_SECRET";
const received = $input.first().headers["x-cal-signature-256"];
const body = JSON.stringify($input.first().body);

const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

if (received !== expected) {
  throw new Error("Invalid signature, rejecting this request");
}

return $input.all();
```

For this to work the Webhook node must be configured to pass raw headers and
body through. If signature checking proves fiddly in your n8n version, the
weaker fallback is to keep the webhook URL secret and treat it as a bearer
token.

## Worked example: post every new booking to a channel

1. **Webhook** node, POST, production URL, workflow activated.
2. In BookYourSlot, a webhook pointing at that URL subscribed to
   `BOOKING_CREATED`.
3. **Code** node with the signature check above.
4. **Slack / Telegram / Discord** node with a message like:

   ```
   New booking: {{ $json.payload.title }}
   When: {{ $json.payload.startTime }}
   Who: {{ $json.payload.attendees[0].name }} ({{ $json.payload.attendees[0].email }})
   ```

Swap step 4 for a Google Sheets node to log bookings, or an HTTP node to push
into any CRM.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| No execution in n8n at all | Workflow not activated, or you used the test URL. Test URLs only listen while you are watching the editor. |
| Works in the editor, not in production | Same cause. Activate the workflow and use the production URL. |
| Execution arrives with an empty body | The Webhook node is set to GET. It must be POST. |
| Signature never matches | The body is being re-serialised before hashing. Hash the raw body exactly as received. |
| Nothing fires for a specific appointment type | The webhook is scoped to a different event type. Check the scope in Settings → Developer → Webhooks. |
| n8n Cal Trigger node errors | Expected. That node needs Cal API v1, which this fork does not have. Use the Webhook node. |

## Verification status

The webhook feature, the event list, the `{triggerEvent, createdAt, payload}`
envelope and the `X-Cal-Signature-256` HMAC-SHA256 header in this guide were all
read from the code in `packages/features/webhooks` and
`packages/prisma/schema.prisma`.

The end-to-end flow, booking a slot and watching an n8n execution fire, has not
been run against the production instance yet. Do that once after setting up your
first workflow, and treat the example payload above as illustrative until you
have seen a real one in the n8n execution view.
