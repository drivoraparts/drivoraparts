/* =========================================================
   DRIVORAPARTS — CATALOG SEARCH
   ---------------------------------------------------------
   Ranked, typo-tolerant product search over the static
   catalog. Zero dependencies: the catalog is a bundled array
   (see lib/inventory/products.ts), so an external search
   service would add cost and a failure mode for no benefit
   at this size.

   Only fields that genuinely exist on Product are searched --
   there is no SKU/tags/year column in the schema, so none is
   invented here.
========================================================= */

export type SearchableProduct = {
  id: number;
  name: string;
  category: string;
  brand: string;
  description?: string;
  fitment?: string;
  partNumber?: string;
  platform?: string;
  horsepower?: string;
  drivetrain?: string;
};

/** Lowercase, strip punctuation to spaces, collapse whitespace. Keeps
 * alphanumerics so part numbers like "N54" / "ZF 8HP70" survive intact, and
 * makes "Twin-Turbo" and "Twin Turbo" normalize to the same thing. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function tokenize(value: string): string[] {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(" ") : [];
}

/**
 * Damerau-Levenshtein (optimal string alignment) distance, abandoned as soon
 * as it provably exceeds `max`. Counting a swap of two adjacent letters as a
 * single edit is the whole point: transpositions are the most common typo
 * ("trubo" for "turbo", "brkae" for "brake"), and plain Levenshtein scores
 * them as two edits, which puts them outside the budget for short words.
 * Bounding keeps correction cheap across a few thousand vocabulary words --
 * we only care whether something is "close", never how far.
 */
function boundedEditDistance(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  const n = b.length;
  let prevPrev: number[] = new Array<number>(n + 1).fill(0);
  let prev: number[] = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const curr = new Array<number>(n + 1);
    curr[0] = i;
    let rowBest = curr[0];

    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);

      // Adjacent transposition, e.g. "ur" <-> "ru".
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, prevPrev[j - 2] + 1);
      }

      curr[j] = value;
      if (value < rowBest) rowBest = value;
    }

    if (rowBest > max) return max + 1;
    prevPrev = prev;
    prev = curr;
  }

  return prev[n];
}

/** Short words tolerate fewer edits, so "bmw" can't collapse into "bms". */
function maxEditsFor(token: string): number {
  if (token.length <= 3) return 0;
  if (token.length <= 6) return 1;
  return 2;
}

export type SearchVocabulary = {
  words: Set<string>;
  list: string[];
};

/** Every distinct word across the searchable fields, used to decide whether a
 * query token is a real catalog term or a typo worth correcting. */
export function buildVocabulary(
  items: SearchableProduct[],
  getBrandName: (slug: string) => string,
  getCategoryName: (slug: string) => string
): SearchVocabulary {
  const words = new Set<string>();

  for (const product of items) {
    const sources = [
      product.name,
      product.fitment ?? "",
      product.partNumber ?? "",
      product.platform ?? "",
      getBrandName(product.brand),
      product.brand,
      getCategoryName(product.category),
      product.category,
    ];
    for (const source of sources) {
      for (const word of tokenize(source)) words.add(word);
    }
  }

  return { words, list: [...words] };
}

/**
 * Replaces query tokens that don't appear anywhere in the catalog with their
 * closest real term ("trubo" -> "turbo"). A token is left alone if it's a
 * prefix of any known word, so partial searches ("trans", "trub") still work
 * as prefixes rather than being "corrected" into something else.
 */
export function correctTokens(
  tokens: string[],
  vocabulary: SearchVocabulary
): { tokens: string[]; corrected: boolean } {
  let corrected = false;

  const result = tokens.map((token) => {
    if (vocabulary.words.has(token)) return token;
    // Prefix of a real term -> a partial search, not a typo.
    if (vocabulary.list.some((word) => word.startsWith(token))) return token;

    const maxEdits = maxEditsFor(token);
    if (maxEdits === 0) return token;

    let best: string | null = null;
    let bestDistance = maxEdits + 1;

    for (const word of vocabulary.list) {
      if (Math.abs(word.length - token.length) > maxEdits) continue;
      const distance = boundedEditDistance(token, word, maxEdits);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = word;
        if (distance === 1) break;
      }
    }

    if (best && bestDistance <= maxEdits) {
      corrected = true;
      return best;
    }
    return token;
  });

  return { tokens: result, corrected };
}

/** Field weights. Name beats brand/category, which beat free-text description,
 * so "BMW N54 Twin Turbo Engine" ranks the actual product above anything that
 * merely mentions BMW in prose. */
const FIELD_WEIGHTS = {
  name: { whole: 100, prefix: 80, substring: 60 },
  partNumber: { whole: 75, prefix: 60, substring: 45 },
  brand: { whole: 60, prefix: 48, substring: 36 },
  category: { whole: 52, prefix: 42, substring: 30 },
  fitment: { whole: 48, prefix: 38, substring: 28 },
  platform: { whole: 45, prefix: 36, substring: 26 },
  description: { whole: 20, prefix: 14, substring: 10 },
  misc: { whole: 18, prefix: 12, substring: 8 },
} as const;

type FieldKey = keyof typeof FIELD_WEIGHTS;

function scoreTokenAgainstField(
  token: string,
  fieldWords: string[],
  fieldText: string,
  field: FieldKey
): number {
  const weights = FIELD_WEIGHTS[field];
  if (fieldWords.includes(token)) return weights.whole;
  if (fieldWords.some((word) => word.startsWith(token))) return weights.prefix;
  if (fieldText.includes(token)) return weights.substring;
  return 0;
}

type PreparedProduct = {
  product: SearchableProduct;
  fields: { key: FieldKey; text: string; words: string[] }[];
  normalizedName: string;
  nameWords: string[];
};

function prepare(
  product: SearchableProduct,
  getBrandName: (slug: string) => string,
  getCategoryName: (slug: string) => string
): PreparedProduct {
  const make = (key: FieldKey, raw: string) => {
    const text = normalizeText(raw);
    return { key, text, words: text ? text.split(" ") : [] };
  };

  const normalizedName = normalizeText(product.name);

  return {
    product,
    normalizedName,
    nameWords: normalizedName ? normalizedName.split(" ") : [],
    fields: [
      make("name", product.name),
      make("partNumber", product.partNumber ?? ""),
      make("brand", `${getBrandName(product.brand)} ${product.brand}`),
      make("category", `${getCategoryName(product.category)} ${product.category}`),
      make("fitment", product.fitment ?? ""),
      make("platform", product.platform ?? ""),
      make("description", product.description ?? ""),
      make(
        "misc",
        `${product.horsepower ?? ""} ${product.drivetrain ?? ""}`
      ),
    ].filter((field) => field.text.length > 0),
  };
}

export type SearchResult<T> = {
  items: T[];
  /** Set only when typo correction changed the query, for "Showing results
   * for X" in the UI. Null when the query was used as typed. */
  correctedQuery: string | null;
};

/**
 * Ranked search. Every token must match somewhere (AND across tokens, OR
 * across fields) so results stay precise; ranking then orders them by where
 * and how well they matched.
 */
export function searchProducts<T extends SearchableProduct>(
  items: T[],
  rawQuery: string,
  options: {
    getBrandName: (slug: string) => string;
    getCategoryName: (slug: string) => string;
    vocabulary?: SearchVocabulary;
  }
): SearchResult<T> {
  const { getBrandName, getCategoryName } = options;
  const queryTokens = tokenize(rawQuery);
  if (queryTokens.length === 0) return { items, correctedQuery: null };

  const vocabulary =
    options.vocabulary ?? buildVocabulary(items, getBrandName, getCategoryName);
  const { tokens, corrected } = correctTokens(queryTokens, vocabulary);
  const phrase = tokens.join(" ");

  const scored: { item: T; score: number }[] = [];

  for (const item of items) {
    const prepared = prepare(item, getBrandName, getCategoryName);

    let total = 0;
    let matchedEveryToken = true;

    for (const token of tokens) {
      let bestForToken = 0;
      for (const field of prepared.fields) {
        const score = scoreTokenAgainstField(
          token,
          field.words,
          field.text,
          field.key
        );
        if (score > bestForToken) bestForToken = score;
      }
      if (bestForToken === 0) {
        matchedEveryToken = false;
        break;
      }
      total += bestForToken;
    }

    if (!matchedEveryToken) continue;

    // Phrase-level bonuses: an exact product-name match must outrank a
    // product that merely contains all the same words scattered about.
    if (prepared.normalizedName === phrase) total += 2000;
    else if (prepared.normalizedName.includes(phrase)) total += 800;
    else if (tokens.every((token) => prepared.nameWords.includes(token))) total += 250;

    scored.push({ item, score: total });
  }

  scored.sort((a, b) => b.score - a.score);

  return {
    items: scored.map((entry) => entry.item),
    correctedQuery: corrected ? phrase : null,
  };
}
