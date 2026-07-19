import type { ReactNode } from "react";

// ponytail: marketing copy is intentionally hardcoded English (single-locale
// marketing surface); move to i18n keys if/when the marketing site needs locales.

export type BlogPost = {
  slug: string;
  title: string;
  /** Meta description: keep under ~155 characters. */
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
      "BookYourSlot is live: self-hosted booking pages with availability rules, Google Calendar sync, and automatic confirmations.",
    date: "2026-07-18",
    readingMinutes: 4,
    excerpt:
      "Today we're opening up BookYourSlot: a self-hosted scheduling platform that gives every practitioner a booking page guests actually enjoy using.",
    body: (
      <>
        <p>
          Today we're opening up <strong>BookYourSlot</strong>, a self-hosted scheduling platform that gives
          every practitioner a clean booking page, real availability rules, and automatic confirmations. Share
          one link; guests pick a time that works. That's the whole pitch.
        </p>
        <h2>Why we built it</h2>
        <p>
          Booking a meeting still takes an average of seven messages when it happens over email or chat. "Does
          Tuesday work?" "No, how about Thursday?" "Which time zone?" Every one of those messages is friction
          between you and the person trying to give you their time, or their business.
        </p>
        <p>
          Scheduling tools solved this years ago, but most of them live on someone else's cloud, carry someone
          else's branding, and hold your booking data hostage on their servers. We wanted the polish of a
          modern booking product with the ownership of self-hosting. So we built it.
        </p>
        <h2>What you get today</h2>
        <ul>
          <li>
            <strong>Booking pages</strong>: a public page for every practitioner at a link like
            bookyourslot.online/yourname, showing exactly the slots you want to offer.
          </li>
          <li>
            <strong>Availability &amp; time zones</strong>: working hours, date overrides, and buffers, with
            every slot rendered in the guest's own time zone automatically.
          </li>
          <li>
            <strong>Self-serve reschedules</strong>: guests move or cancel their own booking from the
            confirmation email, and your calendar updates itself.
          </li>
          <li>
            <strong>Google Calendar sync</strong>: busy times block your page, and new bookings land on your
            calendar without you touching anything.
          </li>
          <li>
            <strong>Email confirmations</strong>: booking, reschedule, and cancellation emails go
            out to everyone, every time.
          </li>
          <li>
            <strong>Embeds, API &amp; webhooks</strong>: put the booking flow inside your own site and
            automate what happens after someone books.
          </li>
        </ul>
        <h2>Free during early access</h2>
        <p>
          Creating an account and taking bookings is free while we're in early access: no credit card, no
          booking caps. We'd rather you stress-test the product and tell us what's missing.
        </p>
        <p>
          Ready to try it? <a href="/signup">Create your account</a>, set your availability, and share your
          link. If you get stuck, email us at hello@bookyourslot.online. A human reads every message.
        </p>
      </>
    ),
  },
  {
    slug: "create-online-booking-page",
    title: "How to create an online booking page for your business (in about 5 minutes)",
    description:
      "A step-by-step guide to setting up an online booking page: event types, availability, calendar sync, and sharing your link. No code required.",
    date: "2026-07-18",
    readingMinutes: 6,
    excerpt:
      "An online booking page lets clients pick a time from your real availability and book themselves. Here's the whole setup, start to finish.",
    body: (
      <>
        <p>
          An online booking page is a public link where clients see your real availability and book
          themselves: no back-and-forth, no double-bookings, confirmations sent automatically. Here's how to
          set one up on BookYourSlot from scratch. The whole thing takes about five minutes.
        </p>
        <h2>Step 1: Create your account</h2>
        <p>
          <a href="/signup">Sign up</a> with your email, pick a username that becomes your booking link (like{" "}
          <em>bookyourslot.online/priya</em>), and confirm your time zone. Your time zone matters: it's the
          anchor all guest-side conversions are calculated from.
        </p>
        <h2>Step 2: Define an event type</h2>
        <p>
          An event type is one kind of meeting people can book: "30-minute consultation", "Studio session",
          "Intro call". For each one you choose:
        </p>
        <ul>
          <li>
            <strong>Duration</strong>: how long the meeting runs.
          </li>
          <li>
            <strong>Buffers</strong>: breathing room before or after, so back-to-back bookings don't crush
            your day.
          </li>
          <li>
            <strong>Location</strong>: in person, a phone call, or a link of your choice.
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
          Under Availability, define your working hours per weekday (say, Monday to Friday, 10:00 to 18:00)
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
          That's it. Share your link in your email signature, social bio, or invoices. If you have a website,
          embed the booking flow directly so clients never leave your page.
        </p>
        <h2>Common questions</h2>
        <h3>Can I take bookings without having a website?</h3>
        <p>Yes. Your booking page is itself a hosted page, so the link works anywhere you can paste text.</p>
        <h3>Can I offer multiple services with different lengths?</h3>
        <p>Yes. Create one event type per service, each with its own duration, buffers, and location.</p>
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
          (or your provider of choice) control, instead of renting a slice of a scheduling company's cloud.
          The booking pages, guest details, availability rules, and calendar connections all live in a
          database you own.
        </p>
        <h2>Hosted vs. self-hosted: the honest comparison</h2>
        <p>
          Hosted tools like Calendly are excellent at what they do, and for many people they're the right
          choice: zero maintenance, instant setup. The trade-offs only start to matter as scheduling becomes
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
          with time-zone handling, two-way calendar sync, automatic email notifications, and an API so you can
          build around it.
        </p>
        <h2>How BookYourSlot approaches it</h2>
        <p>
          BookYourSlot runs on our own infrastructure at bookyourslot.online, so your bookings and guest data
          stay in our own database, not on a third-party scheduling cloud. You get the hosted-tool experience
          (sign up, share a link, done) with the ownership model of self-hosting, and it's free during early
          access. <a href="/signup">Try it here</a>.
        </p>
        <h2>Common questions</h2>
        <h3>Is self-hosted scheduling harder to use?</h3>
        <p>
          Not for the person booking or the person being booked. The experience is identical to a hosted tool.
          The difference is where the data lives.
        </p>
        <h3>Can I move from a hosted tool?</h3>
        <p>
          Yes. Recreate your event types and availability (usually minutes of work), connect your calendar,
          and swap the link in your signature and site.
        </p>
      </>
    ),
  },
  {
    slug: "round-robin-scheduling-explained",
    title: "Round-robin scheduling explained (and when to use collective events instead)",
    description:
      "How round-robin scheduling distributes bookings across a team, how it differs from collective events, and where it sits on the BookYourSlot roadmap.",
    date: "2026-07-18",
    readingMinutes: 5,
    excerpt:
      "Round-robin scheduling automatically distributes incoming bookings across a team. Here's how it works, and where it sits on our roadmap.",
    body: (
      <>
        <p>
          <strong>Round-robin scheduling</strong> automatically distributes incoming bookings across a team. A
          guest books one link ("Talk to our team") and the system assigns the meeting to a team member based
          on who's available, spreading the load fairly instead of piling every booking onto whoever's
          calendar looks emptiest.
        </p>
        <h2>How round-robin assignment works</h2>
        <p>
          When a guest picks a slot on a round-robin event, the system looks at which team members are
          available at that time, respecting each person's own working hours and calendar conflicts, and
          assigns the booking to balance distribution across the team. The guest never has to know or choose
          who they'll meet.
        </p>
        <h2>Where teams use it</h2>
        <ul>
          <li>
            <strong>Sales teams</strong>: inbound demo requests get spread across reps automatically.
          </li>
          <li>
            <strong>Support &amp; onboarding</strong>: customers book "an onboarding session", not a specific
            person.
          </li>
          <li>
            <strong>Service businesses</strong>: "first available practitioner" bookings without a
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
        <h2>Where BookYourSlot stands today</h2>
        <p>
          Honest status: shared team pages with round-robin assignment are on the BookYourSlot roadmap and are
          not live yet. Today, each practitioner gets their own account and booking page on the same instance,
          which already covers the "book a specific person" case. When team pages ship, this post will become
          the setup guide.
        </p>
        <p>
          Want round-robin sooner? <a href="/contact">Tell us</a>. Demand directly shapes the build order.
        </p>
        <h2>Common questions</h2>
        <h3>Does round-robin respect individual working hours?</h3>
        <p>
          In a good implementation, yes: a member who isn't available at a time is never assigned a booking at
          that time, and calendar conflicts count too. That's the standard we're building to.
        </p>
        <h3>What can I use on BookYourSlot today?</h3>
        <p>
          Personal booking pages per practitioner, each with its own availability, calendar sync, and
          confirmations. Guests book a specific person directly.
        </p>
      </>
    ),
  },
  {
    slug: "online-booking-for-dentists",
    title: "Online booking for dentists: fill the chair without phone tag",
    description:
      "How dental practices use online booking to cut front-desk phone time, reduce no-shows with instant confirmations, and let patients book cleanings after hours.",
    date: "2026-07-19",
    readingMinutes: 5,
    excerpt:
      "Most dental appointments are still booked by phone during the exact hours patients are at work. An online booking page fixes the mismatch.",
    body: (
      <>
        <p>
          <strong>Online booking for a dental practice</strong> means a public page where patients pick a
          cleaning, check-up, or consultation slot from your real availability, while your front desk stays
          focused on the patients physically in front of them. Most booking calls happen during the exact
          hours patients are at work; an online page removes that mismatch entirely.
        </p>
        <h2>What changes for the practice</h2>
        <ul>
          <li>
            <strong>After-hours booking.</strong> A large share of appointment demand happens evenings and
            weekends. Your page takes those bookings while the office is closed.
          </li>
          <li>
            <strong>Fewer no-shows.</strong> Every booking triggers an automatic email confirmation, and
            reschedules or cancellations notify both sides instantly, so patients self-serve instead of simply
            not showing up.
          </li>
          <li>
            <strong>No double-bookings.</strong> Connect the practice Google Calendar and busy blocks
            disappear from the page automatically.
          </li>
        </ul>
        <h2>How to set it up in BookYourSlot</h2>
        <ol>
          <li>
            Create one event type per visit kind: "New patient exam (60m)", "Cleaning (45m)", "Consultation
            (30m)", each with its own buffer time for room turnover.
          </li>
          <li>Set clinic hours as your availability schedule, with date overrides for holidays.</li>
          <li>
            For multiple practitioners, give each dentist their own account and page so patients book a
            specific dentist directly. Shared "first available" pages are on the roadmap.
          </li>
          <li>Put the link on your website, Google Business Profile, and appointment cards.</li>
        </ol>
        <p>
          A note on records: BookYourSlot handles scheduling, meaning names, emails, and chosen times. It is
          not a medical-records system; keep clinical data in your practice-management software and check the
          patient-data rules that apply in your region.
        </p>
        <h2>Common questions</h2>
        <h3>Can patients choose their hygienist or dentist?</h3>
        <p>
          Yes. Each practitioner has a personal booking page with their own hours, so patients pick their
          hygienist or dentist directly. A shared "any available practitioner" page is on the roadmap.
        </p>
        <h3>Can we keep some slots phone-only?</h3>
        <p>
          Yes. Your page only offers the hours you define, so keep emergency or complex-procedure slots out of
          the schedule and handle them by phone as today.
        </p>
        <p>
          Ready to try it? <a href="/signup">Create your practice's booking page free</a>. It takes about five
          minutes (<a href="/blog/create-online-booking-page">here's the walkthrough</a>).
        </p>
      </>
    ),
  },
  {
    slug: "online-booking-for-clinics",
    title: "Online booking for doctors and clinics: fewer calls, fuller schedules",
    description:
      "A practical guide to appointment scheduling for clinics: per-visit event types, per-doctor availability and booking pages, and automatic confirmations.",
    date: "2026-07-19",
    readingMinutes: 5,
    excerpt:
      "Clinics juggle multiple doctors, visit types, and a phone that never stops. Here's how an online scheduling page absorbs the routine bookings.",
    body: (
      <>
        <p>
          A clinic's scheduling problem is really three problems: multiple <strong>doctors</strong> with
          different hours, multiple <strong>visit types</strong> with different lengths, and a phone line that
          ties up staff all day. An online booking page absorbs the routine share of that load: patients book
          follow-ups and consultations themselves, and the desk handles the genuinely complex cases.
        </p>
        <h2>Map your clinic onto booking primitives</h2>
        <ul>
          <li>
            <strong>Visit types → event types.</strong> "New patient (45m)", "Follow-up (15m)", "Consultation
            (30m)", each with its own duration and buffer.
          </li>
          <li>
            <strong>Doctors → accounts.</strong> Each doctor keeps an individual availability schedule and
            gets a personal page for direct bookings.
          </li>
          <li>
            <strong>"Next available" → roadmap.</strong> A single link that assigns the booking to whichever
            doctor is free is coming (
            <a href="/blog/round-robin-scheduling-explained">how round-robin will work</a>); today patients
            pick their doctor directly.
          </li>
        </ul>
        <h2>The parts patients notice</h2>
        <p>
          Slots appear in the patient's own time zone (useful for telehealth follow-ups), confirmations arrive
          by email immediately, and rescheduling is a link click instead of a phone queue. Every reschedule
          updates the doctor's calendar automatically.
        </p>
        <h2>The parts staff notice</h2>
        <p>
          Google Calendar sync means leave, meetings, and blocked rooms instantly remove slots from the public
          page. Buffers between visits are enforced by the system, not by the receptionist's memory. And
          because BookYourSlot is self-hosted, booking data lives in the clinic's own database. It is a
          scheduling layer, not a medical-records system, so clinical data stays in your EHR and regional
          patient-data rules still apply.
        </p>
        <h2>Common questions</h2>
        <h3>Can we require staff confirmation before a booking is final?</h3>
        <p>
          Yes. Event types support opt-in confirmation, so requests wait for approval instead of booking
          instantly.
        </p>
        <h3>Can patients book a specific doctor?</h3>
        <p>Yes. Every doctor has a personal booking page, and that is exactly how patients book them.</p>
        <p>
          <a href="/signup">Set up your clinic free</a>, or read the{" "}
          <a href="/blog/create-online-booking-page">five-minute setup guide</a> first.
        </p>
      </>
    ),
  },
  {
    slug: "salon-spa-booking-software",
    title: "Salon & spa booking: let clients book while you have your hands full",
    description:
      "Why salons and spas move to online booking: 24/7 self-serve appointments, per-stylist pages, service menus as event types, and automatic confirmations.",
    date: "2026-07-19",
    readingMinutes: 5,
    excerpt:
      "Your hands are in foils or mid-massage when the phone rings. Online booking answers it for you. Here's the salon-shaped way to set it up.",
    body: (
      <>
        <p>
          Salons and spas lose bookings for one simple reason: when clients want to book, your hands are busy.{" "}
          <strong>Online booking</strong> turns your service menu into a page where clients pick a stylist, a
          service, and a time, all while you keep working. BookYourSlot gives every stylist a page and the
          whole salon a shared one.
        </p>
        <h2>Turn your service menu into event types</h2>
        <p>
          Each service becomes an event type with its real duration and cleanup buffer: "Cut & finish (45m)",
          "Color (2h)", "Deep-tissue massage (60m + 15m turnaround)". Clients see exactly what they're
          booking; you never get a color squeezed into a cut-sized gap because buffers are enforced
          automatically.
        </p>
        <h2>Per-stylist pages, one salon brand</h2>
        <ul>
          <li>
            <strong>Regulars book their person.</strong> Every stylist or therapist has a personal link with
            their own hours.
          </li>
          <li>
            <strong>New clients pick from the team list.</strong> Each stylist's page shows their real
            openings; a shared "first available" page is on the roadmap.
          </li>
          <li>
            <strong>Everyone's calendar stays true.</strong> Google Calendar sync blocks personal appointments
            out of the public page automatically.
          </li>
        </ul>
        <h2>Fewer no-shows without lifting a finger</h2>
        <p>
          Confirmations go out the moment a client books; any reschedule or cancellation emails
          follow automatically. Clients who can't make it reschedule themselves, which turns a no-show into a
          filled slot later in the week.
        </p>
        <h2>Where the link lives</h2>
        <p>
          Instagram bio, Google Business Profile, WhatsApp auto-reply, and your site (the booking flow can be{" "}
          <strong>embedded</strong> directly into your website so clients never leave your page).
        </p>
        <h2>Common questions</h2>
        <h3>Can clients book multiple services at once?</h3>
        <p>
          Create combined event types for popular pairings, like "Cut + color (2h30)", so the time block is
          right by construction.
        </p>
        <h3>What about deposits?</h3>
        <p>
          BookYourSlot doesn't take payments today. Bookings are free to make, and you charge in person as
          usual.
        </p>
        <p>
          <a href="/signup">Create your salon's page free</a>. The{" "}
          <a href="/blog/create-online-booking-page">setup guide</a> takes about five minutes.
        </p>
      </>
    ),
  },
  {
    slug: "appointment-scheduling-local-businesses",
    title: "Appointment scheduling for local businesses: a practical guide",
    description:
      "Tutors, repair shops, studios, trainers: how local businesses replace phone-and-DM scheduling with a booking link that works around the clock.",
    date: "2026-07-19",
    readingMinutes: 5,
    excerpt:
      "If your business runs on appointments (tutoring, repairs, fittings, training sessions), a booking link replaces the DM back-and-forth entirely.",
    body: (
      <>
        <p>
          Tutors, repair shops, photographers, personal trainers, tailors, notaries: if your business runs on
          appointments, you're probably scheduling them over calls and DMs.{" "}
          <strong>A booking link replaces that entirely:</strong> customers see your open slots, pick one, and
          both of you get a confirmation. No app for them to install, nothing for you to answer at 10pm.
        </p>
        <h2>The one-hour setup</h2>
        <ol>
          <li>
            <a href="/signup">Create your account</a>. Your username becomes your link, like
            bookyourslot.online/yourshop.
          </li>
          <li>
            Add an event type per service: "Consultation (30m)", "Fitting (45m)", "Session (60m)", with travel
            or reset buffers where you need them.
          </li>
          <li>Set your working hours once; add date overrides for days off.</li>
          <li>Connect Google Calendar so personal commitments block business slots automatically.</li>
          <li>
            Put the link everywhere customers already find you: Google Business Profile, Instagram bio,
            WhatsApp status, your site (or embed the whole flow into it).
          </li>
        </ol>
        <h2>Why it beats DM scheduling</h2>
        <ul>
          <li>
            <strong>Zero back-and-forth.</strong> The average DM-scheduled appointment takes seven messages. A
            link takes zero.
          </li>
          <li>
            <strong>Time-zone proof.</strong> Remote sessions show slots in the customer's zone automatically.
          </li>
          <li>
            <strong>A calendar that defends itself.</strong> Double-bookings become structurally impossible
            instead of embarrassing.
          </li>
          <li>
            <strong>Reschedules handle themselves.</strong> Life happens; customers move their own booking and
            everyone's notified.
          </li>
        </ul>
        <h2>Common questions</h2>
        <h3>Do customers need an account?</h3>
        <p>No. Guests book with just their name and email.</p>
        <h3>Can I take bookings without a website?</h3>
        <p>Yes. The booking page is itself a hosted page; the link works anywhere you can paste text.</p>
        <h3>What does it cost?</h3>
        <p>It's free during early access. No card required.</p>
      </>
    ),
  },
  {
    slug: "scheduling-for-freelancers-consultants",
    title: "Scheduling for consultants and freelancers: protect your deep work",
    description:
      "How consultants use booking links to batch client calls, guard focus time with buffers and limits, and stop negotiating time zones by email.",
    date: "2026-07-19",
    readingMinutes: 4,
    excerpt:
      "A booking link isn't just convenient. Used well, it's how consultants ring-fence deep work while staying easy to reach.",
    body: (
      <>
        <p>
          For consultants and freelancers, scheduling isn't a convenience problem. It's a{" "}
          <strong>focus</strong> problem. Every "when works for you?" email costs a context switch, and every
          scattered call fragments a day that should have had four solid hours of real work in it. A booking
          link, configured deliberately, fixes both.
        </p>
        <h2>Design your link around your energy</h2>
        <ul>
          <li>
            <strong>Batch calls into windows.</strong> Offer intro calls only from 2 to 5pm, Tuesday to
            Thursday, and mornings stay untouchable deep-work time.
          </li>
          <li>
            <strong>Buffers are thinking time.</strong> 15 minutes after every call for notes and follow-ups,
            enforced automatically.
          </li>
          <li>
            <strong>Different links for different relationships.</strong> A 20-minute intro call for prospects
            and a 60-minute working session for clients are separate event types, separately shareable.
          </li>
        </ul>
        <h2>The time-zone email, retired</h2>
        <p>
          International clients see your slots in their own time zone automatically. "3pm your time or mine?"
          disappears from your vocabulary, along with the occasional 6am mistake.
        </p>
        <h2>Look bigger than one person</h2>
        <p>
          Your link lives at your own domain-backed page, confirmations go out instantly, reschedules
          self-serve, and your Google Calendar stays the single source of truth. When you grow into a studio,
          shared team pages and <a href="/blog/round-robin-scheduling-explained">round-robin</a> are on the
          roadmap, and your setup carries straight over.
        </p>
        <h2>Common questions</h2>
        <h3>Can I stop clients booking same-day?</h3>
        <p>Yes. Minimum-notice rules per event type keep surprise meetings off today's calendar.</p>
        <h3>Can I embed booking into my portfolio site?</h3>
        <p>Yes. Embed the flow directly, or just link out; both work.</p>
        <p>
          <a href="/signup">Set up your booking link free</a> and take the scheduling email out of your inbox
          for good.
        </p>
      </>
    ),
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
