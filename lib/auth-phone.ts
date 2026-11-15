/** Normalize phone to digits only (with optional leading country code). */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  // Senegal local 9 digits starting with 7 → prefix 221
  if (digits.length === 9 && digits.startsWith("7")) {
    return "221" + digits;
  }
  // Already with 221
  if (digits.length === 12 && digits.startsWith("221")) {
    return digits;
  }
  // France 10 digits starting with 0
  if (digits.length === 10 && digits.startsWith("0")) {
    return "33" + digits.slice(1);
  }
  return digits;
}

/** Synthetic email used by Supabase Auth (user never sees it). */
export function phoneToAuthEmail(phone: string): string {
  const n = normalizePhone(phone);
  return `${n}@phone.yobbugo.app`;
}

export function isValidPhone(input: string): boolean {
  const n = normalizePhone(input);
  return n.length >= 9 && n.length <= 15;
}
