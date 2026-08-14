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

/** First meaningful paragraph from a product description block. */
export function productSeoDescription(description: string, fallback: string): string {
  const paragraphs = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const body =
    paragraphs.slice(1).find((line) => line.length > 50) ??
    paragraphs[0] ??
    fallback;

  return truncateSeoDescription(body);
}
