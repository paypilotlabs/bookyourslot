import { describe, expect, it } from "vitest";
import { REMINDER_HOURS, reminderWindow } from "./window";

describe("reminderWindow", () => {
  const now = new Date("2026-09-01T10:00:00.000Z");
  const w = reminderWindow(now);

  it("only looks forward, never at bookings already started", () => {
    expect(w.startTime.gt).toEqual(now);
  });

  it("reaches exactly REMINDER_HOURS ahead", () => {
    expect(w.startTime.lte).toEqual(new Date("2026-09-02T10:00:00.000Z"));
    expect(REMINDER_HOURS).toBe(24);
  });

  it("ignores bookings made in the last two hours, so a fresh booking is not 'reminded'", () => {
    expect(w.createdAt.lte).toEqual(new Date("2026-09-01T08:00:00.000Z"));
  });

  it("has a ceiling, so an outage cannot produce a burst of stale reminders", () => {
    const spanHours = (w.startTime.lte.getTime() - w.startTime.gt.getTime()) / 3_600_000;
    expect(spanHours).toBe(REMINDER_HOURS);
  });
});
