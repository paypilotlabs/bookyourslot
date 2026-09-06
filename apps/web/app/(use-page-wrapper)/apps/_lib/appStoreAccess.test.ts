import { describe, expect, it } from "vitest";
import { CLIENT_BROWSABLE_CATEGORY, isClientBrowsableApp } from "./appStoreAccess";

describe("isClientBrowsableApp", () => {
  it("lets a client open the calendar apps, since only they can consent to Google", () => {
    expect(isClientBrowsableApp({ categories: ["calendar"] })).toBe(true);
    expect(isClientBrowsableApp({ variant: "calendar" })).toBe(true);
  });

  // The three that made hiding the store worth doing: Stripe advertises payments the
  // webhook cannot complete, the BAA card reads to a doctor as a compliance claim,
  // and WhatsApp reads as reminders when it only attaches a chat link.
  it("keeps a client out of the apps that would mislead them", () => {
    expect(isClientBrowsableApp({ categories: ["payment"], variant: "payment" })).toBe(false);
    expect(isClientBrowsableApp({ categories: ["other"], variant: "other" })).toBe(false);
    expect(isClientBrowsableApp({ categories: ["messaging", "conferencing"] })).toBe(false);
    expect(isClientBrowsableApp({ categories: ["automation"] })).toBe(false);
    expect(isClientBrowsableApp({ categories: ["analytics"] })).toBe(false);
  });

  it("is closed by default when an app has no category at all", () => {
    expect(isClientBrowsableApp({})).toBe(false);
    expect(isClientBrowsableApp(undefined)).toBe(false);
    expect(isClientBrowsableApp({ categories: [] })).toBe(false);
  });

  it("matches an app that lists calendar among several categories", () => {
    expect(isClientBrowsableApp({ categories: ["calendar", "other"] })).toBe(true);
    expect(CLIENT_BROWSABLE_CATEGORY).toBe("calendar");
  });
});
