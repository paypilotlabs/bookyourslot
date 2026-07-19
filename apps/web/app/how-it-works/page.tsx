import { APP_NAME, WEBSITE_URL } from "@calcom/lib/constants";
import Image from "next/image";
import { JsonLd } from "~/marketing/components/JsonLd";
import { MarketingShell } from "~/marketing/components/MarketingShell";

// ponytail: marketing copy is intentionally hardcoded English (single-locale
// marketing surface); move to i18n keys if/when the marketing site needs locales.

export const metadata = {
  title: `How it works · ${APP_NAME}`,
  description:
    "See exactly how BookYourSlot works: guests book in three steps, owners run their day from a live calendar that updates itself. Real screenshots, no mockups.",
  alternates: { canonical: `${WEBSITE_URL}/how-it-works` },
};

const GUEST_STEPS = [
  {
    number: "1",
    title: "Open the link, see real availability",
    body: "The booking page shows a month calendar with bookable days and a slot rail for the selected day. Guests can switch time zones (theirs is auto-detected), flip 12h/24h, and change the calendar view with the layout toggles.",
    image: "/how-it-works/g1-calendar.jpg",
    alt: "Booking page with month calendar and available time slots",
  },
  {
    number: "2",
    title: "Two required fields",
    body: "Name and email. Optional notes and extra guests. The left panel repeats exactly what is being booked, so nobody confirms the wrong thing.",
    image: "/how-it-works/g2-form.jpg",
    alt: "Booking form asking only for name and email",
  },
  {
    number: "3",
    title: "Confirmed, with an exit hatch",
    body: "The confirmation page and email arrive instantly, both carrying reschedule and cancel links. Guests who need to move pick a new slot themselves and both calendars update.",
    image: "/how-it-works/g3-confirmed.jpg",
    alt: "Booking confirmed page with reschedule and cancel options",
  },
];

const OWNER_TOUR = [
  {
    title: "Event types",
    body: "One event type per service, each with duration, buffers, location, minimum notice, booking limits, recurring sessions, or require-confirmation.",
    image: "/how-it-works/o3-event-types.jpg",
    alt: "Event types list in the dashboard",
  },
  {
    title: "Availability",
    body: "Weekly working hours plus date overrides for holidays. Multiple schedules are supported for different services.",
    image: "/how-it-works/o4-availability.jpg",
    alt: "Availability schedule editor",
  },
  {
    title: "Calendar",
    body: "Week and day views with hours that stretch to fit your real bookings, overlaps side by side, service filter pills, and click-through to every booking.",
    image: "/how-it-works/o1-calendar.jpg",
    alt: "Owner week calendar with bookings",
  },
  {
    title: "Bookings",
    body: "Today and Next groups, tabs for Unconfirmed, Past and Canceled, and Confirm or Reject right on the row.",
    image: "/how-it-works/o2-bookings.jpg",
    alt: "Bookings list with confirm and reject actions",
  },
];

const SETTINGS_GROUPS = [
  {
    name: "My account",
    items:
      "Profile (photo, name, your booking link) · General (language, time zone, time format, week start) · Calendars (Google or Apple connection, destination calendar, conflict checks) · Appearance (dashboard theme, booking-page theme, layouts, brand color) · Out of office · Push notifications",
  },
  {
    name: "Security",
    items: "Password · Two-factor authentication with backup codes",
  },
  {
    name: "Developer",
    items: "Webhooks for booking events · API keys · OAuth clients",
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `How booking works on ${APP_NAME}`,
          description:
            "Guests book in three steps: open the booking link, enter a name and email, get instant confirmation with self-serve reschedule links.",
          step: GUEST_STEPS.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.title,
            text: step.body,
          })),
        }}
      />
      <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-12">
        <p className="text-mk-faint text-xs font-medium uppercase tracking-[0.25em]">How it works</p>
        <h1 className="font-display mt-4 max-w-3xl text-5xl uppercase leading-[0.95] tracking-tight sm:text-7xl">
          See the whole product <span className="text-brand-periwinkle">before</span> you sign up
        </h1>
        <p className="text-mk-muted mt-5 max-w-xl">
          Every screenshot on this page is the real product. Nothing here is a mockup, and anything not shown
          is not claimed.
        </p>

        {/* Guest side */}
        <h2 className="font-display mt-20 text-3xl uppercase tracking-tight sm:text-5xl">
          Guests book in three steps
        </h2>
        <p className="text-mk-muted mt-3 max-w-xl">No account, no app. A link, a calendar, two fields.</p>
        <div className="mt-10 space-y-14">
          {GUEST_STEPS.map((step) => (
            <div key={step.number} className="grid items-start gap-6 sm:grid-cols-[220px_1fr]">
              <div>
                <span className="font-display text-brand-periwinkle block text-6xl leading-none">
                  {step.number}
                </span>
                <h3 className="font-display mt-3 text-xl uppercase tracking-tight">{step.title}</h3>
                <p className="text-mk-muted mt-2 text-sm leading-relaxed">{step.body}</p>
              </div>
              <Image
                src={step.image}
                alt={step.alt}
                width={1400}
                height={875}
                className="border-mk-border w-full rounded-2xl border shadow-[0_16px_36px_-22px_rgba(14,14,27,0.35)]"
              />
            </div>
          ))}
        </div>

        {/* Owner side */}
        <h2 className="font-display mt-24 text-3xl uppercase tracking-tight sm:text-5xl">
          Owners run the day from four screens
        </h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {OWNER_TOUR.map((item) => (
            <div key={item.title}>
              <Image
                src={item.image}
                alt={item.alt}
                width={1400}
                height={875}
                className="border-mk-border w-full rounded-2xl border"
              />
              <h3 className="font-display mt-4 text-xl uppercase tracking-tight">{item.title}</h3>
              <p className="text-mk-muted mt-1.5 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        {/* Live refresh */}
        <div className="border-mk-border bg-mk-surface mt-24 rounded-3xl border p-8 sm:p-10">
          <p className="text-mk-forest text-xs font-bold uppercase tracking-[0.2em]">Live, verified</p>
          <h2 className="font-display mt-3 text-3xl uppercase tracking-tight sm:text-4xl">
            The screen stays current by itself
          </h2>
          <p className="text-mk-muted mt-3 max-w-2xl text-sm leading-relaxed">
            Mid-appointment, screen on, someone books online: the Calendar and Bookings pages quietly re-check
            every 30 seconds and on focus. New bookings slide in on their own and a toast announces them, so
            nothing lands unnoticed and nobody walks in unprepared. The screenshot below is our actual test: a
            booking created while the screen sat open appeared 22 seconds later, with zero refreshes.
          </p>
          <Image
            src="/how-it-works/o5-live.jpg"
            alt="A new booking appearing on the calendar with a toast notification, without refreshing"
            width={1400}
            height={875}
            className="border-mk-border mt-6 w-full rounded-2xl border"
          />
        </div>

        {/* Settings */}
        <h2 className="font-display mt-24 text-3xl uppercase tracking-tight sm:text-5xl">
          Every setting, in its place
        </h2>
        <p className="text-mk-muted mt-3 max-w-xl">Three groups. Nothing hidden, nothing scattered.</p>
        <div className="mt-8 space-y-4">
          {SETTINGS_GROUPS.map((group) => (
            <div key={group.name} className="border-mk-border bg-mk-surface rounded-2xl border p-6">
              <h3 className="font-display text-lg uppercase tracking-tight">{group.name}</h3>
              <p className="text-mk-muted mt-1.5 text-sm leading-relaxed">{group.items}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Image
            src="/how-it-works/s3-appearance.jpg"
            alt="Appearance settings with dashboard and booking page themes"
            width={1400}
            height={875}
            className="border-mk-border w-full rounded-2xl border"
          />
          <Image
            src="/how-it-works/s2-calendars.jpg"
            alt="Calendar connection settings"
            width={1400}
            height={875}
            className="border-mk-border w-full rounded-2xl border"
          />
        </div>

        <p className="text-mk-faint mt-16 max-w-2xl text-sm">
          Honest boundaries: pre-appointment reminders and shared team pages are on the roadmap and not in the
          product today. This page only shows what runs.
        </p>
      </div>
    </MarketingShell>
  );
}
