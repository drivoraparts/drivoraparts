import { NextRequest, NextResponse } from "next/server";
import {
  getAllProducts,
  getBrandBySlug,
  getProductThumbnail,
} from "@/lib/inventory";
import {
  matchesPriceFilter,
  type PriceFilterValue,
} from "@/lib/catalog/price-filters";

const DEFAULT_LIMIT = 48;
const MAX_LIMIT = 96;
const NEW_BADGE_WINDOW_DAYS = 14;

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

  // Newest-first — products without a createdAt (most of the legacy catalog)
  // sort to the back as if timestamped 0, so any newly added product with a
  // real createdAt automatically surfaces at the top of All Products.
  let items = [...getAllProducts()];

  if (sort === "price-asc") {
    items.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    items.sort((a, b) => b.price - a.price);
  } else if (sort === "name-asc") {
    items.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  if (category) {
    items = items.filter((p) => p.category === category);
  }

  if (brand) {
    items = items.filter((p) => p.brand === brand);
  }

  if (query) {
    // Match each word independently (AND across words, OR across fields)
    // rather than the whole query as one literal substring -- the Shop by
    // Vehicle finder joins Year/Make/Model/Engine into a single string
    // (e.g. "2020 Toyota Supra 2JZ"), and requiring that exact phrase to
    // appear verbatim in a product's name matched almost nothing, since
    // real product names are never formatted that way. fitment is included
    // since that's specifically where make/model/engine compatibility text
    // lives (e.g. "Toyota Supra MK4 (2JZ-GTE)").
    const terms = query.split(/\s+/).filter(Boolean);
    items = items.filter((product) => {
      const brandName =
        getBrandBySlug(product.brand)?.name ?? product.brand;
      const haystack = [
        product.name,
        brandName,
        product.category,
        product.fitment ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }

  if (priceFilter !== "all") {
    items = items.filter((p) => matchesPriceFilter(p.price, priceFilter));
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
  });
}
