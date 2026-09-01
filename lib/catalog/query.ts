import {
  getAllProducts,
  getBrandBySlug,
  getCategory,
  getProductThumbnail,
} from "@/lib/inventory";
import {
  matchesPriceFilter,
  type PriceFilterValue,
} from "@/lib/catalog/price-filters";
import {
  buildVocabulary,
  createSearchIndex,
  searchProducts,
  type SearchIndex,
  type SearchVocabulary,
} from "@/lib/catalog/search";

/**
 * The one catalog query.
 *
 * This was the body of app/api/catalog/products/route.ts, and it lived only
 * there -- which meant the only way to get products onto the catalog page was
 * for the browser to call that route after hydrating. The page therefore had
 * nothing to render on first paint, showed "Showing 0 of 0 products" (a claim
 * that is simply untrue of a 1,890-listing catalog) and, if that one request
 * ever hung, said "Loading products..." for good.
 *
 * Extracted here so the server component can run the identical query while
 * rendering and ship page one inside the HTML. The route now wraps this, so
 * there is still exactly one implementation of filtering, ranking and sorting
 * -- server-rendered page one and every later fetch cannot disagree.
 */

export const CATALOG_DEFAULT_LIMIT = 48;
const MAX_LIMIT = 96;
const NEW_BADGE_WINDOW_DAYS = 14;

const brandName = (slug: string) => getBrandBySlug(slug)?.name ?? slug;
const categoryName = (slug: string) => getCategory(slug)?.name ?? slug;

// The catalog is a static bundled array, so the typo-correction vocabulary is
// identical for every request -- build it once on first search rather than
// rescanning ~1,900 products each time.
let cachedVocabulary: SearchVocabulary | null = null;
function getVocabulary(): SearchVocabulary {
  if (!cachedVocabulary) {
    cachedVocabulary = buildVocabulary(getAllProducts(), brandName, categoryName);
  }
  return cachedVocabulary;
}

// Same reasoning for the prepared-field index: normalizing every product's
// description on each request was most of the search cost, and the catalog
// never changes within an isolate. Fills lazily as products are scored.
const searchIndex: SearchIndex = createSearchIndex();

export type CatalogQueryInput = {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  brand?: string;
  price?: string;
  sort?: string;
  /** "brand-new", "used", ... Matched case-insensitively against the listing. */
  condition?: string;
  /** "in-stock" hides listings not marked as stocked. Anything else is ignored. */
  availability?: string;
};

/**
 * Fitment text is a full sentence on the product page -- model years, body
 * codes, the phrases people search for. A card has room for a line. Cut on a
 * word boundary so the fragment still reads as English.
 */
function shortFitment(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 96) return clean;
  const cut = clean.slice(0, 96);
  const boundary = cut.lastIndexOf(" ");
  return (boundary > 40 ? cut.slice(0, boundary) : cut).trimEnd() + "…";
}

/**
 * Conditions are recorded free-hand, so the catalog holds "Used", "used",
 * "Used like new" and "used - inspected and tested" as separate strings. An
 * exact match would leave three listings unreachable by any filter and would
 * make "Used" quietly mean "the ones spelled exactly that way". Grouping is
 * not a claim about the goods -- each card still prints the condition the
 * listing actually recorded.
 */
export function conditionBucket(raw?: string): string {
  const value = (raw || "").trim().toLowerCase();
  if (!value) return "";
  if (value.includes("refurb")) return "refurbished";
  if (value.startsWith("used")) return "used";
  if (value.includes("brand-new") || value === "new") return "brand-new";
  return value;
}

/** The buckets offered as filter options, in the order they are shown. */
export const CONDITION_FILTERS = [
  { value: "brand-new", label: "Brand New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
] as const;

export type CatalogProductPayload = {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  thumbnail: string;
  images: string[];
  category: string;
  brand: string;
  isNew: boolean;
  /** Display name for the brand slug, so a card can print "Wilwood". */
  brandName: string;
  /**
   * The fields below are present only where the listing has them. Coverage
   * across the catalog is uneven and the cards render each one conditionally
   * rather than reserving space: partNumber ~11%, fitment ~35%, condition and
   * stock ~99%. A fixed row for a field nine in ten listings lack would be a
   * column of empty labels.
   */
  partNumber?: string;
  fitment?: string;
  condition?: string;
  inStock?: boolean;
};

export type CatalogQueryResult = {
  products: CatalogProductPayload[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  /** Set only when typo correction rewrote the query ("trubo" -> "turbo"). */
  correctedQuery: string | null;
  /** Query duration in ms, for the search-analytics event. */
  tookMs: number;
};

export function queryCatalog(input: CatalogQueryInput): CatalogQueryResult {
  // Measured in-process and returned for the client to report as an analytics
  // event. No storage, no lookups -- reading a clock cannot slow a search.
  const startedAt = Date.now();

  const page = Math.max(1, Number(input.page || 1));
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(input.limit || CATALOG_DEFAULT_LIMIT))
  );
  const query = (input.q || "").trim().toLowerCase();
  const category = input.category || "";
  const brand = input.brand || "";
  const priceFilter = (input.price || "all") as PriceFilterValue;
  const sort = input.sort || "newest";
  const condition = (input.condition || "").trim().toLowerCase();
  const inStockOnly = (input.availability || "") === "in-stock";

  let items = [...getAllProducts()];

  // Narrow by the explicit filters first so search only ranks candidates the
  // customer can actually see, and so fitment/category filtering keeps
  // working exactly as before alongside a query.
  if (category) {
    items = items.filter((p) => p.category === category);
  }

  if (brand) {
    items = items.filter((p) => p.brand === brand);
  }

  if (priceFilter !== "all") {
    items = items.filter((p) => matchesPriceFilter(p.price, priceFilter));
  }

  // Condition and availability are real fields on ~99% of listings, so these
  // narrow honestly. A listing with no condition recorded is excluded from a
  // condition filter rather than assumed to match.
  if (condition) {
    items = items.filter((p) => conditionBucket(p.condition) === condition);
  }

  if (inStockOnly) {
    items = items.filter((p) => p.stock !== false);
  }

  // Ranked, typo-tolerant search (see lib/catalog/search.ts). Returns items
  // already ordered by relevance, plus the corrected query when a token was
  // a typo ("trubo" -> "turbo") so the UI can say what it searched for.
  let correctedQuery: string | null = null;
  if (query) {
    const result = searchProducts(items, query, {
      getBrandName: brandName,
      getCategoryName: categoryName,
      vocabulary: getVocabulary(),
      index: searchIndex,
    });
    items = result.items;
    correctedQuery = result.correctedQuery;
  }

  // Explicit sorts always win. Otherwise a query keeps its relevance order
  // (re-sorting by date would throw the ranking away), and an unfiltered
  // browse falls back to newest-first -- products without a createdAt sort
  // to the back as if timestamped 0, so newly added listings surface first.
  if (sort === "price-asc") {
    items.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    items.sort((a, b) => b.price - a.price);
  } else if (sort === "name-asc") {
    items.sort((a, b) => a.name.localeCompare(b.name));
  } else if (!query) {
    items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  const total = items.length;
  const start = (page - 1) * limit;
  const newSinceMs = Date.now() - NEW_BADGE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const products = items.slice(start, start + limit).map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    thumbnail: getProductThumbnail(product),
    images: product.images,
    category: product.category,
    brand: product.brand,
    isNew: Boolean(product.createdAt && product.createdAt >= newSinceMs),
    brandName: brandName(product.brand),
    partNumber: product.partNumber || undefined,
    fitment: shortFitment(product.fitment),
    condition: product.condition || undefined,
    inStock: product.stock,
  }));

  return {
    products,
    total,
    page,
    limit,
    hasMore: start + limit < total,
    correctedQuery,
    tookMs: Date.now() - startedAt,
  };
}
