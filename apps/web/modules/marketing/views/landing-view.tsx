import { APP_NAME } from "@calcom/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { BlurText } from "../components/BlurText";
import { BrowserFrame } from "../components/BrowserFrame";
import { FadeIn } from "../components/FadeIn";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingNav } from "../components/MarketingNav";
import { MarqueeBand } from "../components/MarqueeBand";
import { TimezoneStrip } from "../components/TimezoneStrip";

// ponytail: marketing copy is intentionally hardcoded English (single-locale
// marketing surface); move to i18n keys if/when the marketing site needs locales.

// Truth rule: every claim below maps to functionality that works on this
// instance. No video, payments, or Outlook, because they are not configured here.
const FEATURES = [
  {
    title: "Booking pages",
    description:
      "Every practitioner gets a clean public page. Share one link and guests pick a time that works, then book themselves.",
  },
  {
    title: "Availability & time zones",
    description:
      "Working hours, date overrides, and buffers, with every slot shown in the guest's own time zone automatically.",
  },
  {
    title: "Self-serve reschedules",
    description:
      "Guests move or cancel their own booking from the confirmation email, and your calendar updates itself.",
  },
  {
    title: "Google Calendar sync",
    description:
      "Two-way sync keeps your availability true and prevents double-bookings, and new bookings land on your calendar.",
  },
  {
    title: "Email confirmations",
    description:
      "Every booking, reschedule, and cancellation notifies everyone by email automatically. No follow-up needed.",
  },
  {
    title: "Embeds & webhooks",
    description:
      "Put your booking flow inside your own site, then automate what happens after a booking with webhooks.",
  },
];

/** Slugs must match posts in ~/marketing/blog/posts. */
const VERTICALS = [
  {
    label: "Dentists",
    href: "/blog/online-booking-for-dentists",
    color: "text-mk-forest",
    note: "Fill the chair without phone tag",
  },
  {
    label: "Doctors & clinics",
    href: "/blog/online-booking-for-clinics",
    color: "text-brand-periwinkle",
    note: "Fewer calls, fuller schedules",
  },
  {
    label: "Salons & spas",
    href: "/blog/salon-spa-booking-software",
    color: "text-mk-pink",
    note: "Clients book while your hands are full",
  },
  {
    label: "Local services",
    href: "/blog/appointment-scheduling-local-businesses",
    color: "text-mk-ink",
    note: "Replace the DM back-and-forth",
  },
  {
    label: "Consultants",
    href: "/blog/scheduling-for-freelancers-consultants",
    color: "text-mk-rust",
    note: "Protect your deep work",
  },
];

const STEPS = [
  {
    number: "01",
    color: "text-brand-periwinkle",
    title: "Create your event types",
    description: "Define durations, buffers, and where meetings happen. Once.",
  },
  {
    number: "02",
    color: "text-mk-pink",
    title: "Set your availability",
    description: "Working hours, date overrides, and calendar conflicts handled for you.",
  },
  {
    number: "03",
    color: "text-mk-forest",
    title: "Share your link",
    description: "Guests book themselves and confirmations go out automatically.",
  },
];

/** Exported for the FAQPage JSON-LD on the root route. Keep answers in sync with the visible FAQ. */
export const LANDING_FAQ = [
  {
    question: `What is ${APP_NAME}?`,
    answer:
      "BookYourSlot is a self-hosted scheduling platform. You create event types, set your availability, and share a booking page where guests pick a time. Confirmations and calendar updates happen automatically.",
  },
  {
    question: `Is ${APP_NAME} free?`,
    answer:
      "Yes. Creating an account and taking bookings is free during early access, and no credit card is required to sign up. New sign-ups are reviewed by an administrator before activation, so there is a short wait before your first sign-in.",
  },
  {
    question: "Does it sync with Google Calendar?",
    answer:
      "Yes. Connect Google Calendar and BookYourSlot reads your busy times to prevent double-bookings, then writes new bookings straight to your calendar.",
  },
  {
    question: "Can several practitioners use it?",
    answer:
      "Yes. Each practitioner gets their own account, booking page, and calendar on the same instance. Shared team pages with round-robin assignment are on the roadmap and not live yet.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "On our own self-hosted infrastructure at bookyourslot.online, not on a third-party scheduling cloud. Your bookings, guests, and availability stay in our own database.",
  },
  {
    question: "How do guests book time with me?",
    answer:
      "You share your personal link, like bookyourslot.online/yourname. Guests see your open slots in their time zone, pick one, and both of you get an email confirmation immediately.",
  },
];

export default function LandingView() {
  return (
    <div className="bg-mk-bg text-mk-ink min-h-screen font-sans antialiased">
      <MarketingNav />

      {/* Hero: constant navy block, condensed two-tone headline, the single signup CTA */}
      <section className="bg-brand-navy">
        <div className="mx-auto w-full max-w-6xl px-6 pb-10 pt-16 text-center sm:pt-24">
          <p className="border-brand-lime/40 text-brand-lime mx-auto mb-8 w-fit rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em]">
            Self-hosted scheduling
          </p>
          <h1 className="font-display mx-auto max-w-5xl text-6xl uppercase leading-[0.92] tracking-tight sm:text-8xl">
            <BlurText text="Scheduling that runs" className="text-brand-lime block" />
            <BlurText text="your business" delay={0.25} className="text-brand-periwinkle block" />
          </h1>
          {/* Names the product and states its purpose in plain words. Google's
              OAuth verification checks that the app name and purpose are visible
              on the home page, and the wordmark above is an outlined SVG, so
              this paragraph is where "BookYourSlot" exists as real text. */}
          <p className="text-brand-cream/70 mx-auto mt-7 max-w-2xl text-lg leading-relaxed">
            {APP_NAME} is online appointment booking software for small businesses and independent
            professionals. Share one link, let clients pick a time that suits them, and keep your Google
            Calendar in sync so you are never double booked.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-brand-lime text-brand-navy rounded-full px-9 py-4 text-sm font-semibold uppercase tracking-wide transition hover:-translate-y-0.5 hover:brightness-110">
              Create your booking page
            </Link>
          </div>
          <p className="text-brand-cream/50 mt-5 text-xs">
            Free during early access. No credit card required. New accounts are reviewed before activation.
          </p>

          {/* Professionals book across the world; the clocks are live */}
          <TimezoneStrip />
        </div>

        {/* Product screenshot */}
        <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-8">
          <FadeIn delay={0.15}>
            <BrowserFrame url="bookyourslot.online/startwithleo" href="/startwithleo">
              <Image
                src="/landing/booking.png"
                alt="A BookYourSlot public booking page showing a calendar of available times"
                width={1440}
                height={900}
                priority
                className="w-full"
              />
            </BrowserFrame>
          </FadeIn>
        </div>
      </section>

      {/* Plain-language description of the product, always visible (the FAQ
          below covers the same ground but sits inside collapsed accordions).
          Google's OAuth review reads this to confirm what the app does and why
          it asks for Google Calendar access. */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24" aria-labelledby="about-heading">
        <FadeIn>
          <p className="text-mk-faint text-xs font-medium uppercase tracking-[0.25em]">What {APP_NAME} is</p>
          <h2
            id="about-heading"
            className="font-display mt-6 max-w-4xl text-4xl uppercase tracking-tight sm:text-6xl">
            Booking software that runs on your own terms
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <p className="text-mk-ink/70 text-lg leading-relaxed">
              {APP_NAME} is a scheduling platform for dentists, clinics, salons, local services, and
              consultants. You set the hours you work and the types of appointment you offer, then share your
              personal booking page. Clients open the link, see only the times you are genuinely free, and
              book themselves. Everyone gets an email confirmation, and clients can reschedule or cancel from
              that email without messaging you.
            </p>
            <p className="text-mk-ink/70 text-lg leading-relaxed">
              Connecting Google Calendar is optional. When you do connect it, {APP_NAME} reads your busy times
              so it never offers a slot you are already booked for, and it writes each new appointment to your
              calendar so your day stays in one place. Calendar access is used for that scheduling purpose
              only. You can disconnect at any time from your settings, and our{" "}
              <Link href="/privacy" className="underline underline-offset-4">
                privacy policy
              </Link>{" "}
              explains exactly what is stored.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Built for: editorial vertical index linking the industry guides */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24" aria-labelledby="verticals-heading">
        <FadeIn>
          <p id="verticals-heading" className="text-mk-faint text-xs font-medium uppercase tracking-[0.25em]">
            Built for professionals worldwide
          </p>
        </FadeIn>
        <div className="mt-6 flex flex-col">
          {VERTICALS.map((vertical, i) => (
            <FadeIn key={vertical.href} delay={i * 0.05}>
              <Link
                href={vertical.href}
                className="group border-mk-border flex flex-wrap items-baseline justify-between gap-x-6 border-b py-4 transition hover:pl-2">
                <span
                  className={`font-display ${vertical.color} text-5xl uppercase leading-none tracking-tight transition group-hover:opacity-80 sm:text-7xl`}>
                  {vertical.label}
                </span>
                <span className="text-mk-muted text-sm opacity-0 transition duration-300 group-hover:opacity-100">
                  {vertical.note} →
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
        <p className="text-mk-muted mt-6 max-w-md text-sm">
          Each one links to a practical guide for taking bookings in that business, written from the product
          rather than from a template.
        </p>
      </section>

      {/* Features: constant forest block with cream cards */}
      <section className="bg-brand-forest" aria-labelledby="features-heading">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <FadeIn>
            <h2
              id="features-heading"
              className="font-display text-brand-cream text-4xl uppercase tracking-tight sm:text-6xl">
              Everything a booking business needs
            </h2>
            <p className="text-brand-cream/70 mt-3 max-w-md">
              The essentials, done properly. Nothing you have to babysit.
            </p>
          </FadeIn>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.06}>
                <div className="bg-brand-cream text-brand-navy h-full rounded-3xl p-7 transition duration-300 hover:-translate-y-1">
                  <h3 className="font-display text-xl uppercase tracking-tight">{feature.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed opacity-70">{feature.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24" aria-labelledby="steps-heading">
        <FadeIn>
          <h2 id="steps-heading" className="font-display text-4xl uppercase tracking-tight sm:text-6xl">
            Live in minutes
          </h2>
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeIn key={step.number} delay={i * 0.08}>
              <div className="border-mk-border bg-mk-surface h-full rounded-3xl border p-7 transition duration-300 hover:-translate-y-1">
                <span className={`font-display block text-7xl leading-none ${step.color}`}>
                  {step.number}
                </span>
                <h3 className="font-display mt-5 text-xl uppercase tracking-tight">{step.title}</h3>
                <p className="text-mk-muted mt-2 text-sm leading-relaxed">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* FAQ: constant navy block; also the AEO surface (mirrored in FAQPage JSON-LD) */}
      <section className="bg-brand-navy" aria-labelledby="faq-heading">
        <div className="mx-auto w-full max-w-3xl px-6 py-24">
          <FadeIn>
            <h2
              id="faq-heading"
              className="font-display text-brand-lime text-center text-4xl uppercase tracking-tight sm:text-6xl">
              Questions, answered
            </h2>
          </FadeIn>
          <div className="divide-brand-cream/10 mt-10 divide-y">
            {LANDING_FAQ.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="text-brand-cream flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="text-brand-lime text-xl leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-brand-cream/70 mt-3 text-sm leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Statement band instead of a repeated CTA */}
      <MarqueeBand />

      <MarketingFooter />
    </div>
  );
}
