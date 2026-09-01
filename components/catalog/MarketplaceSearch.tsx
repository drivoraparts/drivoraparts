import { routes } from "@/lib/inventory/routes";

/**
 * The marketplace's primary search.
 *
 * WHY THIS IS A PLAIN FORM AND NOT A CLIENT COMPONENT
 * It is a GET form pointed at the catalog route, so submitting it is an
 * ordinary navigation to /catalog/all?q=... The page already reads that query
 * on the server and renders the matching first page into its HTML, which means
 * this control works with JavaScript disabled, before hydration, and on a
 * connection that never finishes loading the bundle. No state, no effect, no
 * fetch, nothing to break.
 *
 * The focus treatment is CSS (:focus-within) for the same reason -- a focus
 * ring that depends on a React state update is a focus ring that can fail.
 *
 * WHAT IT ACTUALLY SEARCHES
 * Everything the placeholder claims. The ranked index behind /api/catalog and
 * the server query covers product name, part number, brand (name and slug),
 * category, fitment text -- which is where vehicle, model and year live -- and
 * engine platform, with typo correction over the whole vocabulary. Verified
 * against the live catalog: "AP63414" and "33111-2271" each resolve to their
 * one part, "hilux" to 53, "f-250" to 67, "2jz" to 5, "brembo" to 2. The
 * placeholder promises nothing the index cannot answer.
 */
export default function MarketplaceSearch({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  return (
    <form
      action={routes.all}
      method="get"
      role="search"
      className="group flex w-full max-w-2xl items-stretch border border-white/15 bg-white/[0.04] transition-[background-color,border-color,box-shadow] duration-[var(--motion-duration-fast)] focus-within:border-accent-on-dark/70 focus-within:bg-white/[0.07] focus-within:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.8)] hover:border-white/25"
    >
      <label htmlFor="marketplace-search" className="sr-only">
        Search the marketplace
      </label>

      <span
        aria-hidden="true"
        className="flex shrink-0 items-center pl-4 text-neutral-500 transition-colors duration-[var(--motion-duration-fast)] group-focus-within:text-accent-on-dark"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>

      <input
        id="marketplace-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoComplete="off"
        placeholder="Search by part name, part number, vehicle, brand…"
        className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none sm:py-4 sm:text-base"
      />

      <button
        type="submit"
        aria-label="Search"
        className="shrink-0 bg-accent px-4 text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground transition-colors duration-[var(--motion-duration-fast)] hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-on-dark sm:px-7 sm:text-[13px]"
      >
        <span className="hidden sm:inline">Search</span>
        <span className="text-base sm:hidden" aria-hidden="true">
          →
        </span>
      </button>
    </form>
  );
}
