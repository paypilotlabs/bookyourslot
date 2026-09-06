const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

export type ReminderWindowKey = "48h" | "24h" | "30m";

type ReminderWindowSpec = {
  /** Remind when the booking starts no more than this far ahead. */
  leadMs: number;
  /** And no sooner than this. Whatever is nearer belongs to the next window along. */
  floorMs: number;
  /** Skip bookings younger than this: a reminder that close to the confirmation reads as a duplicate. */
  minAgeMs: number;
  /** Booking.metadata key recording that this window has already fired. */
  marker: string;
  /** How often the external scheduler must call this window for the band not to be stepped over. */
  callEvery: string;
};

/**
 * Three bands, each owning a slice of the runway, so one booking collects one
 * reminder per band rather than three copies of the same one.
 *
 * Each band is bounded below by the next band's ceiling. That matters more than it
 * looks: overlapping bands would mean a booking 20 minutes out still matched the
 * 24h band, and the marker would not save us because the markers are per band.
 *
 * A band plus a per-booking marker is self-healing. A skipped run is picked up by
 * the next one while the booking is still inside the band, and a booking that
 * misses its band entirely (a long outage, or one made after the band had passed)
 * simply falls through to the next band down rather than being lost. The narrow
 * 30m band is the one exception, which is why it wants a ten minute cadence.
 */
export const REMINDER_WINDOWS: Record<ReminderWindowKey, ReminderWindowSpec> = {
  "48h": {
    leadMs: 48 * HOUR_MS,
    floorMs: 24 * HOUR_MS,
    minAgeMs: 2 * HOUR_MS,
    marker: "reminderSentAt48h",
    callEvery: "hourly",
  },
  "24h": {
    leadMs: 24 * HOUR_MS,
    floorMs: 30 * MINUTE_MS,
    minAgeMs: 2 * HOUR_MS,
    // Deliberately the original key from when this route sent a single reminder.
    // Bookings already reminded under that version must not be reminded again.
    marker: "reminderSentAt",
    callEvery: "hourly",
  },
  "30m": {
    leadMs: 30 * MINUTE_MS,
    floorMs: 0,
    // Shorter than the others on purpose. Two hours would mean anyone booking
    // inside two hours of their appointment never gets the reminder that matters
    // most, but somebody who booked eight minutes ago does not need reminding.
    minAgeMs: 30 * MINUTE_MS,
    marker: "reminderSentAt30m",
    callEvery: "every 10 minutes",
  },
};

export const DEFAULT_REMINDER_WINDOW: ReminderWindowKey = "24h";

export function isReminderWindowKey(value: unknown): value is ReminderWindowKey {
  return typeof value === "string" && value in REMINDER_WINDOWS;
}

/** The Prisma `where` fragment selecting this window's candidates on this run. */
export function reminderWindow(now: Date, key: ReminderWindowKey = DEFAULT_REMINDER_WINDOW) {
  const spec = REMINDER_WINDOWS[key];
  return {
    startTime: {
      gt: new Date(now.getTime() + spec.floorMs),
      lte: new Date(now.getTime() + spec.leadMs),
    },
    createdAt: { lte: new Date(now.getTime() - spec.minAgeMs) },
  };
}
