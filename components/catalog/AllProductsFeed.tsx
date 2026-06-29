"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCategories,
  getBrands,
} from "@/lib/inventory";
import AllProductsGridCard from "./AllProductsGridCard";
import CatalogFilterSelect from "./CatalogFilterSelect";
import {
  PRICE_FILTER_OPTIONS,
  type PriceFilterValue,
} from "@/lib/catalog/price-filters";
import type { CatalogProductCardData } from "./CatalogProductCard";

const PAGE_SIZE = 48;

const categories = getCategories();
const brands = getBrands();

type ApiResponse = {
  products: CatalogProductCardData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export default function AllProductsFeed() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilterValue>("all");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<CatalogProductCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const fetchProducts = useCallback(
    async (pageNum: number, append: boolean) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      });
      if (query.trim()) params.set("q", query.trim());
      if (categoryFilter) params.set("category", categoryFilter);
      if (brandFilter) params.set("brand", brandFilter);
      if (priceFilter !== "all") params.set("price", priceFilter);

      const res = await fetch(`/api/catalog/products?${params.toString()}`);
      const data = (await res.json()) as ApiResponse;

      setProducts((prev) =>
        append ? [...prev, ...data.products] : data.products
      );
      setTotal(data.total);
      setHasMore(data.hasMore);
      setLoading(false);
    },
    [query, categoryFilter, brandFilter, priceFilter]
  );

  useEffect(() => {
    setPage(1);
    void fetchProducts(1, false);
  }, [fetchProducts]);

  return (
    <div>
      <div className="mb-4 space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search parts..."
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          aria-label="Search products"
        />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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

        <p className="text-xs text-neutral-500">
          Showing {products.length} of {total.toLocaleString()} products
        </p>
      </div>

      {loading && products.length === 0 ? (
        <p className="text-sm text-gray-500">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500">No products match your search.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4">
            {products.map((product, index) => (
              <AllProductsGridCard
                key={product.id}
                priority={index < 6}
                product={product}
              />
            ))}
          </div>

          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  void fetchProducts(next, true);
                }}
                className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Loading…" : "Load more products"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
