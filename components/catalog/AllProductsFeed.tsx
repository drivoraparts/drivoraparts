"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import {
  recordSearch,
  recordSearchResultClick,
} from "@/lib/analytics/search-tracking";
import { normalizeText } from "@/lib/catalog/search";
import {
  CATALOG_DEFAULT_LIMIT,
  CONDITION_FILTERS,
  type CatalogQueryResult,
} from "@/lib/catalog/query";

const PAGE_SIZE = CATALOG_DEFAULT_LIMIT;

/**
 * How long a catalog request may run before it is treated as failed.
 *
 * A fetch with no deadline is how "Loading products..." became permanent: iOS
 * Safari suspends in-flight requests in a backgrounded tab, and a flaky
 * cellular connection can hold one open indefinitely. Nothing here ever gave
 * up, so `loading` stayed true forever, with no error state and no way back.
 * Twelve seconds is far longer than the query needs -- it reads a bundled
 * array and the server reports single-digit milliseconds -- while still being
 * inside the patience of someone watching an empty grid.
 */
const FETCH_TIMEOUT_MS = 12_000;

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
  /** Present when typo correction rewrote the query ("trubo" -> "turbo"). */
  correctedQuery?: string | null;
  /** Server-side search duration, recorded by search analytics. */
  tookMs?: number | null;
};

/**
 * How long a query must sit still before it is recorded as a real search.
 *
 * The input fetches on every keystroke, and that behaviour is deliberate --
 * results update as you type. Analytics must not mirror it, or every search
 * for "bmw" would also be logged as "b", "bm". This delay is purely an
 * analytics concern: results still update immediately, only the recording
 * waits for the query to settle.
 */
const SEARCH_ANALYTICS_SETTLE_MS = 900;

function readSavedState(): ListScrollState | null {
  const saved = readListScrollState(LIST_SCROLL_KEYS.catalogAll);
  if (!saved || saved.page == null) return null;
  if (saved.returnPath !== currentReturnPath()) return null;
  return saved;
}

export default function AllProductsFeed({
  initialQuery = "",
  initialCategory = "",
  initialData,
}: {
  /** Supplied by the server page from ?q=. Deliberately a prop rather than
   * useSearchParams(): that hook requires this component to sit inside its
   * own <Suspense> boundary, and in production that streamed island's HTML
   * arrived but never hydrated, so no effect here ever ran. The page
   * remounts this component via `key` when the query changes. */
  initialQuery?: string;
  /** Supplied from ?category=, so a category page can hand off to this
   *  paginated view instead of rendering its entire catalog at once. */
  initialCategory?: string;
  /** Page one, already run through the same query on the server. Present on
   * a normal page load, so the grid has real products in its very first HTML
   * and never has to render an empty "0 of 0" while a fetch is in flight. */
  initialData?: CatalogQueryResult;
}) {
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
  // Whether the server-rendered first page has been accepted. Only the very
  // first pass of the load effect may adopt it; every later pass is a real
  // filter/search change and must fetch.
  const seedConsumedRef = useRef(false);

  const [query, setQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [brandFilter, setBrandFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilterValue>("all");
  const [conditionFilter, setConditionFilter] = useState("");
  // The mobile filter sheet. Desktop shows the same controls inline, so this
  // is only ever consulted below the sm breakpoint.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortFilter, setSortFilter] = useState("newest");
  const [page, setPage] = useState(1);
  // Seeded from the server render when there is one. This is what stops the
  // grid opening on "Showing 0 of 0 products": there is no window in which
  // the component is mounted and knows nothing.
  const [products, setProducts] = useState<CatalogProductCardData[]>(
    initialData?.products ?? []
  );
  const [total, setTotal] = useState(initialData?.total ?? 0);
  const [hasMore, setHasMore] = useState(initialData?.hasMore ?? false);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);
  const [correctedQuery, setCorrectedQuery] = useState<string | null>(null);
  /** The query the displayed results actually belong to, so the empty state
   * quotes what was searched rather than whatever is currently typed. */
  const [resultsQuery, setResultsQuery] = useState(initialQuery);

  /*
   * Search analytics state. Kept in refs so recording never triggers a
   * re-render -- observation must be invisible to the rendering path.
   * `searchIdRef` ties result clicks back to the search that produced them.
   */
  const searchIdRef = useRef<string | null>(null);
  const lastRecordedRef = useRef<string | null>(null);
  const lastResponseRef = useRef<{
    query: string;
    total: number;
    correctedQuery: string | null;
    tookMs: number | null;
    top: CatalogProductCardData | null;
  } | null>(null);

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
    if (conditionFilter) params.set("condition", conditionFilter);
    if (sortFilter !== "newest") params.set("sort", sortFilter);

    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(`/api/catalog/products?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`Catalog request failed (${res.status})`);
      }
      return (await res.json()) as ApiResponse;
    } finally {
      // An abort surfaces as a throw, which the callers already turn into the
      // error state and its retry button -- the recoverable outcome the old
      // open-ended wait could never reach.
      clearTimeout(deadline);
    }
  }, [
    query,
    categoryFilter,
    brandFilter,
    priceFilter,
    conditionFilter,
    sortFilter,
  ]);

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
        setCorrectedQuery(data.correctedQuery ?? null);
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
      // sessionStorage and re-apply the filters the visitor had when they
      // left. Deliberately falls through to the fetch below rather than
      // returning to wait for a re-trigger: if every restored value already
      // equals current state, React bails out of the re-render, fetchPage
      // keeps its identity, this effect never runs again and nothing is
      // ever fetched. Falling through, the fetch either uses those same
      // (identical) values, or runs once more when the state change lands.
      if (!restoreCheckedRef.current) {
        restoreCheckedRef.current = true;
        const saved = readSavedState();
        if (saved) {
          savedRef.current = saved;
          restorePendingRef.current = true;
          setQuery(saved.query ?? "");
          // An explicit ?category= wins over whatever was last browsed:
          // arriving from a category page's "View all" is a deliberate
          // choice, and restoring over it left the dropdown reading "Any"
          // while the results were in fact filtered.
          setCategoryFilter(initialCategory || (saved.categoryFilter ?? ""));
          setBrandFilter(saved.brandFilter ?? "");
          setPriceFilter((saved.priceFilter as PriceFilterValue) ?? "all");
          setConditionFilter(saved.conditionFilter ?? "");
          setSortFilter(saved.sortFilter ?? "newest");
        }
      }

      // The server already ran this exact query and its products are on
      // screen. Re-fetching them here would spend a request to arrive at the
      // same list, and would blank the grid while doing it. A restore (below)
      // wants different pages, so it still runs.
      if (!seedConsumedRef.current) {
        seedConsumedRef.current = true;
        if (initialData && !restorePendingRef.current) {
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
        setCorrectedQuery(data.correctedQuery ?? null);
        setResultsQuery(query);
        setPage(1);

        // Hand the settle-timer effect below what this response actually
        // contained. Recording happens there, not here, so nothing is written
        // while the visitor is still typing.
        lastResponseRef.current = {
          query,
          total: data.total,
          correctedQuery: data.correctedQuery ?? null,
          tookMs: data.tookMs ?? null,
          top: data.products[0] ?? null,
        };
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

  /*
   * Records a search once the query has settled and its results have arrived.
   *
   * Sits entirely outside the fetch path: it reads what the last response
   * contained and reports it. If this never ran, search would behave
   * identically. Non-search browsing (empty query) is not recorded.
   */
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    const timer = setTimeout(() => {
      const response = lastResponseRef.current;
      if (!response || response.query.trim() !== trimmed) return;

      // One record per settled query, so re-renders and filter changes that
      // leave the query untouched do not inflate the counts.
      const signature = `${trimmed}::${response.total}`;
      if (lastRecordedRef.current === signature) return;
      lastRecordedRef.current = signature;

      searchIdRef.current = recordSearch({
        query: trimmed,
        normalizedQuery: normalizeText(trimmed),
        correctedQuery: response.correctedQuery,
        resultCount: response.total,
        topProductId: response.top?.id ?? null,
        topProductName: response.top?.name ?? null,
        tookMs: response.tookMs,
      });
    }, SEARCH_ANALYTICS_SETTLE_MS);

    return () => clearTimeout(timer);
  }, [query, loading, products]);

  const handleProductNavigate = useCallback(
    (productId: number) => {
      /*
       * Attribute the click to the search that produced this list. Runs before
       * the existing scroll-state save below and shares its trigger, so no new
       * click handling is introduced into the card.
       */
      const searchId = searchIdRef.current;
      const trimmed = query.trim();
      if (searchId && trimmed) {
        const index = products.findIndex((p) => p.id === productId);
        const clicked = index >= 0 ? products[index] : null;
        if (clicked) {
          recordSearchResultClick({
            searchId,
            query: trimmed,
            normalizedQuery: normalizeText(trimmed),
            productId: clicked.id,
            productName: clicked.name,
            position: index + 1,
          });
        }
      }

      saveCatalogAllState({
        scrollY: window.scrollY,
        page,
        query,
        categoryFilter,
        brandFilter,
        priceFilter,
        conditionFilter,
        sortFilter,
        productId,
      });
    },
    [
      page,
      query,
      products,
      categoryFilter,
      brandFilter,
      priceFilter,
      conditionFilter,
      sortFilter,
    ]
  );

  /*
   * Filters, and how many are on.
   *
   * Sort is excluded deliberately: re-ordering a list is not narrowing it, and
   * counting it would tell someone a filter is applied when they have only
   * changed the order. The count exists so a phone, where these controls sit
   * behind a button, can still say what is currently hiding products.
   */
  const conditionOptions = useMemo(
    () => [
      { value: "", label: "Any Condition" },
      ...CONDITION_FILTERS.map((c) => ({ value: c.value, label: c.label })),
    ],
    []
  );

  const activeFilterCount =
    (categoryFilter ? 1 : 0) +
    (brandFilter ? 1 : 0) +
    (priceFilter !== "all" ? 1 : 0) +
    (conditionFilter ? 1 : 0);

  const clearAllFilters = useCallback(() => {
    setCategoryFilter("");
    setBrandFilter("");
    setPriceFilter("all");
    setConditionFilter("");
  }, []);

  /*
   * The four narrowing controls, defined once and rendered twice -- inline on
   * desktop, inside the sheet on phones. Two copies of this markup would be
   * two places for the option lists to drift apart.
   */
  const filterControls = (
    <>
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
        ariaLabel="Filter by condition"
        value={conditionFilter}
        onChange={setConditionFilter}
        options={conditionOptions}
      />
    </>
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
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 pr-8 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            aria-label="Search products"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted transition hover:text-neutral-700"
            >
              ✕
            </button>
          ) : null}
        </div>

        {/* Desktop: the controls are the bar. */}
        <div className="hidden gap-2 sm:grid sm:grid-cols-5">
          {filterControls}
          <CatalogFilterSelect
            ariaLabel="Sort products"
            value={sortFilter}
            onChange={setSortFilter}
            options={sortOptions}
          />
        </div>

        {/* Phones: filtering goes behind one button, sorting stays out in the
            open. Sorting is one decision and belongs where it can be made
            without opening anything; filtering is four and needs the room. */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={filtersOpen}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition-colors duration-[var(--motion-duration-fast)] active:bg-neutral-100"
          >
            Filters
            {activeFilterCount > 0 ? (
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold tabular-nums text-accent-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <div className="min-w-0 flex-1">
            <CatalogFilterSelect
              ariaLabel="Sort products"
              value={sortFilter}
              onChange={setSortFilter}
              options={sortOptions}
            />
          </div>
        </div>

        {/*
          The filter sheet.

          Rendered only while open, so its selects are not in the tab order of
          a page where they are invisible. The scrim closes it, as does the
          close button and "Show results" -- filters apply as they are chosen,
          so there is no pending state to discard and no way to leave this
          having silently lost a choice.
        */}
        {filtersOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="fixed inset-0 z-50 sm:hidden"
          >
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
              className="absolute inset-0 bg-neutral-950/50"
            />

            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                <p className="text-sm font-bold text-neutral-900">
                  Filters
                  {activeFilterCount > 0 ? (
                    <span className="ml-2 font-medium text-neutral-500">
                      {activeFilterCount} active
                    </span>
                  ) : null}
                </p>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="-mr-2 px-2 py-1 text-sm text-neutral-500"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-3 px-4 py-4">{filterControls}</div>

              <div className="sticky bottom-0 flex items-center gap-3 border-t border-neutral-200 bg-white px-4 py-3">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  disabled={activeFilterCount === 0}
                  className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors duration-[var(--motion-duration-fast)] disabled:opacity-40"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-colors duration-[var(--motion-duration-fast)] active:bg-accent-active"
                >
                  {loading
                    ? "Show results"
                    : `Show ${total.toLocaleString()} result${total === 1 ? "" : "s"}`}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-0.5">
          {correctedQuery && products.length > 0 ? (
            <p className="text-xs text-neutral-700">
              Showing results for{" "}
              <span className="font-semibold text-neutral-900">{correctedQuery}</span>
              {resultsQuery ? (
                <span className="text-neutral-500"> — searched for “{resultsQuery}”</span>
              ) : null}
            </p>
          ) : null}
          {products.length > 0 ? (
            <p className="text-xs text-neutral-500">
              Showing {products.length} of {total.toLocaleString()} products
            </p>
          ) : loading ? (
            // "Showing 0 of 0 products" is not a loading state, it is a false
            // statement about a 1,890-listing catalog -- and it used to render
            // above the loading branch, so every visitor saw it.
            <p className="text-xs text-neutral-500">Loading the marketplace…</p>
          ) : null}
        </div>
      </div>

      {loading && products.length === 0 ? (
        <p className="text-sm text-gray-500">Loading products…</p>
      ) : error && products.length === 0 ? (
        <div className="rounded-lg border border-accent-border bg-accent-subtle px-4 py-3 text-sm text-accent-hover">
          <p>Couldn&apos;t load products. Please try again.</p>
          <button
            type="button"
            onClick={() => void fetchProducts(1, false)}
            className="mt-2 rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-active"
          >
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-sm text-gray-600">
          <p>
            No products found
            {resultsQuery ? (
              <>
                {" "}for <span className="font-semibold text-neutral-900">“{resultsQuery}”</span>
              </>
            ) : null}
            .
          </p>
          <p className="mt-1 text-gray-500">
            Try a broader term, check the spelling, or clear the category and
            brand filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
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
                className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-active disabled:opacity-60"
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
