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
 * Alphanumerics only, separators removed: "1UZ-FE", "1UZ FE" and "1uzfe" all
 * collapse to "1uzfe".
 *
 * normalizeText turns separators into spaces, which is right for prose but
 * loses engine and part codes: a customer typing "1uzfe" produced one token
 * that matched neither "1uz" nor "fe", and the search returned nothing at all
 * for a product sitting in the catalog.
 */
export function squash(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
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

/**
 * Candidate singular forms for a token, most specific first. Deliberately
 * limited to regular endings: "canopies" -> "canopy", "brakes" -> "brake".
 * Anything cleverer risks folding real, distinct catalog terms together.
 */
function depluralize(token: string): string[] {
  const forms: string[] = [];
  if (token.length > 4 && token.endsWith("ies")) forms.push(`${token.slice(0, -3)}y`);
  if (token.length > 4 && token.endsWith("es")) forms.push(token.slice(0, -2));
  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss")) {
    forms.push(token.slice(0, -1));
  }
  return forms;
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

    /*
     * Plurals, before edit distance. "canopies" -> "canopy" is three edits,
     * outside the budget for a word that length, so the search previously
     * never reached the products actually called "Canopy". These are the
     * regular English endings only -- no stemmer, nothing that would fold
     * distinct catalog terms into each other.
     */
    for (const singular of depluralize(token)) {
      if (vocabulary.words.has(singular)) {
        corrected = true;
        return singular;
      }
    }

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

export type PreparedProduct = {
  product: SearchableProduct;
  fields: { key: FieldKey; text: string; words: string[] }[];
  normalizedName: string;
  nameWords: string[];
  nameWordSet: Set<string>;
  /** Name with every separator removed, for concatenated code searches. */
  squashedName: string;
  /** Part number and platform, squashed, for exact identifier hits. */
  squashedIds: string[];
  normalizedPartNumber: string;
};

export function prepare(
  product: SearchableProduct,
  getBrandName: (slug: string) => string,
  getCategoryName: (slug: string) => string
): PreparedProduct {
  const make = (key: FieldKey, raw: string) => {
    const text = normalizeText(raw);
    return { key, text, words: text ? text.split(" ") : [] };
  };

  const normalizedName = normalizeText(product.name);
  const nameWords = normalizedName ? normalizedName.split(" ") : [];

  return {
    product,
    normalizedName,
    nameWords,
    nameWordSet: new Set(nameWords),
    squashedName: squash(product.name),
    squashedIds: [product.partNumber ?? "", product.platform ?? ""]
      .map(squash)
      .filter(Boolean),
    normalizedPartNumber: normalizeText(product.partNumber ?? ""),
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

/**
 * Prepared-product cache, keyed by product id.
 *
 * prepare() normalizes every searchable field including the description, which
 * is the longest text on a product. Doing that for ~1,800 products on every
 * request was the bulk of search time, and the result never changes: the
 * catalog is a bundled array built once at module load (see
 * lib/inventory/products.ts), so the prepared form is stable for the life of
 * the isolate. Callers pass one in; it fills lazily on first use.
 */
export type SearchIndex = Map<number, PreparedProduct>;

export function createSearchIndex(): SearchIndex {
  return new Map();
}

function getPrepared(
  product: SearchableProduct,
  getBrandName: (slug: string) => string,
  getCategoryName: (slug: string) => string,
  index?: SearchIndex
): PreparedProduct {
  if (!index) return prepare(product, getBrandName, getCategoryName);

  const cached = index.get(product.id);
  if (cached) return cached;

  const prepared = prepare(product, getBrandName, getCategoryName);
  index.set(product.id, prepared);
  return prepared;
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
    index?: SearchIndex;
  }
): SearchResult<T> {
  const { getBrandName, getCategoryName } = options;
  const queryTokens = tokenize(rawQuery);
  if (queryTokens.length === 0) return { items, correctedQuery: null };

  const vocabulary =
    options.vocabulary ?? buildVocabulary(items, getBrandName, getCategoryName);
  const { tokens, corrected } = correctTokens(queryTokens, vocabulary);
  const phrase = tokens.join(" ");

  const squashedPhrase = squash(phrase);

  /*
   * Singular/plural variants, computed once per query rather than per product.
   *
   * Correction cannot handle this case: the Canopies category is named in the
   * plural, so "canopies" is a genuine catalog word and is never rewritten --
   * yet products are titled "Canopy". Matching each token against its singular
   * form too makes the two directions symmetric.
   */
  const tokenVariants = tokens.map((token) => [token, ...depluralize(token)]);

  /*
   * Two passes. The first requires every token to match, which is what keeps
   * results precise. If that finds nothing, a second pass accepts products
   * matching most of the query instead of showing an empty page.
   *
   * A verbose query -- "BMW N54 Twin Turbo Engine complete swap package with
   * transmission" -- previously returned zero results, because no single
   * product contained every word. Falling back only when the strict pass is
   * empty means precision is never traded away while good matches exist.
   */
  const strict = rank(tokens.length);
  const scored =
    strict.length > 0
      ? strict
      : /*
         * A low bar deliberately. A verbose query is mostly filler around a
         * few meaningful terms, and the product actually being described often
         * matches fewer tokens than a rambling listing whose description
         * happens to contain more of the words. Requiring a majority excluded
         * the right answer; ranking sorts it out from here.
         */
        rank(Math.max(1, Math.ceil(tokens.length * 0.4)));

  function rank(minTokens: number) {
    const out: { item: T; score: number; nameLength: number }[] = [];

  for (const item of items) {
    const prepared = getPrepared(item, getBrandName, getCategoryName, options.index);

    let total = 0;
    let matchedTokens = 0;
    let strongMatchedTokens = 0;
    let nameMatchedTokens = 0;

    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      let bestForToken = 0;
      let bestField: FieldKey | null = null;
      for (const field of prepared.fields) {
        for (const variant of tokenVariants[i]) {
          const score = scoreTokenAgainstField(
            variant,
            field.words,
            field.text,
            field.key
          );
          if (score > bestForToken) {
            bestForToken = score;
            bestField = field.key;
          }
        }
      }

      // Separator-insensitive fallback, so "1uzfe" still finds a product whose
      // name normalizes to "1uz fe". Only consulted when the ordinary fields
      // found nothing, so it can never inflate an already-good match.
      if (bestForToken === 0) {
        if (prepared.squashedIds.some((id) => id.includes(token))) {
          bestForToken = FIELD_WEIGHTS.partNumber.whole;
        } else if (prepared.squashedName.includes(token)) {
          bestForToken = FIELD_WEIGHTS.name.substring;
        }
      }

      if (bestForToken === 0) continue;
      matchedTokens += 1;

      /*
       * Coverage is counted by WHERE each token matched, not just how many
       * matched. A token found in the title is evidence the product is what
       * was asked for; the same token found in fitment or prose is much
       * weaker. Counting them equally ranked a drivetrain whose fitment text
       * happened to contain more of the query above the engine the query
       * actually named.
       */
      if (bestField === "name") nameMatchedTokens += 1;
      else if (bestField !== "description" && bestField !== "misc") {
        strongMatchedTokens += 1;
      }

      total += bestForToken;
    }

    if (matchedTokens < minTokens) continue;

    /*
     * In the relaxed pass, a product matching more of the query outranks one
     * matching less -- the gap dwarfs any field-level scoring, so partial
     * results stay ordered by how much of the query they actually satisfied.
     */
    if (minTokens < tokens.length) {
      total += nameMatchedTokens * 700 + strongMatchedTokens * 150;
    }

    /*
     * Phrase tiers. Highest applicable tier only -- these are alternatives,
     * not cumulative, and each is far larger than any token total (a five word
     * query tops out around 500) so a title match always beats a scattering of
     * matches in prose.
     *
     * "starts with" was missing entirely, and it is the tier that decides most
     * real searches: "Ford Ranger" has to put "Ford Ranger Off-Road Body Kit"
     * above "Method Race Wheels MR301 - Toyota Hilux / Ford Ranger", which
     * merely mentions the truck as a fitment aside.
     */
    if (prepared.normalizedName === phrase) total += 4000;
    else if (prepared.normalizedName.startsWith(`${phrase} `)) {
      /*
       * Starting with the query is strong evidence the customer named the
       * product -- but only for a multi-word query. For a single generic term
       * it means very little: "Turbo Cam Shirt" starts with "turbo" and was
       * beating actual turbochargers for that search. One word at the front of
       * a title is a weak claim; two or more is a deliberate one.
       */
      total += tokens.length > 1 ? 2400 : 1600;
    } else if (prepared.normalizedName.includes(phrase)) total += 1400;
    else if (tokens.every((token) => prepared.nameWordSet.has(token))) total += 700;
    else if (
      tokens.every((token) =>
        prepared.nameWords.some((word) => word.startsWith(token))
      )
    ) {
      total += 350;
    } else if (squashedPhrase && prepared.squashedName.includes(squashedPhrase)) {
      total += 300;
    }

    /*
     * Centrality: how much of the title the query actually accounts for.
     *
     * Without this, every product containing the query words anywhere in its
     * name scored identically and the tie fell to catalog order -- which is
     * why a wheel set outranked the engine for "N54". A title that is mostly
     * the query is more likely to be what was wanted than one where the query
     * is a parenthetical.
     */
    const nameWordCount = prepared.nameWords.length || 1;
    const matchedNameWords = prepared.nameWords.filter((word) =>
      tokens.some((token) => word === token || word.startsWith(token))
    ).length;
    total += Math.round(600 * (matchedNameWords / nameWordCount));

    /*
     * Category alignment: the query names a kind of product, and this product
     * is that kind. Searching "turbo" should surface things in the
     * turbocharger category above a T-shirt that merely starts with the word.
     *
     * This is a structural signal, not a synonym table -- it only fires when
     * a query token genuinely matches the product's own category, so queries
     * like "Ford Ranger" or "N54" are unaffected either way.
     */
    const categoryField = prepared.fields.find((field) => field.key === "category");
    if (
      categoryField &&
      tokens.some(
        (token) =>
          categoryField.words.includes(token) ||
          categoryField.words.some((word) => word.startsWith(token))
      )
    ) {
      total += 600;
    }

    // An exact identifier hit is unambiguous: the customer typed a part
    // number, and nothing else in the catalogue is a better answer.
    if (
      prepared.normalizedPartNumber &&
      (prepared.normalizedPartNumber === phrase ||
        (squashedPhrase && squash(prepared.normalizedPartNumber) === squashedPhrase))
    ) {
      total += 5000;
    }

    out.push({ item, score: total, nameLength: prepared.normalizedName.length });
  }

  /*
   * Deterministic ordering. Equal scores previously resolved to whatever order
   * the catalog happened to be in, so results shifted for no visible reason.
   * Shorter titles win ties: at equal relevance the more specific listing is
   * the less padded one.
   */
  out.sort(
    (a, b) =>
      b.score - a.score ||
      a.nameLength - b.nameLength ||
      a.item.id - b.item.id
  );

    return out;
  }

  return {
    items: scored.map((entry) => entry.item),
    correctedQuery: corrected ? phrase : null,
  };
}
