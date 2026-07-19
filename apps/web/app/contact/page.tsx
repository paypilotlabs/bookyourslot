import { APP_NAME, SUPPORT_MAIL_ADDRESS, WEBSITE_URL } from "@calcom/lib/constants";

import { MarketingShell } from "~/marketing/components/MarketingShell";

export const metadata = {
  title: `Contact — ${APP_NAME}`,
  description:
    "Get in touch with the BookYourSlot team — support, feedback, security reports, and partnership questions.",
  alternates: { canonical: `${WEBSITE_URL}/contact` },
};

const REASONS = [
  {
    title: "Support",
    description: "Something not working, or a question about setting up your booking page.",
  },
  {
    title: "Feedback & feature requests",
    description: "Tell us what's missing — early-access feedback directly shapes what we build next.",
  },
  {
    title: "Security",
    description: "Found a vulnerability? Please report it privately — we acknowledge within 72 hours.",
  },
];

export default function ContactPage() {
  return (
    <MarketingShell>
      <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Contact</h1>
        <p className="mt-4 max-w-xl text-neutral-600">
          One inbox, read by a human. Whatever it's about, write to us and we'll get back to you —
          usually within one business day.
        </p>
        <a
          href={`mailto:${SUPPORT_MAIL_ADDRESS}`}
          className="mt-8 inline-block rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-700">
          {SUPPORT_MAIL_ADDRESS}
        </a>
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {REASONS.map((reason) => (
            <div key={reason.title} className="rounded-3xl border border-neutral-200/80 bg-white p-6">
              <h2 className="font-display text-base">{reason.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
