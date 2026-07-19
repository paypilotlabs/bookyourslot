import { APP_NAME, SUPPORT_MAIL_ADDRESS, WEBSITE_URL } from "@calcom/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "~/marketing/components/JsonLd";
import { MarketingShell } from "~/marketing/components/MarketingShell";

// ponytail: marketing copy is intentionally hardcoded English (single-locale
// marketing surface); move to i18n keys if/when the marketing site needs locales.

export const metadata = {
  title: `About — ${APP_NAME}`,
  description:
    "BookYourSlot is built by Lohith Kumar Nerukonda to give local businesses enterprise-grade booking — self-hosted, honest, and always improving.",
  alternates: { canonical: `${WEBSITE_URL}/about` },
};

const FOCUS_AREAS = [
  {
    title: "Local first",
    description:
      "Dentists, salons, clinics, tutors, studios — businesses that live on appointments deserve the same booking experience the big platforms have, on their own terms.",
  },
  {
    title: "Enterprise-grade bones",
    description:
      "Team scheduling, round-robin assignment, calendar sync, webhooks, and an API — the machinery that scales from one chair to a whole organization.",
  },
  {
    title: "Open to your stack",
    description:
      "Compatibility with external integrations is a product priority: your calendar, your website embed, your automations — BookYourSlot plugs in rather than locking in.",
  },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": `${WEBSITE_URL}/about#lohith`,
              name: "Lohith Kumar Nerukonda",
              url: `${WEBSITE_URL}/about`,
              image: `${WEBSITE_URL}/about/lohith.jpg`,
              jobTitle: "Founder & builder",
              worksFor: { "@id": `${WEBSITE_URL}/#organization` },
              email: SUPPORT_MAIL_ADDRESS,
            },
            {
              "@type": "AboutPage",
              url: `${WEBSITE_URL}/about`,
              name: `About ${APP_NAME}`,
              about: { "@id": `${WEBSITE_URL}/about#lohith` },
            },
          ],
        }}
      />
      <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-12">
        <p className="text-brand-navy/60 text-xs font-medium uppercase tracking-[0.25em]">About</p>
        <h1 className="font-display mt-4 max-w-3xl text-5xl uppercase leading-[0.95] tracking-tight sm:text-7xl">
          Booking software with a <span className="text-brand-periwinkle">person</span> behind it
        </h1>

        <div className="mt-14 grid gap-10 sm:grid-cols-[280px_1fr] sm:gap-14">
          <div>
            <Image
              src="/about/lohith.jpg"
              alt="Lohith Kumar Nerukonda, founder of BookYourSlot"
              width={800}
              height={800}
              className="border-brand-navy/10 w-full rounded-3xl border"
            />
            <p className="font-display mt-4 text-xl uppercase tracking-tight">Lohith Kumar Nerukonda</p>
            <p className="text-brand-navy/60 text-sm">Founder & builder</p>
          </div>

          <div className="text-brand-navy/80 space-y-5 text-[15px] leading-7">
            <p>
              I'm Lohith, and I built {APP_NAME} for a simple reason: every local business I know still books
              appointments through phone tag and DMs, while the tools that fix it either cost per seat forever
              or keep the business's client data on someone else's cloud.
            </p>
            <p>
              {APP_NAME} is my answer — a self-hosted scheduling platform that gives local businesses
              enterprise-level booking: real availability rules, team scheduling, calendar sync, and automatic
              confirmations, running on infrastructure we control at bookyourslot.online.
            </p>
            <p>
              My focus is narrow on purpose: keep improving the product, and keep it compatible with the tools
              you already use — your calendar, your website, your automations. No feature theater; the things
              on the landing page are the things that work.
            </p>
            <p>
              If you run on appointments and something's missing for your business, tell me directly:{" "}
              <a
                className="text-brand-navy font-medium underline underline-offset-2 hover:opacity-70"
                href={`mailto:${SUPPORT_MAIL_ADDRESS}`}>
                {SUPPORT_MAIL_ADDRESS}
              </a>
              . I read every message.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          {FOCUS_AREAS.map((area) => (
            <div key={area.title} className="border-brand-navy/10 rounded-3xl border bg-white/60 p-7">
              <h2 className="font-display text-xl uppercase tracking-tight">{area.title}</h2>
              <p className="text-brand-navy/70 mt-2.5 text-sm leading-relaxed">{area.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-brand-navy mt-16 rounded-3xl p-10 text-center">
          <p className="font-display text-brand-lime text-3xl uppercase tracking-tight sm:text-5xl">
            Try what I'm building
          </p>
          <Link
            href="/signup"
            className="bg-brand-lime text-brand-navy mt-7 inline-block rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-wide transition hover:brightness-110">
            Get started free
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
