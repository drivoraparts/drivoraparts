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
import CatalogFilterSelect from "./CatalogFilterSelect";
import {
  PRICE_FILTER_OPTIONS,
  matchesPriceFilter,
  type PriceFilterValue,
} from "@/lib/catalog/price-filters";
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
  const [priceFilter, setPriceFilter] = useState<PriceFilterValue>("all");

  const filteredBrands = useMemo(
    () =>
      categoryFilter
        ? brands.filter((b) => b.category === categoryFilter)
        : brands,
    [categoryFilter]
  );

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "All Categories" },
      ...categories.map((cat) => ({ value: cat.slug, label: cat.name })),
    ],
    []
  );

  const brandOptions = useMemo(
    () => [
      { value: "", label: "All Brands" },
      ...filteredBrands.map((brand) => ({
        value: brand.slug,
        label: brand.name,
      })),
    ],
    [filteredBrands]
  );

  const priceOptions = useMemo(
    () =>
      PRICE_FILTER_OPTIONS.map(({ value, label }) => ({ value, label })),
    []
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

      if (!matchesPriceFilter(product.price, priceFilter)) {
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

        <div className="grid grid-cols-1 gap-1.5 min-[420px]:grid-cols-3 sm:flex sm:flex-wrap sm:gap-3">
          <CatalogFilterSelect
            ariaLabel="Filter by category"
            value={categoryFilter}
            onChange={(value) => {
              setCategoryFilter(value);
              setBrandFilter("");
            }}
            options={categoryOptions}
          />

          <CatalogFilterSelect
            ariaLabel="Filter by brand"
            value={brandFilter}
            onChange={setBrandFilter}
            options={brandOptions}
          />

          <CatalogFilterSelect
            ariaLabel="Filter by budget"
            value={priceFilter}
            onChange={(value) => setPriceFilter(value as PriceFilterValue)}
            options={priceOptions}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4">
          {filtered.map((product, index) => (
            <AllProductsGridCard
              key={product.id}
              priority={index < 6}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
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
