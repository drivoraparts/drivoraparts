import type { Metadata } from "next";

import AllProductsFeed from "@/components/catalog/AllProductsFeed";
import CatalogHero from "@/components/catalog/CatalogHero";
import PopularCategoriesSection from "@/components/catalog/PopularCategoriesSection";
import SeasonalCollectionsSection from "@/components/catalog/SeasonalCollectionsSection";
import TrendingRail from "@/components/catalog/TrendingRail";
import RecentlyAddedRail from "@/components/catalog/RecentlyAddedRail";
import StaffPicksSection from "@/components/catalog/StaffPicksSection";
import CatalogVehicleFinderSection from "@/components/catalog/CatalogVehicleFinderSection";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { routes } from "@/lib/inventory";
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
  searchParams: Promise<{ q?: string | string[]; category?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialQuery = typeof params.q === "string" ? params.q : "";
  const initialCategory =
    typeof params.category === "string" ? params.category : "";
  const isSearch = initialQuery.trim().length > 0;

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
  });

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
        {/* Only the hero sits above the listings. Everything else that used to
            — vehicle finder, category grid, editorial rails — pushed the feed
            5,509px down, better than nine screens of scrolling. A search
            looked like it had hung, and "View all" looked like it had bounced
            the visitor back to a second homepage, since these are the same
            components the homepage is built from. Whoever arrives here asked
            for the list; the browsing aids belong underneath it. */}
        {!isSearch ? <CatalogHero /> : null}

        <div className="px-3 pb-6 pt-10 sm:px-6">
          <header className="mb-3 sm:mb-6">
            <h2 className="inline-block border-b-2 border-accent pb-1 text-xl font-bold text-neutral-900 sm:text-3xl sm:pb-2">
              {isSearch ? `Search results for “${initialQuery}”` : "All Products"}
            </h2>
            <p className="mt-1 hidden text-sm text-neutral-500 sm:block">
              {isSearch
                ? "Refine with the category, brand, and price filters below."
                : "Browse the complete DrivoraParts inventory."}
            </p>
          </header>
          {/* No <Suspense> and no useSearchParams() inside the feed. That
              combination put the feed in its own streamed Suspense island,
              and in production that island's HTML was delivered but never
              hydrated -- so its effects never ran, no products were ever
              fetched, and it sat on "Loading products..." forever for every
              visitor. The query now comes from the server as a prop, and
              `key` remounts the feed whenever it changes so a new search
              always starts from clean state. */}
          <AllProductsFeed
            key={`${initialQuery}|${initialCategory}`}
            initialQuery={initialQuery}
            initialCategory={initialCategory}
            initialData={initialData}
          />
        </div>

        {/* Still reachable, just below the listings rather than in front of
            them. Same set either way — someone who searched and someone who
            browsed both benefit from a way to keep looking. */}
        <CatalogVehicleFinderSection />
        <PopularCategoriesSection />
        <TrendingRail />
        {!isSearch ? (
          <>
            <SeasonalCollectionsSection />
            <RecentlyAddedRail />
            <StaffPicksSection />
          </>
        ) : null}
      </main>
    </>
  );
}
