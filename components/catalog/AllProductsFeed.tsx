"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { categories } from "@/lib/inventory/categories";
import { brands } from "@/lib/inventory/brands";
import AllProductsGridCard, {
  saveCatalogAllState,
} from "./AllProductsGridCard";
import CatalogFilterSelect from "./CatalogFilterSelect";
import {
  LIST_SCROLL_KEYS,
  clearListScrollState,
  clearPendingListScrollState,
  currentReturnPath,
  readListScrollState,
  restoreListScrollWithRetry,
  type ListScrollState,
} from "@/lib/catalog/list-scroll-restore";
import {
  PRICE_FILTER_OPTIONS,
  type PriceFilterValue,
} from "@/lib/catalog/price-filters";
import type { CatalogProductCardData } from "./CatalogProductCard";

const PAGE_SIZE = 48;

const categoriesList = categories;
const brandsList = brands;

type ApiResponse = {
  products: CatalogProductCardData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

function readSavedState(): ListScrollState | null {
  const saved = readListScrollState(LIST_SCROLL_KEYS.catalogAll);
  if (!saved || saved.page == null) return null;
  if (saved.returnPath !== currentReturnPath()) return null;
  return saved;
}

export default function AllProductsFeed() {
  const savedRef = useRef(readSavedState());
  const restorePendingRef = useRef(Boolean(savedRef.current));
  const restoredScrollRef = useRef(false);
  // Bumped whenever the active filters change (see the load() effect below)
  // so an in-flight "Load more" request started under the old filters can
  // detect it's stale and discard its response instead of appending
  // mismatched products onto the newly-filtered grid.
  const requestGenerationRef = useRef(0);
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(
    savedRef.current?.query ?? searchParams.get("q") ?? ""
  );
  const [categoryFilter, setCategoryFilter] = useState(
    savedRef.current?.categoryFilter ?? ""
  );
  const [brandFilter, setBrandFilter] = useState(
    savedRef.current?.brandFilter ?? ""
  );
  const [priceFilter, setPriceFilter] = useState<PriceFilterValue>(
    (savedRef.current?.priceFilter as PriceFilterValue) ?? "all"
  );
  const [page, setPage] = useState(savedRef.current?.page ?? 1);
  const [products, setProducts] = useState<CatalogProductCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const filteredBrands = useMemo(
    () =>
      categoryFilter
        ? brandsList.filter((b) => b.category === categoryFilter)
        : brandsList,
    [categoryFilter]
  );

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "All Categories" },
      ...categoriesList.map((cat) => ({ value: cat.slug, label: cat.name })),
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

  const fetchPage = useCallback(async (pageNum: number) => {
    const params = new URLSearchParams({
      page: String(pageNum),
      limit: String(PAGE_SIZE),
    });
    if (query.trim()) params.set("q", query.trim());
    if (categoryFilter) params.set("category", categoryFilter);
    if (brandFilter) params.set("brand", brandFilter);
    if (priceFilter !== "all") params.set("price", priceFilter);

    const res = await fetch(`/api/catalog/products?${params.toString()}`);
    return (await res.json()) as ApiResponse;
  }, [query, categoryFilter, brandFilter, priceFilter]);

  const fetchProducts = useCallback(
    async (pageNum: number, append: boolean) => {
      const generation = requestGenerationRef.current;
      setLoading(true);
      const data = await fetchPage(pageNum);

      // The active filters changed (a new load() ran) while this request
      // was in flight — its results belong to a filter set that's no
      // longer displayed, so discard them instead of appending/replacing.
      if (generation !== requestGenerationRef.current) {
        return;
      }

      setProducts((prev) =>
        append ? [...prev, ...data.products] : data.products
      );
      setTotal(data.total);
      setHasMore(data.hasMore);
      setLoading(false);
    },
    [fetchPage]
  );

  const restoreScroll = useCallback((saved: ListScrollState) => {
    if (restoredScrollRef.current) return;
    restoredScrollRef.current = true;

    requestAnimationFrame(() => {
      restoreListScrollWithRetry(saved);
      clearPendingListScrollState();
      clearListScrollState(LIST_SCROLL_KEYS.catalogAll);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Invalidates any "Load more" request already in flight under the
    // previous filters — see the generation check in fetchProducts.
    requestGenerationRef.current += 1;

    async function load() {
      setLoading(true);

      if (restorePendingRef.current && savedRef.current) {
        const targetPage = savedRef.current.page;
        const first = await fetchPage(1);
        if (cancelled) return;

        let merged = [...first.products];
        for (let p = 2; p <= targetPage; p += 1) {
          const next = await fetchPage(p);
          if (cancelled) return;
          merged = [...merged, ...next.products];
        }

        setProducts(merged);
        setTotal(first.total);
        setHasMore(targetPage * PAGE_SIZE < first.total);
        setPage(targetPage);
        setLoading(false);
        restorePendingRef.current = false;
        restoreScroll(savedRef.current);
        return;
      }

      setPage(1);
      setProducts([]);
      const data = await fetchPage(1);
      if (cancelled) return;
      setProducts(data.products);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(1);
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchPage, restoreScroll]);

  const handleProductNavigate = useCallback(
    (productId: number) => {
      saveCatalogAllState({
        scrollY: window.scrollY,
        page,
        query,
        categoryFilter,
        brandFilter,
        priceFilter,
        productId,
      });
    },
    [page, query, categoryFilter, brandFilter, priceFilter]
  );

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parts..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 pr-8 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            aria-label="Search products"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-700"
            >
              ✕
            </button>
          ) : null}
        </div>

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
            searchable
            searchPlaceholder="Search brands…"
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
                onNavigate={handleProductNavigate}
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
