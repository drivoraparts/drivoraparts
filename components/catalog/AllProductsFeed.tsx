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

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

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
  // Deliberately NOT read here (e.g. useRef(readSavedState())): sessionStorage
  // only exists in the browser, so a value read during the render that also
  // has to match server-rendered HTML would come back empty on the server
  // and (whenever a matching saved state actually exists) non-empty on the
  // client's hydration pass -- a hydration mismatch that can silently break
  // this subtree without necessarily throwing a catchable error. Populated
  // for real inside the load() effect below instead, which only ever runs
  // client-side, after hydration.
  const savedRef = useRef<ListScrollState | null>(null);
  const restorePendingRef = useRef(false);
  const restoreCheckedRef = useRef(false);
  const restoredScrollRef = useRef(false);
  // Bumped whenever the active filters change (see the load() effect below)
  // so an in-flight "Load more" request started under the old filters can
  // detect it's stale and discard its response instead of appending
  // mismatched products onto the newly-filtered grid.
  const requestGenerationRef = useRef(0);
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  // Navigating here from the header search box (or any other `?q=` link)
  // while already on this page doesn't remount the component -- App Router
  // reuses it since the route pattern is unchanged, so the `useState`
  // initializer above only ever ran once. Without this, a second search
  // from the header silently does nothing. Track the last URL value we
  // synced so this doesn't fight the page's own search input, which updates
  // `query` directly without touching the URL.
  const lastSyncedQueryParam = useRef(searchParams.get("q"));
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery !== lastSyncedQueryParam.current) {
      lastSyncedQueryParam.current = urlQuery;
      setQuery(urlQuery ?? "");
    }
  }, [searchParams]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilterValue>("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<CatalogProductCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  const sortOptions = SORT_OPTIONS;

  const fetchPage = useCallback(async (pageNum: number) => {
    const params = new URLSearchParams({
      page: String(pageNum),
      limit: String(PAGE_SIZE),
    });
    if (query.trim()) params.set("q", query.trim());
    if (categoryFilter) params.set("category", categoryFilter);
    if (brandFilter) params.set("brand", brandFilter);
    if (priceFilter !== "all") params.set("price", priceFilter);
    if (sortFilter !== "newest") params.set("sort", sortFilter);

    const res = await fetch(`/api/catalog/products?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Catalog request failed (${res.status})`);
    }
    return (await res.json()) as ApiResponse;
  }, [query, categoryFilter, brandFilter, priceFilter, sortFilter]);

  const fetchProducts = useCallback(
    async (pageNum: number, append: boolean) => {
      const generation = requestGenerationRef.current;
      setLoading(true);
      setError(false);
      try {
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
      } catch {
        if (generation === requestGenerationRef.current) setError(true);
      } finally {
        if (generation === requestGenerationRef.current) setLoading(false);
      }
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
      setError(false);

      // First run only: now that hydration is done, it's safe to read
      // sessionStorage. If a matching saved state exists, apply it and
      // bail -- the filter-state changes below give fetchPage a new
      // identity, which re-triggers this same effect (via the dependency
      // array) with fetchPage now reflecting the restored filters.
      if (!restoreCheckedRef.current) {
        restoreCheckedRef.current = true;
        const saved = readSavedState();
        if (saved) {
          savedRef.current = saved;
          restorePendingRef.current = true;
          setQuery(saved.query ?? "");
          setCategoryFilter(saved.categoryFilter ?? "");
          setBrandFilter(saved.brandFilter ?? "");
          setPriceFilter((saved.priceFilter as PriceFilterValue) ?? "all");
          setSortFilter(saved.sortFilter ?? "newest");
          setLoading(false);
          return;
        }
      }

      try {
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
      } catch {
        // A stuck multi-page restore (see the loop above) or any other
        // fetch failure used to leave this stuck on "Loading products…"
        // forever, with no error and no way to recover -- surface it and
        // let the retry button below fall back to a normal page-1 load.
        if (!cancelled) {
          restorePendingRef.current = false;
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
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
        sortFilter,
        productId,
      });
    },
    [page, query, categoryFilter, brandFilter, priceFilter, sortFilter]
  );

  return (
    <div>
      <div className="sticky top-[106px] z-30 -mx-3 mb-4 space-y-3 border-b border-neutral-200 bg-white/95 px-3 pb-3 pt-3 backdrop-blur sm:top-[114px] sm:-mx-6 sm:px-6">
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

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

          <CatalogFilterSelect
            ariaLabel="Sort products"
            value={sortFilter}
            onChange={setSortFilter}
            options={sortOptions}
          />
        </div>

        <p className="text-xs text-neutral-500">
          Showing {products.length} of {total.toLocaleString()} products
        </p>
      </div>

      {loading && products.length === 0 ? (
        <p className="text-sm text-gray-500">Loading products…</p>
      ) : error && products.length === 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>Couldn&apos;t load products. Please try again.</p>
          <button
            type="button"
            onClick={() => void fetchProducts(1, false)}
            className="mt-2 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </div>
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
