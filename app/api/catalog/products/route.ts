import { NextRequest, NextResponse } from "next/server";
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

const DEFAULT_LIMIT = 48;
const MAX_LIMIT = 96;
const NEW_BADGE_WINDOW_DAYS = 14;

const brandName = (slug: string) => getBrandBySlug(slug)?.name ?? slug;
const categoryName = (slug: string) => getCategory(slug)?.name ?? slug;

// The catalog is a static bundled array, so the typo-correction vocabulary is
// identical for every request -- build it once on first search rather than
// rescanning ~1,800 products each time.
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

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page") || 1));
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(params.get("limit") || DEFAULT_LIMIT))
  );
  const query = (params.get("q") || "").trim().toLowerCase();
  const category = params.get("category") || "";
  const brand = params.get("brand") || "";
  const priceFilter = (params.get("price") || "all") as PriceFilterValue;
  const sort = params.get("sort") || "newest";

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
  const pageItems = items.slice(start, start + limit).map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    thumbnail: getProductThumbnail(product),
    images: product.images,
    category: product.category,
    brand: product.brand,
    isNew: Boolean(product.createdAt && product.createdAt >= newSinceMs),
  }));

  return NextResponse.json({
    products: pageItems,
    total,
    page,
    limit,
    hasMore: start + limit < total,
    /** Set only when typo correction rewrote the query, so the UI can show
     * "Showing results for X" instead of silently searching for something
     * the customer didn't type. */
    correctedQuery,
  });
}
