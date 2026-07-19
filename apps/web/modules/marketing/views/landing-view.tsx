import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@calcom/lib/constants";

import { BlurText } from "../components/BlurText";
import { BrowserFrame } from "../components/BrowserFrame";
import { FadeIn } from "../components/FadeIn";
import { GradientDrift } from "../components/GradientDrift";
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

const STEPS = [
  {
    number: "01",
    title: "Create your event types",
    description: "Define durations, buffers, and where meetings happen — once.",
  },
  {
    number: "02",
    title: "Set your availability",
    description: "Working hours, date overrides, and calendar conflicts handled for you.",
  },
  {
    number: "03",
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
    <div className="min-h-screen bg-[#F7F7F8] font-sans text-[#1A1A1A] antialiased">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <GradientDrift />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-16 text-center sm:pt-24">
          <p className="mx-auto mb-7 w-fit rounded-full border border-neutral-300/80 bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wide text-neutral-600 backdrop-blur">
            Self-hosted scheduling, on your own domain
          </p>
          <h1 className="font-display mx-auto max-w-4xl text-balance text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            <BlurText text="Scheduling that runs your business" />
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
            Give every person and team a beautiful booking page — availability rules, Google Calendar
            sync, and automatic confirmations, with your name on the door.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-700">
              Get started free
            </Link>
            <Link
              href={DEMO_BOOKING_PATH}
              className="rounded-full border border-neutral-300 bg-white/70 px-7 py-3.5 text-sm font-semibold text-neutral-800 backdrop-blur transition hover:border-neutral-500">
              See a live booking page
            </Link>
          </div>
          <p className="mt-5 text-xs text-neutral-500">Free during early access. No credit card required.</p>
        </div>

        {/* Product screenshot */}
        <div className="relative mx-auto w-full max-w-5xl px-6 pb-20">
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

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20" aria-labelledby="features-heading">
        <FadeIn>
          <h2 id="features-heading" className="font-display text-center text-3xl tracking-tight sm:text-4xl">
            Everything a booking business needs
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-neutral-600">
            The essentials, done properly — nothing you have to babysit.
          </p>
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.06}>
              <div className="h-full rounded-3xl border border-neutral-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(16,16,16,0.04)] transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(16,16,16,0.18)]">
                <h3 className="font-display text-lg">{feature.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20" aria-labelledby="steps-heading">
        <FadeIn>
          <h2 id="steps-heading" className="font-display text-center text-3xl tracking-tight sm:text-4xl">
            Live in minutes
          </h2>
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeIn key={step.number} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-neutral-200/80 bg-white p-7">
                <span className="font-display block text-5xl leading-none text-neutral-300">{step.number}</span>
                <h3 className="font-display mt-5 text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* FAQ — also the AEO surface; mirrored in FAQPage JSON-LD on the root route */}
      <section className="mx-auto w-full max-w-3xl px-6 py-20" aria-labelledby="faq-heading">
        <FadeIn>
          <h2 id="faq-heading" className="font-display text-center text-3xl tracking-tight sm:text-4xl">
            Questions, answered
          </h2>
        </FadeIn>
        <div className="mt-10 divide-y divide-neutral-200/80 rounded-3xl border border-neutral-200/80 bg-white px-7 shadow-[0_1px_2px_rgba(16,16,16,0.04)]">
          {LANDING_FAQ.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="text-xl leading-none text-neutral-400 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-4">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-100 via-violet-200 to-sky-200 px-8 py-16 text-center sm:py-20">
            <h2 className="font-display text-3xl tracking-tight text-neutral-900 sm:text-5xl">
              Own your scheduling
            </h2>
            <p className="mx-auto mt-4 max-w-md text-neutral-700">
              Your guests, your data, your brand. Set up your first booking page today.
            </p>
            <Link
              href="/signup"
              className="mt-9 inline-block rounded-full bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-700">
              Get started free
            </Link>
          </div>
        </FadeIn>
      </section>

      <MarketingFooter />
    </div>
  );
}
