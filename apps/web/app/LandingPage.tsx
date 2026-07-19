import Link from "next/link";

import { APP_NAME } from "@calcom/lib/constants";

// ponytail: marketing copy is intentionally hardcoded English (single-locale landing);
// move to i18n keys if/when the marketing site needs locales.
const FEATURES = [
  {
    title: "Booking pages",
    description: "Every person and team gets a clean public page. Share one link; guests pick a time that works.",
  },
  {
    title: "Team scheduling",
    description: "Round-robin, collective, and managed events across your whole team, with per-member availability.",
  },
  {
    title: "Calendar sync",
    description: "Two-way sync with Google and Outlook keeps availability true and prevents double-bookings.",
  },
  {
    title: "Video meetings",
    description: "Auto-generated video links for every booking — built-in video, Zoom, or Google Meet.",
  },
  {
    title: "Payments",
    description: "Charge for bookings with Stripe: deposits, full payment, or no-show fees.",
  },
  {
    title: "API & webhooks",
    description: "Automate everything with a full REST API, webhooks, and embeds for your own site.",
  },
];

const STEPS = [
  { step: "1", title: "Create your event types", description: "Define durations, buffers, and where meetings happen." },
  { step: "2", title: "Set your availability", description: "Working hours, date overrides, and calendar conflicts handled." },
  { step: "3", title: "Share your link", description: "Guests book themselves. Confirmations and reminders go out automatically." },
];

const TIERS = [
  {
    name: "Starter",
    price: "Free",
    cadence: "",
    description: "For individuals getting started.",
    features: ["1 user", "Unlimited event types", "Unlimited bookings", "Calendar sync"],
    cta: "Get started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "per user / month",
    description: "For teams that book together.",
    features: ["Everything in Starter", "Team & round-robin events", "Payments with Stripe", "Workflows & reminders"],
    cta: "Start free trial",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Business",
    price: "Let's talk",
    cadence: "",
    description: "White-label scheduling for your organization.",
    features: ["Everything in Pro", "Your own domain & branding", "Priority support", "Custom integrations"],
    cta: "Book a call",
    href: "/free/30min",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
        <nav className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-300 transition hover:text-white">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200">
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center sm:pt-24">
        <p className="mx-auto mb-6 w-fit rounded-full border border-neutral-800 px-4 py-1.5 text-xs font-medium text-neutral-400">
          Scheduling infrastructure, under your brand
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Scheduling that runs your business
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-400">
          Booking pages, team scheduling, calendar sync, and payments — on your own infrastructure, with your
          name on the door.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200">
            Get started free
          </Link>
          <Link
            href="/free/30min"
            className="rounded-xl border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500">
            See a live booking page
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Everything a booking business needs</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Live in minutes</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="rounded-2xl border border-neutral-800 p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-neutral-950">
                {item.step}
              </span>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Simple pricing</h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 ${
                tier.highlight ? "border-white bg-neutral-900" : "border-neutral-800"
              }`}>
              <h3 className="font-semibold">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
                {tier.cadence ? <span className="text-sm text-neutral-400">{tier.cadence}</span> : null}
              </div>
              <p className="mt-2 text-sm text-neutral-400">{tier.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-neutral-300">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span aria-hidden="true" className="text-neutral-500">
                      —
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`mt-8 block rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
                  tier.highlight
                    ? "bg-white text-neutral-950 hover:bg-neutral-200"
                    : "border border-neutral-700 text-neutral-200 hover:border-neutral-500"
                }`}>
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 px-8 py-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Own your scheduling</h2>
          <p className="mx-auto mt-4 max-w-md text-neutral-400">
            Your clients, your data, your brand. Set up your first booking page today.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200">
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-neutral-900 px-6 py-10 text-sm text-neutral-500 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {APP_NAME}
        </span>
        <span>Built on open-source scheduling infrastructure</span>
      </footer>
    </div>
  );
}
