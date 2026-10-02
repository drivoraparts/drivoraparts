/**
 * Listing facts such as location and condition are intentionally unknown for
 * some products (held pending business confirmation). Generated copy must omit
 * the phrase that depends on them rather than print "undefined".
 */
export function knownText(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return /^(undefined|null)$/i.test(trimmed) ? "" : trimmed;
}

/** `${prefix}${value}${suffix}` when the value is known, otherwise an empty string. */
export function withKnown(value: unknown, prefix = "", suffix = ""): string {
  const text = knownText(value);
  return text ? `${prefix}${text}${suffix}` : "";
}
