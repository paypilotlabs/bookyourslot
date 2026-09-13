/** Full NANP national number: two different real numbers cannot share all ten. */
const SIGNIFICANT_DIGITS = 10;

/**
 * Reduces a phone number to the digits a human dialled, so "+1 (313) 555-1212",
 * "13135551212" and "313.555.1212" compare equal. Stored numbers are never
 * normalised on write: attendeePhoneNumber is a hidden booking field and
 * superRefineField skips validation for hidden fields, so this is the only
 * normalisation in the system.
 *
 * Returns null when there are too few digits to identify anyone. This value is
 * half of an authentication decision, so a short or junk string must never match.
 *
 * ponytail: last-10 is NANP-only. A non-NANP client needs parsePhoneNumber with a
 * default country and full E.164 equality.
 */
export function significantDigits(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length < SIGNIFICANT_DIGITS) return null;
  return digits.slice(-SIGNIFICANT_DIGITS);
}
