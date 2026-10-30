/** Flatten whitespace and trim for meta descriptions. */
export function normalizeSeoText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Safe meta description length for Google SERP snippets. */
export function truncateSeoDescription(text: string, max = 160): string {
  const flat = normalizeSeoText(text);
  if (flat.length <= max) return flat;

  const trimmed = flat.slice(0, max - 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${(lastSpace > 80 ? trimmed.slice(0, lastSpace) : trimmed).trim()}…`;
}

/**
 * Trim a title to `max`, breaking on a word boundary rather than mid-word.
 * Falls back to a hard cut when there's no sensible space to break on.
 */
export function truncateSeoTitle(text: string, max: number): string {
  const flat = normalizeSeoText(text);
  if (flat.length <= max) return flat;

  const trimmed = flat.slice(0, max - 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? trimmed.slice(0, lastSpace) : trimmed;
  return `${cut.replace(/[\s—–,-]+$/, "")}…`;
}

/**
 * Store boilerplate that says nothing about the part: the "Shipping" and
 * "Warranty" section labels, and the old "Worldwide shipping available --
 * freight quotes provided" line, which contradicts the published fixed
 * shipping rates. On many imported listings it is the ONLY text, so without
 * this it became the whole product description in the feeds.
 */
const NON_DESCRIPTIVE_LINE =
  /^(warranty|shipping)$|worldwide shipping available|freight quotes? provided|contact for a freight quote/i;

export function isStaleShippingText(text: string): boolean {
  return NON_DESCRIPTIVE_LINE.test(text.trim());
}

/**
 * First meaningful paragraph from a product description block. Boilerplate
 * lines are skipped, and a first line that only repeats the product name is
 * not a description, so `fallback` is used instead.
 */
export function productSeoDescription(
  description: string,
  fallback: string,
  name?: string
): string {
  const paragraphs = description
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !NON_DESCRIPTIVE_LINE.test(line));

  const first =
    paragraphs[0] && paragraphs[0] !== name?.trim() ? paragraphs[0] : undefined;
  const body = paragraphs.slice(1).find((line) => line.length > 50) ?? first ?? fallback;

  return truncateSeoDescription(body);
}
