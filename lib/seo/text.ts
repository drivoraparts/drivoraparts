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
