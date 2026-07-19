import { APP_NAME } from "@calcom/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { BlurText } from "../components/BlurText";
import { BrowserFrame } from "../components/BrowserFrame";
import { FadeIn } from "../components/FadeIn";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingNav } from "../components/MarketingNav";

// ponytail: marketing copy is intentionally hardcoded English (single-locale
// marketing surface); move to i18n keys if/when the marketing site needs locales.

/** Prod runbook creates a `demo` user with a 30-min event backing this link. */
const DEMO_BOOKING_PATH = "/demo/30min";

// Truth rule: every claim below maps to functionality that works on this
// instance. No video, payments, or Outlook — they are not configured here.
const FEATURES = [
  {
    title: "Booking pages",
    description:
      "Every person and team gets a clean public page. Share one link; guests pick a time that works and book themselves.",
  },
  {
    title: "Availability & time zones",
    description:
      "Working hours, date overrides, and buffers — with every slot shown in the guest's own time zone automatically.",
  },
  {
    title: "Team scheduling",
    description:
      "Round-robin and collective events across your whole team, respecting each member's own availability.",
  },
  {
    title: "Google Calendar sync",
    description:
      "Two-way sync keeps your availability true and prevents double-bookings, with new bookings placed on your calendar.",
  },
  {
    title: "Confirmations & reminders",
    description:
      "Every booking, reschedule, and cancellation notifies everyone by email automatically — no follow-up needed.",
  },
  {
    title: "Embeds, API & webhooks",
    description:
      "Put your booking flow inside your own site and automate around it with webhooks and a full API.",
  },
];

/** Slugs must match posts in ~/marketing/blog/posts. */
const VERTICALS = [
  { label: "Dentists", href: "/blog/online-booking-for-dentists", color: "text-brand-forest" },
  { label: "Doctors & clinics", href: "/blog/online-booking-for-clinics", color: "text-brand-periwinkle" },
  { label: "Salons & spas", href: "/blog/salon-spa-booking-software", color: "text-[#C2497D]" },
  {
    label: "Local services",
    href: "/blog/appointment-scheduling-local-businesses",
    color: "text-brand-navy",
  },
  {
    label: "Consultants",
    href: "/blog/scheduling-for-freelancers-consultants",
    color: "text-[#B4530A]",
  },
];

const STEPS = [
  {
    number: "01",
    color: "text-brand-periwinkle",
    title: "Create your event types",
    description: "Define durations, buffers, and where meetings happen — once.",
  },
  {
    number: "02",
    color: "text-[#C2497D]",
    title: "Set your availability",
    description: "Working hours, date overrides, and calendar conflicts handled for you.",
  },
  {
    number: "03",
    color: "text-brand-forest",
    title: "Share your link",
    description: "Guests book themselves. Confirmations go out automatically.",
  },
];

/** Exported for the FAQPage JSON-LD on the root route — keep answers in sync with the visible FAQ. */
export const LANDING_FAQ = [
  {
    question: `What is ${APP_NAME}?`,
    answer:
      "BookYourSlot is a self-hosted scheduling platform. You create event types, set your availability, and share a booking page where guests pick a time — confirmations and calendar updates happen automatically.",
  },
  {
    question: `Is ${APP_NAME} free?`,
    answer:
      "Yes — creating an account and taking bookings is free during early access. No credit card is required to sign up.",
  },
  {
    question: "Does it sync with Google Calendar?",
    answer:
      "Yes. Connect Google Calendar and BookYourSlot reads your busy times to prevent double-bookings and writes new bookings straight to your calendar.",
  },
  {
    question: "Can my whole team use it?",
    answer:
      "Yes. Teams get shared event types, including round-robin (bookings distributed across members) and collective events (everyone attends), each respecting individual availability.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "On our own self-hosted infrastructure at bookyourslot.online — not on a third-party scheduling cloud. Your bookings, guests, and availability stay in our own database.",
  },
  {
    question: "How do guests book time with me?",
    answer:
      "You share your personal link, like bookyourslot.online/yourname. Guests see your open slots in their time zone, pick one, and both of you get an email confirmation immediately.",
  },
];

export default function LandingView() {
  return (
    <div className="bg-brand-cream text-brand-navy min-h-screen font-sans antialiased">
      <MarketingNav />

      {/* Hero — navy block, condensed two-tone headline */}
      <section className="bg-brand-navy">
        <div className="mx-auto w-full max-w-6xl px-6 pb-14 pt-16 text-center sm:pt-24">
          <p className="border-brand-lime/40 text-brand-lime mx-auto mb-8 w-fit rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em]">
            Self-hosted scheduling
          </p>
          <h1 className="font-display mx-auto max-w-5xl text-6xl uppercase leading-[0.92] tracking-tight sm:text-8xl">
            <BlurText text="Scheduling that runs" className="text-brand-lime block" />
            <BlurText text="your business" delay={0.25} className="text-brand-periwinkle block" />
          </h1>
          <p className="text-brand-cream/70 mx-auto mt-7 max-w-xl text-lg leading-relaxed">
            Give every person and team a booking page guests love — availability rules, Google Calendar sync,
            and automatic confirmations, with your name on the door.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="bg-brand-lime text-brand-navy rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-wide transition hover:brightness-110">
              Get started free
            </Link>
            <Link
              href={DEMO_BOOKING_PATH}
              className="border-brand-cream/40 text-brand-cream hover:border-brand-cream rounded-full border px-8 py-4 text-sm font-semibold uppercase tracking-wide transition">
              See a live booking page
            </Link>
          </div>
          <p className="text-brand-cream/50 mt-6 text-xs">
            Free during early access. No credit card required.
          </p>
        </div>

        {/* Product screenshot */}
        <div className="mx-auto w-full max-w-5xl px-6 pb-20">
          <FadeIn delay={0.15}>
            <BrowserFrame url="bookyourslot.online/demo">
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

      {/* Built for — editorial vertical index, links to the guides */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20" aria-labelledby="verticals-heading">
        <FadeIn>
          <p
            id="verticals-heading"
            className="text-brand-navy/60 text-xs font-medium uppercase tracking-[0.25em]">
            Built for
          </p>
        </FadeIn>
        <div className="mt-6 flex flex-col">
          {VERTICALS.map((vertical, i) => (
            <FadeIn key={vertical.href} delay={i * 0.05}>
              <Link
                href={vertical.href}
                className={`font-display ${vertical.color} block border-b border-brand-navy/10 py-3 text-5xl uppercase leading-none tracking-tight transition hover:translate-x-2 hover:opacity-80 sm:text-7xl`}>
                {vertical.label}
              </Link>
            </FadeIn>
          ))}
        </div>
        <p className="text-brand-navy/60 mt-6 max-w-md text-sm">
          Each one links to a practical guide for taking bookings in that business — written from the product,
          not from a template.
        </p>
      </section>

      {/* Features — forest block */}
      <section className="bg-brand-forest" aria-labelledby="features-heading">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <FadeIn>
            <h2
              id="features-heading"
              className="font-display text-brand-cream text-4xl uppercase tracking-tight sm:text-6xl">
              Everything a booking business needs
            </h2>
            <p className="text-brand-cream/70 mt-3 max-w-md">
              The essentials, done properly — nothing you have to babysit.
            </p>
          </FadeIn>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.06}>
                <div className="bg-brand-cream h-full rounded-3xl p-7">
                  <h3 className="font-display text-xl uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-brand-navy/70 mt-2.5 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20" aria-labelledby="steps-heading">
        <FadeIn>
          <h2 id="steps-heading" className="font-display text-4xl uppercase tracking-tight sm:text-6xl">
            Live in minutes
          </h2>
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeIn key={step.number} delay={i * 0.08}>
              <div className="border-brand-navy/10 h-full rounded-3xl border bg-white/60 p-7">
                <span className={`font-display block text-7xl leading-none ${step.color}`}>
                  {step.number}
                </span>
                <h3 className="font-display mt-5 text-xl uppercase tracking-tight">{step.title}</h3>
                <p className="text-brand-navy/70 mt-2 text-sm leading-relaxed">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* FAQ — navy block; also the AEO surface (mirrored in FAQPage JSON-LD) */}
      <section className="bg-brand-navy" aria-labelledby="faq-heading">
        <div className="mx-auto w-full max-w-3xl px-6 py-20">
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

      {/* Final CTA — lime block */}
      <section className="bg-brand-lime">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 text-center sm:py-24">
          <FadeIn>
            <h2 className="font-display text-5xl uppercase leading-[0.92] tracking-tight sm:text-8xl">
              Own your scheduling
            </h2>
            <p className="text-brand-navy/70 mx-auto mt-5 max-w-md">
              Your guests, your data, your brand. Set up your first booking page today.
            </p>
            <Link
              href="/signup"
              className="bg-brand-navy text-brand-cream mt-9 inline-block rounded-full px-9 py-4 text-sm font-semibold uppercase tracking-wide transition hover:opacity-90">
              Get started free
            </Link>
          </FadeIn>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
