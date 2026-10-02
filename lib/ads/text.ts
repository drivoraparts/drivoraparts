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

/** "4.8★" for a real rating, otherwise "" (never "undefined★" or "NaN★"). */
export function ratingText(rating: unknown): string {
  return typeof rating === "number" && Number.isFinite(rating) ? `${rating}★` : "";
}

/** "12+ reviews" for a real count, otherwise "" (never "undefined+ reviews"). */
export function reviewsText(count: unknown): string {
  return typeof count === "number" && Number.isFinite(count) ? `${count}+ reviews` : "";
}

/** Joins the non-empty parts with a separator. */
export function joinKnown(parts: string[], separator = " · "): string {
  return parts.filter(Boolean).join(separator);
}
