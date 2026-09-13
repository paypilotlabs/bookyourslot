import { describe, expect, it } from "vitest";
import { significantDigits } from "./phone";

describe("significantDigits", () => {
  it("treats every way of writing one number as the same number", () => {
    for (const written of [
      "+13135551212",
      "1-313-555-1212",
      "(313) 555-1212",
      "313.555.1212",
      " +1 313 555 1212 ",
    ]) {
      expect(significantDigits(written)).toBe("3135551212");
    }
  });

  it("does not collide numbers that share the last seven digits", () => {
    expect(significantDigits("+13135551212")).not.toBe(significantDigits("+12485551212"));
  });

  it("refuses anything too short to identify a caller", () => {
    expect(significantDigits("5551212")).toBeNull();
    expect(significantDigits("")).toBeNull();
    expect(significantDigits(null)).toBeNull();
    // The stored value is unvalidated free text; it must not accidentally match.
    expect(significantDigits("see notes")).toBeNull();
  });
});
