import { products } from "@/lib/inventory/products";
import type { Product } from "@/lib/inventory/types";

/**
 * Pulls the concrete things a question is *about* — a product, an order, a
 * customer — out of free text.
 *
 * The intent classifier only ever decided which broad topic a question fell
 * under, so "how is the BMW N54 doing?" and "how are products doing?" produced
 * the same canned answer. Recognising the subject is what lets the engine
 * answer the question that was actually asked.
 */

/** Order numbers are minted as DRV- plus 7 chars from a 0/O/1/I-free alphabet. */
const ORDER_NUMBER_PATTERN = /\bDRV-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{7}\b/i;
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/;

/** Question scaffolding that would otherwise score as catalog vocabulary. */
const STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "how", "what", "much", "many", "are",
  "is", "was", "does", "did", "do", "my", "our", "this", "that", "it", "of",
  "on", "in", "to", "me", "you", "should", "can", "any", "all", "get", "got",
  "show", "tell", "about", "doing", "well", "worth", "have", "has",

  /*
   * Words the owner uses to ask about the business. These are rare inside
   * product names, so rarity weighting rates them as highly distinctive and
   * they match a listing by coincidence — "how many SKUs are out of stock?"
   * matched an A-arm listing whose name contains "For Stock Shocks". Excluding
   * them means an aggregate question matches no product and falls through to
   * the handler that can actually count.
   */
  "stock", "stocked", "inventory", "sku", "skus", "unit", "units",
  "order", "orders", "ordered", "sale", "sales", "sold", "sell", "selling",
  "revenue", "profit", "margin", "price", "prices", "priced", "pricing",
  "cost", "costs", "payment", "payments", "paid", "refund", "refunds",
  "customer", "customers", "buyer", "buyers", "product", "products",
  "listing", "listings", "item", "items", "cart", "carts", "checkout",
  "views", "view", "traffic", "visitors", "conversion", "average", "total",
  "today", "yesterday", "week", "month", "year", "best", "worst", "top",
  "restock", "shipping", "shipment", "tracking", "dashboard", "store",

  /* Quantity words — "out" alone matched a muffler named 'Dual 3" out'. */
  "out", "low", "high", "left", "remaining", "count", "number", "amount",
  "level", "levels", "each", "per", "over", "under", "above", "below",
]);

type IndexedProduct = {
  product: Product;
  tokens: Set<string>;
  /** Summed weight of every token, so a match can be judged as a share of it. */
  totalWeight: number;
};

type ProductIndex = {
  entries: IndexedProduct[];
  /** log(N / documentFrequency) — rare words carry the signal, "engine" doesn't. */
  weights: Map<string, number>;
  /** Weight of a token unique to one or two listings, e.g. "godzilla". */
  uniqueWeight: number;
};

let cachedIndex: ProductIndex | null = null;

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token));
}

/**
 * Built once per process. The catalog is a static import, so this is pure
 * in-memory work — no query, and nothing to invalidate.
 */
function getProductIndex(): ProductIndex {
  if (cachedIndex) return cachedIndex;

  const entries: IndexedProduct[] = [];
  const documentFrequency = new Map<string, number>();

  for (const product of products) {
    const tokens = new Set(
      tokenize(`${product.name} ${product.brand} ${product.partNumber ?? ""}`)
    );
    if (!tokens.size) continue;

    entries.push({ product, tokens, totalWeight: 0 });
    for (const token of tokens) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }

  const total = entries.length || 1;
  const weights = new Map<string, number>();
  for (const [token, frequency] of documentFrequency) {
    weights.set(token, Math.log(total / frequency));
  }

  for (const entry of entries) {
    let sum = 0;
    for (const token of entry.tokens) sum += weights.get(token) ?? 0;
    entry.totalWeight = sum || 1;
  }

  cachedIndex = { entries, weights, uniqueWeight: Math.log(total / 2) };
  return cachedIndex;
}

/**
 * How much of a listing's identifying vocabulary the question has to account
 * for. Rarity alone is not enough: ordinary English that happens to be rare in
 * a parts catalog scores as highly distinctive, so "Which pages are most
 * active?" matched a wheel cap named "…- Most 1992-2016 Models" on the word
 * "most". Requiring the match to cover a real share of the name is what
 * separates naming a product from sharing a word with one.
 */
const MIN_COVERAGE = 0.4;
const MIN_MATCH_SCORE = Math.log(60);

export type ProductMatch = { product: Product; score: number };

/**
 * Finds the catalog product a question refers to, or null when it names none.
 *
 * Scoring is weighted by how rare each shared word is across the catalog, so
 * "N54" or "Godzilla" identifies a listing while "engine" or "kit" — which
 * thousands of listings share — cannot. Requiring one genuinely distinctive
 * word means a generic question matches nothing rather than matching whatever
 * scored highest by accident.
 */
export function findMentionedProduct(message: string): ProductMatch | null {
  const asked = new Set(tokenize(message));
  if (!asked.size) return null;

  const { entries, weights, uniqueWeight } = getProductIndex();
  let best: ProductMatch | null = null;

  for (const entry of entries) {
    let score = 0;
    let bestTokenWeight = 0;
    let bestToken = "";
    let matched = 0;

    for (const token of entry.tokens) {
      if (!asked.has(token)) continue;
      const weight = weights.get(token) ?? 0;
      score += weight;
      matched += 1;
      if (weight > bestTokenWeight) {
        bestTokenWeight = weight;
        bestToken = token;
      }
    }

    if (!matched) continue;
    if (score < MIN_MATCH_SCORE) continue;

    /*
     * A name or part number belonging to one or two listings identifies it
     * outright — "godzilla" or "4L60E" needs no other word to be unambiguous.
     * The length and digit test is what keeps ordinary English off this path:
     * "most" is just as rare in the catalog as "godzilla", but a four-letter
     * word in a question is far likelier to be grammar than a model name.
     */
    const namedOutright =
      bestTokenWeight >= uniqueWeight && (bestToken.length >= 7 || /\d/.test(bestToken));

    if (!namedOutright && score / entry.totalWeight < MIN_COVERAGE) continue;

    if (!best || score > best.score) best = { product: entry.product, score };
  }

  return best;
}

export function extractOrderNumber(message: string): string | null {
  const match = message.match(ORDER_NUMBER_PATTERN);
  return match ? match[0].toUpperCase() : null;
}

export function extractEmail(message: string): string | null {
  const match = message.match(EMAIL_PATTERN);
  return match ? match[0].toLowerCase() : null;
}
