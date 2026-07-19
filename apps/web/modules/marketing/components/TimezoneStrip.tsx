"use client";

import { useEffect, useState } from "react";

const CITIES = [
  { label: "Bengaluru", timeZone: "Asia/Kolkata" },
  { label: "London", timeZone: "Europe/London" },
  { label: "New York", timeZone: "America/New_York" },
  { label: "Singapore", timeZone: "Asia/Singapore" },
  { label: "Sydney", timeZone: "Australia/Sydney" },
];

function formatCity(timeZone: string, now: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(now);
}

/**
 * Live clocks for guests around the world. Renders placeholders on the
 * server and starts ticking after mount, so hydration stays clean.
 */
export function TimezoneStrip() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto mt-12 w-full max-w-4xl">
      <div className="border-brand-cream/15 grid grid-cols-2 divide-y divide-brand-cream/10 border-y sm:grid-cols-5 sm:divide-x sm:divide-y-0">
        {CITIES.map((city) => (
          <div key={city.timeZone} className="px-4 py-4 text-center">
            <p className="text-brand-cream/50 text-[11px] font-medium uppercase tracking-[0.2em]">
              {city.label}
            </p>
            <p
              className="text-brand-cream mt-1 font-medium tabular-nums"
              suppressHydrationWarning
              aria-hidden={now === null}>
              {now ? formatCity(city.timeZone, now) : "--:--"}
            </p>
          </div>
        ))}
      </div>
      <p className="text-brand-cream/50 mt-3 text-center text-xs">
        Wherever your guests are, your page shows slots in their own time zone.
      </p>
    </div>
  );
}
