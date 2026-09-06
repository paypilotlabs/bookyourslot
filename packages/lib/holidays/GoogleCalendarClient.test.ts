import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleCalendarClient } from "./GoogleCalendarClient";

// vitest.config.mts loads .env into process.env, so the key has to be stubbed rather
// than assumed absent.
describe("GoogleCalendarClient without an API key", () => {
  beforeEach(() => {
    vi.stubEnv("GOOGLE_CALENDAR_API_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not throw on construction", () => {
    expect(() => new GoogleCalendarClient()).not.toThrow();
  });

  it("rejects at fetch time instead", async () => {
    // Must reject rather than resolve to []: refreshCache deletes the cached rows for a
    // country before writing the new ones, so an empty result would wipe good holidays
    // the moment the key went missing.
    await expect(new GoogleCalendarClient().fetchHolidays("US", 2026)).rejects.toThrow(
      "GOOGLE_CALENDAR_API_KEY"
    );
  });
});
