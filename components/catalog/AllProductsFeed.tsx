"use client";

import { useMemo, useState } from "react";
import {
  getAllProducts,
  getCategories,
  getBrands,
  getBrandBySlug,
  getCategory,
  routes,
} from "@/lib/inventory";
import CatalogCard from "./CatalogCard";
import Price from "@/components/currency/Price";
import TranslatedText from "@/components/i18n/TranslatedText";
import { engineTree } from "@/data/engine";
import { slugify } from "@/lib/inventory";

const allProducts = getAllProducts();
const categories = getCategories();
const brands = getBrands();

function getPlatformName(platformSlug: string): string {
  for (const group of engineTree) {
    const platform = group.platforms.find(
      (p) => slugify(p.name) === platformSlug
    );
    if (platform) return platform.name;
  }
  return platformSlug;
}

export default function AllProductsFeed() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");

  const filteredBrands = useMemo(
    () =>
      categoryFilter
        ? brands.filter((b) => b.category === categoryFilter)
        : brands,
    [categoryFilter]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allProducts.filter((product) => {
      const brandName =
        getBrandBySlug(product.brand)?.name ?? product.brand;
      const categoryName =
        getCategory(product.category)?.name ?? product.category;
      const platform = product.platform ?? "";
      const platformName = platform ? getPlatformName(platform) : "";

      if (categoryFilter && product.category !== categoryFilter) {
        return false;
      }

      if (brandFilter && product.brand !== brandFilter) {
        return false;
      }

      if (priceFilter === "under-1000" && product.price >= 1000) {
        return false;
      }

      if (priceFilter === "over-1000" && product.price < 1000) {
        return false;
      }

      if (!q) return true;

      return (
        product.name.toLowerCase().includes(q) ||
        brandName.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q) ||
        platform.toLowerCase().includes(q) ||
        platformName.toLowerCase().includes(q)
      );
    });
  }, [query, categoryFilter, brandFilter, priceFilter]);

  return (
    <div className="space-y-8">
      {/* Search */}
      <div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by product name, brand, category, or engine type..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition-colors duration-300"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setBrandFilter("");
          }}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-red-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-red-500 focus:outline-none"
        >
          <option value="">All Brands</option>
          {filteredBrands.map((brand) => (
            <option key={brand.slug} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>

        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-red-500 focus:outline-none"
        >
          <option value="all">All Prices</option>
          <option value="under-1000">Under $1,000</option>
          <option value="over-1000">$1,000 and above</option>
        </select>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((product) => {
            const brandName =
              getBrandBySlug(product.brand)?.name ?? product.brand;
            const categoryName =
              getCategory(product.category)?.name ?? product.category;
            const image = product.thumbnail ?? product.image;

            return (
              <CatalogCard
                key={product.id}
                href={routes.product(product.id)}
              >
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="h-40 w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-40 w-full rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-500">
                    No image
                  </div>
                )}
                <h3 className="mt-3 font-semibold">
                  <TranslatedText as="span">{product.name}</TranslatedText>
                </h3>
                <p className="text-sm text-red-500 font-bold">
                  <Price usd={product.price} />
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                  <span className="rounded border border-white/10 px-2 py-0.5">
                    {categoryName}
                  </span>
                  <span className="rounded border border-white/10 px-2 py-0.5">
                    {brandName}
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
