"use client";

import { useMemo, useState } from "react";
import {
  getAllProducts,
  getCategories,
  getBrands,
  getBrandBySlug,
  getCategory,
  getProductThumbnail,
  slugify,
} from "@/lib/inventory";
import AllProductsGridCard from "./AllProductsGridCard";
import { engineTree } from "@/data/engine";

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
    <div className="space-y-3 sm:space-y-4">
      {/* Search + filters — compact so products sit above the fold on mobile */}
      <div className="space-y-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none"
        />

        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setBrandFilter("");
            }}
            className="min-w-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] text-white focus:border-red-500 focus:outline-none sm:px-4 sm:py-2 sm:text-sm"
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
            className="min-w-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] text-white focus:border-red-500 focus:outline-none sm:px-4 sm:py-2 sm:text-sm"
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
            className="min-w-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] text-white focus:border-red-500 focus:outline-none sm:px-4 sm:py-2 sm:text-sm"
          >
            <option value="all">All Prices</option>
            <option value="under-1000">Under $1k</option>
            <option value="over-1000">$1k+</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4">
          {filtered.map((product) => (
            <AllProductsGridCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                thumbnail: getProductThumbnail(product),
                images: product.images,
                category: product.category,
                brand: product.brand,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
