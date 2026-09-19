import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AllProductsFeed from "./AllProductsFeed";
import MarketHero from "./MarketHero";
import JsonLdScript from "@/components/seo/JsonLdScript";
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

  // Page one rendered into the HTML, exactly as /catalog/all does, through
  // the same query the feed calls for every page after it.
  const initialData = queryCatalog({
    page: 1,
    limit: CATALOG_DEFAULT_LIMIT,
    q: query,
    category,
    market: market.key,
    vehicle: vehicle?.key,
  });

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
            </p>
            <h2 className="mt-1 inline-block border-b-2 border-accent pb-1 text-xl font-bold text-neutral-900 sm:pb-2 sm:text-3xl">
              {query ? `Results for “${query}”` : scopeName}
            </h2>
            <p className="mt-1 hidden text-sm text-neutral-500 sm:block">
              {query
                ? `Searching ${vehicle ? vehicleLabel(vehicle) : market.name} listings only. All Products searches everything.`
                : "Narrow by system, brand, budget or condition, or search within these listings."}
            </p>
          </header>

          {/* Remounted whenever the scope changes, so a new vehicle or search
              always starts from clean state -- the same reason /catalog/all
              keys its feed. */}
          <AllProductsFeed
            key={`${market.key}|${vehicle?.key ?? ""}|${query}|${category}`}
            market={market.key}
            vehicle={vehicle?.key}
            initialQuery={query}
            initialCategory={category}
            initialData={initialData}
            categoryShortcuts={overview.categories.map(({ slug, name }) => ({
              slug,
              name,
            }))}
          />
        </div>
      </main>
    </>
  );
}
