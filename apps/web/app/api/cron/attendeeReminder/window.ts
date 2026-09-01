export const REMINDER_HOURS = 24;
const HOUR_MS = 3_600_000;

/**
 * Which bookings are candidates for a reminder on this run.
 *
 * Deliberately a rolling one-sided window rather than a band around "24h from
 * now". A band only matches bookings that happen to pass through it while the
 * cron is running, so a single missed run silently drops every booking that
 * crossed it — the exact shape of silent failure this deployment has already
 * been bitten by. A ceiling plus a per-booking sent-marker is self-healing: a
 * run that was skipped is simply picked up by the next one.
 *
 * The createdAt floor stops us "reminding" someone about a booking they made
 * twenty minutes ago, which reads as a duplicate confirmation.
 */
export function reminderWindow(now: Date) {
  return {
    startTime: { gt: now, lte: new Date(now.getTime() + REMINDER_HOURS * HOUR_MS) },
    createdAt: { lte: new Date(now.getTime() - 2 * HOUR_MS) },
  };
}
