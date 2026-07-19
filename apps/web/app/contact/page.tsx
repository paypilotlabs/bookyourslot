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
        <h1 className="font-display text-5xl uppercase tracking-tight sm:text-6xl">Contact</h1>
        <p className="text-brand-navy/70 mt-4 max-w-xl">
          One inbox, read by a human. Whatever it's about, write to us and we'll get back to you — usually
          within one business day.
        </p>
        <a
          href={`mailto:${SUPPORT_MAIL_ADDRESS}`}
          className="bg-brand-navy text-brand-cream mt-8 inline-block rounded-full px-7 py-3.5 text-sm font-semibold transition hover:opacity-90">
          {SUPPORT_MAIL_ADDRESS}
        </a>
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {REASONS.map((reason) => (
            <div key={reason.title} className="border-brand-navy/10 rounded-3xl border bg-white/60 p-6">
              <h2 className="font-display text-lg uppercase tracking-tight">{reason.title}</h2>
              <p className="text-brand-navy/70 mt-2 text-sm leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
