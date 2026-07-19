import { APP_NAME, SUPPORT_MAIL_ADDRESS, WEBSITE_URL } from "@calcom/lib/constants";

import { MarketingShell } from "~/marketing/components/MarketingShell";
import { Prose } from "~/marketing/components/Prose";

export const metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
  description:
    "What data BookYourSlot collects, why, and how it's handled — for account holders and for guests who book meetings.",
  alternates: { canonical: `${WEBSITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-neutral-500">Last updated: July 18, 2026</p>
        <Prose>
          <p>
            This policy explains what data {APP_NAME} (bookyourslot.online) collects, why, and how it's
            handled — both for account holders and for guests who book meetings through a booking page.
            The short version: we collect what scheduling needs to work, we store it on our own
            infrastructure, and we don't sell it.
          </p>
          <h2>Data we collect</h2>
          <ul>
            <li>
              <strong>Account data</strong> — name, email, username, time zone, and the availability and
              event types you configure.
            </li>
            <li>
              <strong>Booking data</strong> — when a guest books: their name, email, chosen time, and
              anything they type into the booking form.
            </li>
            <li>
              <strong>Calendar data</strong> — if you connect Google Calendar, we read busy/free times to
              prevent double-bookings and create events for new bookings. Connection tokens are stored
              encrypted.
            </li>
            <li>
              <strong>Technical data</strong> — standard server logs (IP address, browser, timestamps)
              used for security and debugging.
            </li>
          </ul>
          <h2>How we use it</h2>
          <p>
            Only to operate the service: showing accurate availability, creating bookings, sending
            confirmation and reminder emails, and keeping the platform secure. We do not sell personal
            data or use it for third-party advertising.
          </p>
          <h2>Where it lives</h2>
          <p>
            Data is stored in our own database on self-hosted infrastructure operated for
            bookyourslot.online. Emails are delivered through our mail provider; calendar sync talks
            directly to Google's APIs.
          </p>
          <h2>Guests</h2>
          <p>
            If you booked a meeting with someone through {APP_NAME}, the host controls that booking. We
            store your name, email, and booking details so the meeting can happen, and email you
            confirmations and any reschedule or cancellation updates for it.
          </p>
          <h2>Your rights</h2>
          <p>
            You can access, correct, export, or delete your data — account holders from their settings,
            and anyone by emailing <a href={`mailto:${SUPPORT_MAIL_ADDRESS}`}>{SUPPORT_MAIL_ADDRESS}</a>.
            We answer within 30 days.
          </p>
          <h2>Cookies</h2>
          <p>
            We use session cookies needed to keep you signed in. No third-party advertising cookies.
          </p>
          <h2>Changes and contact</h2>
          <p>
            If this policy changes materially we'll note it here with a new date. Questions:{" "}
            <a href={`mailto:${SUPPORT_MAIL_ADDRESS}`}>{SUPPORT_MAIL_ADDRESS}</a>.
          </p>
        </Prose>
      </div>
    </MarketingShell>
  );
}
