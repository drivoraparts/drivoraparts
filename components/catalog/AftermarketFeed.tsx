"use client";

import { useMemo, useState } from "react";
import {
  getProductsByCategory,
  getBrandsByCategory,
  getConditionLabel,
  routes,
} from "@/lib/inventory";
import CatalogCard from "./CatalogCard";

const aftermarketProducts = getProductsByCategory("aftermarket");
const aftermarketBrands = getBrandsByCategory("aftermarket");

type SortOption =
  | "price-asc"
  | "price-desc"
  | "newest"
  | "oldest";

function brandName(slug: string): string {
  return aftermarketBrands.find((b) => b.slug === slug)?.name ?? slug;
}

export default function AftermarketFeed() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let results = aftermarketProducts.filter((product) => {
      if (!q) return true;

      const brand = brandName(product.brand).toLowerCase();

      return (
        product.name.toLowerCase().includes(q) ||
        brand.includes(q) ||
        (product.description ?? "").toLowerCase().includes(q) ||
        (product.condition ?? "").toLowerCase().includes(q)
      );
    });

    results = [...results].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return (b.createdAt ?? b.id) - (a.createdAt ?? a.id);
        case "oldest":
          return (a.createdAt ?? a.id) - (b.createdAt ?? b.id);
        default:
          return 0;
      }
    });

    return results;
  }, [query, sort]);

  return (
    <div className="space-y-8">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search aftermarket parts by name, brand, or type..."
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition-colors duration-300"
      />

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as SortOption)}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-red-500 focus:outline-none"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="price-asc">Price Low → High</option>
        <option value="price-desc">Price High → Low</option>
      </select>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No aftermarket parts found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((product) => {
            const image = product.thumbnail ?? product.image;
            const inStock = product.stock !== false;

            return (
              <CatalogCard
                key={product.id}
                href={routes.product(product.id)}
              >
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="h-40 w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-40 w-full rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-500">
                    No image
                  </div>
                )}
                <h3 className="mt-3 font-semibold">{product.name}</h3>
                <p className="text-sm text-red-500 font-bold">
                  ${product.price}
                </p>
                <div className="mt-2 space-y-1 text-xs text-gray-400">
                  <p>Condition: {getConditionLabel(product)}</p>
                  <p className={inStock ? "text-gray-300" : "text-red-400"}>
                    {product.stockQty != null
                      ? product.stockQty > 0
                        ? `${product.stockQty} in stock`
                        : "Out of Stock"
                      : inStock
                        ? "In Stock"
                        : "Out of Stock"}
                  </p>
                  <span className="inline-block rounded border border-white/10 px-2 py-0.5">
                    {brandName(product.brand)}
                  </span>
                </div>
              </CatalogCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
