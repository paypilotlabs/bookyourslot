import type { CheckedSelectOption } from "@calcom/features/eventtypes/components/CheckedTeamSelect";
import { describe, expect, it } from "vitest";
import { toHosts } from "./EventTeamAssignmentTab";

const option = (over: Partial<CheckedSelectOption> = {}): CheckedSelectOption => ({
  avatar: "",
  label: "Alex",
  value: "7",
  groupId: null,
  ...over,
});

describe("toHosts", () => {
  // The trap. The server coerces isFixed for a collective event only when
  // schedulingType is dirty, which it is not when somebody merely adds a host. A
  // collective host stored with isFixed false is treated as a round-robin candidate,
  // so one person is picked instead of everyone attending.
  it("marks every collective host fixed, whatever the option said", () => {
    const hosts = toHosts([option({ isFixed: false }), option({ value: "8", isFixed: undefined })], true);
    expect(hosts.every((h) => h.isFixed)).toBe(true);
  });

  it("leaves round-robin hosts unfixed unless one was explicitly pinned", () => {
    const hosts = toHosts([option({ isFixed: false }), option({ value: "8", isFixed: true })], false);
    expect(hosts.map((h) => h.isFixed)).toEqual([false, true]);
  });

  it("defaults an unset isFixed to false for round robin, so the rotation actually rotates", () => {
    expect(toHosts([option()], false)[0].isFixed).toBe(false);
  });

  it("sends the server's own defaults explicitly rather than relying on which side fills them", () => {
    const [host] = toHosts([option()], false);
    expect(host.priority).toBe(2);
    expect(host.weight).toBe(100);
  });

  it("keeps priority and weight when the picker set them", () => {
    const [host] = toHosts([option({ priority: 4, weight: 250 })], false);
    expect({ priority: host.priority, weight: host.weight }).toEqual({ priority: 4, weight: 250 });
  });

  it("converts the option value to a numeric userId, since the form stores ids as numbers", () => {
    expect(toHosts([option({ value: "42" })], false)[0].userId).toBe(42);
  });
});
