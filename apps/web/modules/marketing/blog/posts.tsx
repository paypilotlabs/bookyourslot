import type { ReactNode } from "react";

// ponytail: marketing copy is intentionally hardcoded English (single-locale
// marketing surface); move to i18n keys if/when the marketing site needs locales.

export type BlogPost = {
  slug: string;
  title: string;
  /** Meta description — keep under ~155 characters. */
  description: string;
  date: string; // ISO date
  readingMinutes: number;
  excerpt: string;
  body: ReactNode;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "introducing-bookyourslot",
    title: "Introducing BookYourSlot: scheduling that runs your business",
    description:
      "BookYourSlot is live — self-hosted booking pages with availability rules, Google Calendar sync, team scheduling, and automatic confirmations.",
    date: "2026-07-18",
    readingMinutes: 4,
    excerpt:
      "Today we're opening up BookYourSlot: a self-hosted scheduling platform that gives every person and team a booking page guests actually enjoy using.",
    body: (
      <>
        <p>
          Today we're opening up <strong>BookYourSlot</strong> — a self-hosted scheduling platform that gives
          every person and team a clean booking page, real availability rules, and automatic confirmations.
          Share one link; guests pick a time that works. That's the whole pitch.
        </p>
        <h2>Why we built it</h2>
        <p>
          Booking a meeting still takes an average of seven messages when it happens over email or chat. "Does
          Tuesday work?" — "No, how about Thursday?" — "Which time zone?" Every one of those messages is
          friction between you and the person trying to give you their time — or their business.
        </p>
        <p>
          Scheduling tools solved this years ago, but most of them live on someone else's cloud, carry someone
          else's branding, and hold your booking data hostage on their servers. We wanted the polish of a
          modern booking product with the ownership of self-hosting. So we built it.
        </p>
        <h2>What you get today</h2>
        <ul>
          <li>
            <strong>Booking pages</strong> — a public page for every person and team at a link like
            bookyourslot.online/yourname, showing exactly the slots you want to offer.
          </li>
          <li>
            <strong>Availability &amp; time zones</strong> — working hours, date overrides, and buffers, with
            every slot rendered in the guest's own time zone automatically.
          </li>
          <li>
            <strong>Team scheduling</strong> — round-robin and collective events that respect each member's
            individual availability.
          </li>
          <li>
            <strong>Google Calendar sync</strong> — busy times block your page, and new bookings land on your
            calendar without you touching anything.
          </li>
          <li>
            <strong>Confirmations &amp; reminders</strong> — booking, reschedule, and cancellation emails go
            out to everyone, every time.
          </li>
          <li>
            <strong>Embeds, API &amp; webhooks</strong> — put the booking flow inside your own site and
            automate what happens after someone books.
          </li>
        </ul>
        <h2>Free during early access</h2>
        <p>
          Creating an account and taking bookings is free while we're in early access — no credit card, no
          booking caps. We'd rather you stress-test the product and tell us what's missing.
        </p>
        <p>
          Ready to try it? <a href="/signup">Create your account</a>, set your availability, and share your
          link. If you get stuck, email us at hello@bookyourslot.online — a human reads every message.
        </p>
      </>
    ),
  },
  {
    slug: "create-online-booking-page",
    title: "How to create an online booking page for your business (in about 5 minutes)",
    description:
      "A step-by-step guide to setting up an online booking page: event types, availability, calendar sync, and sharing your link — no code required.",
    date: "2026-07-18",
    readingMinutes: 6,
    excerpt:
      "An online booking page lets clients pick a time from your real availability and book themselves. Here's the whole setup, start to finish.",
    body: (
      <>
        <p>
          An online booking page is a public link where clients see your real availability and book themselves
          — no back-and-forth, no double-bookings, confirmations sent automatically. Here's how to set one up
          on BookYourSlot from scratch. The whole thing takes about five minutes.
        </p>
        <h2>Step 1: Create your account</h2>
        <p>
          <a href="/signup">Sign up</a> with your email, pick a username — it becomes your booking link (like{" "}
          <em>bookyourslot.online/priya</em>) — and confirm your time zone. Your time zone matters: it's the
          anchor all guest-side conversions are calculated from.
        </p>
        <h2>Step 2: Define an event type</h2>
        <p>
          An event type is one kind of meeting people can book: "30-minute consultation", "Studio session",
          "Intro call". For each one you choose:
        </p>
        <ul>
          <li>
            <strong>Duration</strong> — how long the meeting runs.
          </li>
          <li>
            <strong>Buffers</strong> — breathing room before or after, so back-to-back bookings don't crush
            your day.
          </li>
          <li>
            <strong>Location</strong> — in person, a phone call, or a link of your choice.
          </li>
        </ul>
        <p>
          Create one event type per service you offer. Guests see them all listed on your page and pick the
          one they need.
        </p>
        <img
          src="/landing/dashboard.png"
          alt="The BookYourSlot event types dashboard listing several bookable services"
          width={1440}
          height={900}
          loading="lazy"
        />
        <h2>Step 3: Set your availability</h2>
        <p>
          Under Availability, define your working hours per weekday — say, Monday to Friday, 10:00 to 18:00 —
          and add date overrides for holidays or one-off days. Your booking page will only ever offer slots
          inside these rules.
        </p>
        <h2>Step 4: Connect Google Calendar</h2>
        <p>
          Connect your Google Calendar so busy blocks automatically disappear from your booking page, and
          every new booking is written back to your calendar. This is the step that makes double-bookings
          structurally impossible rather than something you have to police.
        </p>
        <h2>Step 5: Share your link (or embed it)</h2>
        <p>
          That's it — share your link in your email signature, social bio, or invoices. If you have a website,
          embed the booking flow directly so clients never leave your page.
        </p>
        <h2>Common questions</h2>
        <h3>Can I take bookings without having a website?</h3>
        <p>Yes. Your booking page is itself a hosted page — the link works anywhere you can paste text.</p>
        <h3>Can I offer multiple services with different lengths?</h3>
        <p>Yes — create one event type per service, each with its own duration, buffers, and location.</p>
        <h3>What stops two people from booking the same slot?</h3>
        <p>
          Slots are checked against your calendar and existing bookings at booking time, so a taken slot
          simply stops being offered.
        </p>
      </>
    ),
  },
  {
    slug: "self-hosted-scheduling-software",
    title: "Self-hosted scheduling software: why owning your booking data matters",
    description:
      "What self-hosted scheduling means, how it compares to hosted tools like Calendly, and when owning your booking data is worth it.",
    date: "2026-07-18",
    readingMinutes: 5,
    excerpt:
      "Self-hosted scheduling means the booking pages, guest details, and calendar connections live on infrastructure you control. Here's when that matters.",
    body: (
      <>
        <p>
          <strong>Self-hosted scheduling software</strong> is booking software that runs on infrastructure you
          (or your provider of choice) control — instead of renting a slice of a scheduling company's cloud.
          The booking pages, guest details, availability rules, and calendar connections all live in a
          database you own.
        </p>
        <h2>Hosted vs. self-hosted: the honest comparison</h2>
        <p>
          Hosted tools like Calendly are excellent at what they do, and for many people they're the right
          choice — zero maintenance, instant setup. The trade-offs only start to matter as scheduling becomes
          core to your business:
        </p>
        <ul>
          <li>
            <strong>Data ownership.</strong> On a hosted tool, your client list and booking history live in
            someone else's product. Exporting is possible; owning is not.
          </li>
          <li>
            <strong>Branding.</strong> Hosted booking pages carry the vendor's domain and badge unless you pay
            to remove them. Self-hosted pages are your domain, top to bottom.
          </li>
          <li>
            <strong>Cost shape.</strong> Hosted pricing is per seat per month, forever. Self-hosting has a
            flat infrastructure cost that doesn't grow with your team.
          </li>
          <li>
            <strong>Control.</strong> Feature changes, data policies, and price increases happen on the
            vendor's schedule, not yours.
          </li>
        </ul>
        <h2>What to look for in a self-hosted scheduler</h2>
        <p>
          Self-hosting shouldn't mean settling for less product. The bar to insist on: real availability rules
          with time-zone handling, two-way calendar sync, team scheduling (round-robin and collective),
          automatic email notifications, and an API so you can build around it.
        </p>
        <h2>How BookYourSlot approaches it</h2>
        <p>
          BookYourSlot runs on our own infrastructure at bookyourslot.online — your bookings and guest data
          stay in our own database, not on a third-party scheduling cloud. You get the hosted-tool experience
          (sign up, share a link, done) with the ownership model of self-hosting, and it's free during early
          access. <a href="/signup">Try it here</a>.
        </p>
        <h2>Common questions</h2>
        <h3>Is self-hosted scheduling harder to use?</h3>
        <p>
          Not for the person booking or the person being booked — the experience is identical to a hosted
          tool. The difference is where the data lives.
        </p>
        <h3>Can I move from a hosted tool?</h3>
        <p>
          Yes — recreate your event types and availability (usually minutes of work), connect your calendar,
          and swap the link in your signature and site.
        </p>
      </>
    ),
  },
  {
    slug: "round-robin-scheduling-explained",
    title: "Round-robin scheduling explained (and when to use collective events instead)",
    description:
      "How round-robin scheduling distributes bookings across a team, how it differs from collective events, and how to set both up.",
    date: "2026-07-18",
    readingMinutes: 5,
    excerpt:
      "Round-robin scheduling automatically distributes incoming bookings across your team members. Here's how it works and when to choose it.",
    body: (
      <>
        <p>
          <strong>Round-robin scheduling</strong> automatically distributes incoming bookings across a team. A
          guest books one link — "Talk to our team" — and the system assigns the meeting to a team member
          based on who's available, spreading the load fairly instead of piling every booking onto whoever's
          calendar looks emptiest.
        </p>
        <h2>How round-robin assignment works</h2>
        <p>
          When a guest picks a slot on a round-robin event, BookYourSlot looks at which team members are
          available at that time — respecting each person's own working hours and calendar conflicts — and
          assigns the booking to balance distribution across the team. The guest never has to know or choose
          who they'll meet.
        </p>
        <h2>Where teams use it</h2>
        <ul>
          <li>
            <strong>Sales teams</strong> — inbound demo requests get spread across reps automatically.
          </li>
          <li>
            <strong>Support &amp; onboarding</strong> — customers book "an onboarding session", not a specific
            person.
          </li>
          <li>
            <strong>Service businesses</strong> — "first available practitioner" bookings without a
            receptionist doing the juggling.
          </li>
        </ul>
        <h2>Round-robin vs. collective events</h2>
        <p>The two team event types answer different questions:</p>
        <ul>
          <li>
            <strong>Round-robin: "one of us will take it."</strong> The slot list shows times when{" "}
            <em>at least one</em> member is free; one member gets assigned.
          </li>
          <li>
            <strong>Collective: "all of us will be there."</strong> The slot list shows only times when{" "}
            <em>every</em> selected member is free; everyone is added to the booking.
          </li>
        </ul>
        <p>
          Use round-robin for volume and fairness (demos, consultations); use collective for meetings that
          genuinely need multiple people in the room (interviews, project kickoffs).
        </p>
        <h2>Setting it up in BookYourSlot</h2>
        <ol>
          <li>Create a team and invite your members — each keeps their own availability schedule.</li>
          <li>Create a team event type and choose Round Robin or Collective.</li>
          <li>Share the team link. Assignment and calendar updates happen automatically.</li>
        </ol>
        <h2>Common questions</h2>
        <h3>Does round-robin respect individual working hours?</h3>
        <p>
          Yes — a member who isn't available at a time is never assigned a booking at that time, and their
          calendar conflicts count too.
        </p>
        <h3>Can a guest still book a specific person?</h3>
        <p>Yes — every member keeps their personal booking page alongside any team events.</p>
      </>
    ),
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
