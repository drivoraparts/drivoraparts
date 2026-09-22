import type { Metadata } from "next";

import AllProductsFeed from "@/components/catalog/AllProductsFeed";
import CatalogHero from "@/components/catalog/CatalogHero";
import CatalogSectionRails from "@/components/catalog/CatalogSectionRails";
import PopularCategoriesSection from "@/components/catalog/PopularCategoriesSection";
import SeasonalCollectionsSection from "@/components/catalog/SeasonalCollectionsSection";
import TrendingRail from "@/components/catalog/TrendingRail";
import RecentlyAddedRail from "@/components/catalog/RecentlyAddedRail";
import StaffPicksSection from "@/components/catalog/StaffPicksSection";
import CatalogVehicleFinderSection from "@/components/catalog/CatalogVehicleFinderSection";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { routes } from "@/lib/inventory";
import { getCatalogSections, getSection } from "@/lib/catalog/sections";
import { CATALOG_DEFAULT_LIMIT, queryCatalog } from "@/lib/catalog/query";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  collectionPageJsonLd,
} from "@/lib/seo";

// Was `revalidate = 600` (ISR). AllProductsFeed's useSearchParams() forces a
// dynamic hole inside this otherwise-cached page -- the CDN edge/ISR layer
// serves the cached static shell instantly and is supposed to stream that
// hole in fresh per request, but that combination can leave the Suspense
// boundary stuck on its "Loading products..." fallback forever for
// cache-served requests, independent of device, browser, or what was
// searched. force-dynamic renders the whole page fresh every time, so that
// boundary always resolves the same way it does on an uncached first visit.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "All Performance Parts",
  description:
    "Browse every listing on DrivoraParts — engines, turbos, brakes, suspension, electronics, lighting, body kits, interior, aftermarket, and more.",
  path: routes.all,
});

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    section?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const param = (value: string | string[] | undefined) =>
    typeof value === "string" ? value.trim() : "";

  const initialQuery = param(params.q);
  const initialCategory = param(params.category);
  // A row's "View all" lands here. The section narrows by the same rule the
  // row was built from, so the grid opens on exactly what the row was
  // showing -- the market pages have worked this way all along.
  const section = getSection(param(params.section));
  const isSearch = initialQuery.length > 0;

  /*
   * Narrowed, or browsing.
   *
   * Someone who has typed a query, tapped a category or followed a row's
   * "View all" has already said what they want. Putting ten merchandised
   * rows between them and the answer is answering a question they did not
   * ask, so on those views the grid leads and the discovery aids follow it.
   * Browsing is the journey, and that is where the rows belong.
   */
  const isNarrowed = Boolean(isSearch || initialCategory || section);

  /*
   * Run the catalog query here, while rendering, and hand the result to the
   * feed as its starting state.
   *
   * The feed used to mount empty and fetch its own first page, which meant
   * every visit had a window -- a second on a desktop, far longer on a phone
   * -- where the marketplace rendered "Showing 0 of 0 products" over an empty
   * grid, and where a request that never came back left "Loading products..."
   * on screen permanently. Neither is reachable now: page one is in the HTML.
   * The client still owns everything after that (filters, search, paging), and
   * runs the identical query through /api/catalog/products.
   *
   * This also puts real products and prices into the server-rendered markup
   * for the first time, which is what a crawler reads.
   */
  const initialData = queryCatalog({
    page: 1,
    limit: CATALOG_DEFAULT_LIMIT,
    q: initialQuery,
    category: initialCategory,
    section: section?.key,
  });

  /*
   * The rows.
   *
   * The same builder the four market pages use, with no market filter
   * applied -- see lib/catalog/sections.ts. Every row is gated on real stock
   * in the scope, deduplicated against the rows above it and ordered by the
   * merchandising rank the grid uses. Nothing is padded to make the page look
   * full: a system the catalogue cannot supply simply has no row.
   */
  const sections = isNarrowed ? [] : getCatalogSections("all");

  /*
   * The listings themselves, defined once and positioned by the order below.
   * Writing this twice would be two places for the heading, the key and the
   * server-rendered first page to drift apart.
   */
  const marketplace = (
    <div className="px-3 pb-6 pt-10 sm:px-6">
      <header
        id="all-products"
        className="mb-3 scroll-mt-[calc(var(--header-h-scrolled)+8px)] sm:mb-6"
      >
        <h2 className="inline-block border-b-2 border-accent pb-1 text-xl font-bold text-neutral-900 sm:text-3xl sm:pb-2">
          {isSearch
            ? `Search results for “${initialQuery}”`
            : (section?.label ?? "All Products")}
        </h2>
        <p className="mt-1 hidden text-sm text-neutral-500 sm:block">
          {isSearch
            ? "Refine with the category, brand, and price filters below."
            : section
              ? "Narrow by brand, budget or condition, or search within these listings."
              : "Browse the complete DrivoraParts inventory."}
        </p>
      </header>
      {/* No <Suspense> and no useSearchParams() inside the feed. That
          combination put the feed in its own streamed Suspense island, and in
          production that island's HTML was delivered but never hydrated -- so
          its effects never ran, no products were ever fetched, and it sat on
          "Loading products..." forever for every visitor. The query now comes
          from the server as a prop, and `key` remounts the feed whenever it
          changes so a new search always starts from clean state. */}
      <AllProductsFeed
        key={`${initialQuery}|${initialCategory}|${section?.key ?? ""}`}
        initialQuery={initialQuery}
        initialCategory={initialCategory}
        section={section?.key}
        initialData={initialData}
      />
    </div>
  );

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Catalog", path: routes.catalog },
            { name: "All Products", path: routes.all },
          ]),
          collectionPageJsonLd(
            "All Performance Parts",
            "Complete marketplace feed of performance automotive parts and upgrades.",
            routes.all
          ),
        ]}
      />
      <main className="min-h-screen bg-white text-neutral-900">
        {/*
          THE ORDER OF THIS PAGE, AND WHY IT DIFFERS BETWEEN BROWSING AND
          NARROWING.

          Browsing follows the journey: say what the place is, ask what they
          drive, show the systems, walk the systems as rows of real stock,
          then hand over the whole catalogue with its filters, then the
          editorial. Each step narrows the one below it, which is the argument
          for putting fitment, categories and the rows above the grid rather
          than under it.

          Narrowing does not. Everything above the grid was once above it for
          searches too, and it pushed the results 5,509px down -- nine screens
          -- so a search looked like it had hung and "View all" looked like it
          had bounced the visitor to a second homepage. Someone who has typed
          a query has already told us what they want; asking them what they
          drive first is answering a question they did not ask. A category
          choice and a row's "View all" are the same kind of statement, so
          they behave the same way.

          So the grid leads on a narrowed page and the aids follow it, and the
          journey applies where it is actually a journey.
        */}
        {isNarrowed ? (
          <>
            {marketplace}
            <CatalogVehicleFinderSection />
            <PopularCategoriesSection />
            <TrendingRail />
          </>
        ) : (
          <>
            <CatalogHero />
            <CatalogVehicleFinderSection />
            <PopularCategoriesSection />

            {/* The systems, as rows of real stock. This is the discovery the
                page leads with; the grid below is the complete catalogue for
                anyone who would rather filter it themselves. */}
            <CatalogSectionRails
              sections={sections}
              anchorId="systems"
              viewAllHref={(s) =>
                `${routes.all}?section=${encodeURIComponent(s.key)}`
              }
              closing={{
                title: "Browse all products",
                detail: (
                  <>
                    <span className="tabular-nums">
                      {initialData.total.toLocaleString()}
                    </span>{" "}
                    listings, with search, category, brand, budget and
                    condition filters.
                  </>
                ),
                href: "#all-products",
                cta: "Open the full catalog",
              }}
            />

            {marketplace}
            <TrendingRail />
            <SeasonalCollectionsSection />
            <RecentlyAddedRail />
            <StaffPicksSection />
          </>
        )}
      </main>
    </>
  );
}
