import { describe, expect, it } from "vitest";
import {
  DEFAULT_REMINDER_WINDOW,
  isReminderWindowKey,
  REMINDER_WINDOWS,
  type ReminderWindowKey,
  reminderWindow,
} from "./window";

const now = new Date("2026-09-01T10:00:00.000Z");
const at = (iso: string) => new Date(iso);

describe("reminderWindow", () => {
  it("puts each band where the name says it is", () => {
    expect(reminderWindow(now, "48h").startTime).toEqual({
      gt: at("2026-09-02T10:00:00.000Z"),
      lte: at("2026-09-03T10:00:00.000Z"),
    });
    expect(reminderWindow(now, "24h").startTime).toEqual({
      gt: at("2026-09-01T10:30:00.000Z"),
      lte: at("2026-09-02T10:00:00.000Z"),
    });
    expect(reminderWindow(now, "30m").startTime).toEqual({
      gt: now,
      lte: at("2026-09-01T10:30:00.000Z"),
    });
  });

  // The property the whole design rests on. Overlapping bands would hand one
  // booking the same reminder from two windows, and the markers cannot save us
  // because there is a separate marker per band.
  it("tiles the runway with no overlap and no gap", () => {
    const order: ReminderWindowKey[] = ["30m", "24h", "48h"];
    const bands = order.map((k) => reminderWindow(now, k).startTime);
    for (let i = 1; i < bands.length; i++) {
      expect(bands[i].gt).toEqual(bands[i - 1].lte);
    }
    expect(bands[0].gt).toEqual(now);
  });

  it("never looks at a booking that has already started", () => {
    for (const key of Object.keys(REMINDER_WINDOWS) as ReminderWindowKey[]) {
      expect(reminderWindow(now, key).startTime.gt.getTime()).toBeGreaterThanOrEqual(now.getTime());
    }
  });

  it("keeps the original marker for 24h, so anyone already reminded is not reminded twice", () => {
    expect(REMINDER_WINDOWS["24h"].marker).toBe("reminderSentAt");
    expect(DEFAULT_REMINDER_WINDOW).toBe("24h");
  });

  it("gives every band its own marker", () => {
    const markers = Object.values(REMINDER_WINDOWS).map((w) => w.marker);
    expect(new Set(markers).size).toBe(markers.length);
  });

  it("ignores bookings too fresh to need reminding, and lets the 30m band use a shorter floor", () => {
    expect(reminderWindow(now, "24h").createdAt.lte).toEqual(at("2026-09-01T08:00:00.000Z"));
    expect(reminderWindow(now, "48h").createdAt.lte).toEqual(at("2026-09-01T08:00:00.000Z"));
    // Two hours here would mean anyone booking inside two hours of their
    // appointment never gets the reminder that matters most.
    expect(reminderWindow(now, "30m").createdAt.lte).toEqual(at("2026-09-01T09:30:00.000Z"));
  });

  it("defaults to the 24h band when no window is given", () => {
    expect(reminderWindow(now)).toEqual(reminderWindow(now, "24h"));
  });

  it("only recognises the three real windows", () => {
    expect(isReminderWindowKey("48h")).toBe(true);
    expect(isReminderWindowKey("30min")).toBe(false);
    expect(isReminderWindowKey("")).toBe(false);
    expect(isReminderWindowKey(undefined)).toBe(false);
  });

  // A booking made a week out should collect all three, one per band, as it
  // travels down the runway. Walk it and check.
  it("gives a booking made seven days ahead exactly three reminders, one per band", () => {
    const start = at("2026-09-08T10:00:00.000Z");
    const createdAt = at("2026-09-01T10:00:00.000Z");
    const hits: ReminderWindowKey[] = [];

    // every 10 minutes for the full seven days
    for (let t = createdAt.getTime(); t < start.getTime(); t += 10 * 60_000) {
      const clock = new Date(t);
      for (const key of Object.keys(REMINDER_WINDOWS) as ReminderWindowKey[]) {
        if (hits.includes(key)) continue;
        const w = reminderWindow(clock, key);
        const inBand = start > w.startTime.gt && start <= w.startTime.lte;
        const oldEnough = createdAt <= w.createdAt.lte;
        if (inBand && oldEnough) hits.push(key);
      }
    }

    expect(hits).toEqual(["48h", "24h", "30m"]);
  });
});
