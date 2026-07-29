import { APP_NAME, SEO_IMG_DEFAULT, SUPPORT_MAIL_ADDRESS, WEBSITE_URL } from "@calcom/lib/constants";
import { MarketingShell } from "~/marketing/components/MarketingShell";
import { Prose } from "~/marketing/components/Prose";

export const metadata = {
  title: `Terms of Service · ${APP_NAME}`,
  description: "The terms that apply when you create an account or book a meeting on BookYourSlot.",
  alternates: { canonical: `${WEBSITE_URL}/terms` },
  openGraph: {
    title: `Terms of Service · ${APP_NAME}`,
    description: "The terms that apply when you create an account or book a meeting on BookYourSlot.",
    url: `${WEBSITE_URL}/terms`,
    siteName: APP_NAME,
    type: "website",
    images: [{ url: SEO_IMG_DEFAULT, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Terms of Service · ${APP_NAME}`,
    description: "The terms that apply when you create an account or book a meeting on BookYourSlot.",
  },
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
        <h1 className="font-display text-5xl uppercase tracking-tight sm:text-6xl">Terms of Service</h1>
        <p className="text-brand-navy/50 mt-3 text-sm">Last updated: July 18, 2026</p>
        <Prose>
          <p>
            These terms apply when you create an account on {APP_NAME} (bookyourslot.online) or book a meeting
            through a {APP_NAME} booking page. By using the service you agree to them. If you have questions,
            write to <a href={`mailto:${SUPPORT_MAIL_ADDRESS}`}>{SUPPORT_MAIL_ADDRESS}</a>.
          </p>
          <h2>The service</h2>
          <p>
            {APP_NAME} provides scheduling tools: booking pages, availability management, team scheduling,
            calendar connections, and email notifications. The service is currently offered free of charge
            during early access; we may introduce paid plans later, and will announce any change before it
            affects existing accounts.
          </p>
          <h2>Your account</h2>
          <ul>
            <li>You must provide accurate information and keep your password secure.</li>
            <li>You are responsible for activity that happens under your account.</li>
            <li>One person or legal entity per account; team members each use their own account.</li>
          </ul>
          <h2>Acceptable use</h2>
          <p>
            Don't use {APP_NAME} to send spam, harvest data, impersonate others, host unlawful content, or
            interfere with the service's operation. We may suspend accounts that do.
          </p>
          <h2>Your content and data</h2>
          <p>
            Bookings, event types, and guest details you create remain yours. We process them only to operate
            the service, as described in our <a href="/privacy">Privacy Policy</a>. You can ask for your data
            to be exported or deleted at any time.
          </p>
          <h2>Availability and changes</h2>
          <p>
            We work to keep the service reliable, but it is provided "as is" without warranties of any kind,
            and during early access features may change. Our total liability for any claim related to the
            service is limited to the amount you paid us in the twelve months before the claim, which is
            currently zero during free early access.
          </p>
          <h2>Termination</h2>
          <p>
            You can delete your account whenever you like. We may suspend or terminate accounts that violate
            these terms, and we'll tell you why when we do.
          </p>
          <h2>Contact</h2>
          <p>
            {APP_NAME} · <a href={`mailto:${SUPPORT_MAIL_ADDRESS}`}>{SUPPORT_MAIL_ADDRESS}</a>
          </p>
        </Prose>
      </div>
    </MarketingShell>
  );
}
