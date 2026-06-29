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

  let items = getAllProducts();

  if (category) {
    items = items.filter((p) => p.category === category);
  }

  if (brand) {
    items = items.filter((p) => p.brand === brand);
  }

  if (query) {
    items = items.filter((product) => {
      const brandName =
        getBrandBySlug(product.brand)?.name ?? product.brand;
      return (
        product.name.toLowerCase().includes(query) ||
        brandName.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    });
  }

  if (priceFilter !== "all") {
    items = items.filter((p) => matchesPriceFilter(p.price, priceFilter));
  }

  const total = items.length;
  const start = (page - 1) * limit;
  const pageItems = items.slice(start, start + limit).map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    thumbnail: getProductThumbnail(product),
    images: product.images,
    category: product.category,
    brand: product.brand,
  }));

  return NextResponse.json({
    products: pageItems,
    total,
    page,
    limit,
    hasMore: start + limit < total,
  });
}
