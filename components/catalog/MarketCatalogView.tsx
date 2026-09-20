import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import AllProductsFeed from "./AllProductsFeed";
import MarketHero from "./MarketHero";
import MarketSections from "./MarketSections";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { getSection } from "@/lib/catalog/sections";
import {
  getMarket,
  getMarketOverview,
  vehicleLabel,
  type MarketKey,
} from "@/lib/catalog/markets";
import { CATALOG_DEFAULT_LIMIT, queryCatalog } from "@/lib/catalog/query";
import { routes } from "@/lib/inventory/routes";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  collectionPageJsonLd,
} from "@/lib/seo";

/**
 * One market view: /catalog/usa, /australia, /uk and /worldwide all render
 * this, each with its own key.
 *
 * It is /catalog/all with a market applied -- the same feed, the same query,
 * the same filters, search and paging -- under a head that says which market
 * this is and what it can serve. Nothing here holds products of its own.
 */

export type MarketPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const param = (value: string | string[] | undefined) =>
  typeof value === "string" ? value.trim() : "";

/**
 * The address search engines should treat as the page.
 *
 * Vehicle, system and search all live in the query string, and every one of
 * those views canonicalises to its market: four pages to index, not four
 * times every combination. Worldwide lists exactly what /catalog/all lists,
 * so it points there rather than competing with it.
 */
function canonicalPath(key: MarketKey): string {
  return key === "worldwide" ? routes.all : routes.market(key);
}

export function marketMetadata(key: MarketKey): Metadata {
  const market = getMarket(key);
  if (!market) return buildPageMetadata({ title: "Catalog", path: routes.catalog });

  return buildPageMetadata({
    title: market.seoTitle,
    description: market.seoDescription,
    path: canonicalPath(key),
  });
}

export default async function MarketCatalogView({
  marketKey,
  searchParams,
}: {
  marketKey: MarketKey;
  searchParams: MarketPageProps["searchParams"];
}) {
  const market = getMarket(marketKey);
  if (!market) notFound();

  const params = await searchParams;

  // Only a vehicle this market actually offers is honoured; anything else in
  // the URL falls back to the whole market rather than an empty page.
  const overview = getMarketOverview(market, param(params.vehicle));
  const vehicle = overview.vehicle;
  const query = param(params.q);
  const requestedCategory = param(params.category);
  const category = overview.categories.some((c) => c.slug === requestedCategory)
    ? requestedCategory
    : "";
  const section = getSection(param(params.section));

  /*
   * Rows or grid.
   *
   * A market opens as rows of systems -- that is the point of the page. The
   * grid is what a choice leads to: a section's "View all", a category chip,
   * a search, or "Browse all listings" (view=all). Both are this same feed
   * and this same catalogue either way.
   */
  const showGrid = Boolean(query || category || section || param(params.view) === "all");

  // Page one rendered into the HTML, exactly as /catalog/all does, through
  // the same query the feed calls for every page after it.
  const initialData = showGrid
    ? queryCatalog({
        page: 1,
        limit: CATALOG_DEFAULT_LIMIT,
        q: query,
        category,
        section: section?.key,
        market: market.key,
        vehicle: vehicle?.key,
      })
    : undefined;

  const regional = market.groups.length > 0;
  const scopeName = vehicle
    ? vehicleLabel(vehicle)
    : regional
      ? `All ${market.name} vehicles`
      : "Every system";

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Catalog", path: routes.catalog },
            { name: market.name, path: canonicalPath(market.key) },
          ]),
          collectionPageJsonLd(
            market.seoTitle,
            market.seoDescription,
            canonicalPath(market.key)
          ),
        ]}
      />
      <main className="min-h-screen bg-white text-neutral-900">
        <MarketHero overview={overview} />

        {showGrid ? (
          <div className="px-3 pb-6 pt-10 sm:px-6">
            {/* The vehicle chips link here (#listings). Choosing a vehicle
                reloads the page, and without this it reopened at the top: on a
                phone that is the market head again, with the listings the tap
                was for a full screen below. The margin clears the sticky site
                header, the same 106/114px the feed's filter bar sticks under. */}
            <header
              id="listings"
              className="mb-3 scroll-mt-[112px] sm:mb-6 sm:scroll-mt-[122px]"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                {market.name}
                {vehicle ? ` · ${vehicleLabel(vehicle)}` : ""}
              </p>
              <h2 className="mt-1 inline-block border-b-2 border-accent pb-1 text-xl font-bold text-neutral-900 sm:pb-2 sm:text-3xl">
                {query ? `Results for “${query}”` : (section?.label ?? scopeName)}
              </h2>
              <p className="mt-1 hidden text-sm text-neutral-500 sm:block">
                {query
                  ? `Searching ${vehicle ? vehicleLabel(vehicle) : market.name} listings only. All Products searches everything.`
                  : "Narrow by system, brand, budget or condition, or search within these listings."}
              </p>
              {regional ? (
                <p className="mt-2 text-sm">
                  <Link
                    href={
                      vehicle
                        ? `${routes.market(market.key)}?vehicle=${encodeURIComponent(vehicle.key)}`
                        : routes.market(market.key)
                    }
                    prefetch={false}
                    className="font-semibold text-accent transition-colors duration-[var(--motion-duration-fast)] hover:text-accent-hover"
                  >
                    ← Back to {vehicle ? vehicleLabel(vehicle) : market.name} sections
                  </Link>
                </p>
              ) : null}
            </header>

            {/* Remounted whenever the scope changes, so a new vehicle, section
                or search always starts from clean state -- the same reason
                /catalog/all keys its feed. */}
            <AllProductsFeed
              key={`${market.key}|${vehicle?.key ?? ""}|${query}|${category}|${section?.key ?? ""}`}
              market={market.key}
              vehicle={vehicle?.key}
              section={section?.key}
              initialQuery={query}
              initialCategory={category}
              initialData={initialData}
              categoryShortcuts={
                section
                  ? undefined
                  : overview.categories.map(({ slug, name }) => ({ slug, name }))
              }
            />
          </div>
        ) : (
          <MarketSections overview={overview} />
        )}
      </main>
    </>
  );
}
