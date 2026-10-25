import { categories } from "@/lib/inventory/categories";
import { routes } from "@/lib/inventory/routes";
import {
  getMarket,
  getMarketOverview,
  vehicleLabel,
  MARKETS,
  MIN_VEHICLE_LISTINGS,
  type MarketKey,
} from "@/lib/catalog/markets";
import { queryCatalog } from "@/lib/catalog/query";
import { getCatalogSections, getSection } from "@/lib/catalog/sections";

/**
 * Which catalog URLs are pages in their own right.
 *
 * A market or /catalog/all page filtered by vehicle, system or category used to
 * canonicalise to its unfiltered parent, so Search Console reported every
 * filtered URL as "Alternate page with proper canonical tag". These views are
 * now indexable on their own: each one canonicalises to itself, in one fixed
 * parameter order, so ?section=x&vehicle=y and ?vehicle=y&section=x are the
 * same page.
 *
 * A view is only indexable when it has real stock (MIN_VIEW_LISTINGS), so
 * nothing thin is offered to Google. Free-text search (?q=) is never a page of
 * its own: it canonicalises to the view it searches inside, and is noindexed.
 */

export const MIN_VIEW_LISTINGS = MIN_VEHICLE_LISTINGS;

export type CatalogViewScope = MarketKey | "all";

export type CatalogViewInput = {
  scope: CatalogViewScope;
  vehicle?: string;
  section?: string;
  category?: string;
  q?: string;
};

export type CatalogView = {
  /** Canonical path, query string included. */
  path: string;
  /** Short description of the narrowing, for titles ("Ford F-150 Exhaust"). */
  heading: string | null;
  indexable: boolean;
};

function basePath(scope: CatalogViewScope): string {
  return scope === "all" || scope === "worldwide" ? routes.all : routes.market(scope);
}

export function resolveCatalogView(input: CatalogViewInput): CatalogView {
  const scope = input.scope;
  const market = scope === "all" ? undefined : getMarket(scope);
  const regional = Boolean(market && market.groups.length > 0);

  const vehicle =
    market && regional
      ? getMarketOverview(market, input.vehicle).vehicle
      : undefined;
  const section = getSection(input.section);
  const category =
    !section && categories.some((c) => c.slug === input.category)
      ? input.category
      : undefined;

  // The whole-catalogue scopes already have a page per category.
  if (!regional && category) {
    return { path: routes.category(category), heading: null, indexable: !input.q };
  }

  const params: string[] = [];
  if (vehicle) params.push(`vehicle=${encodeURIComponent(vehicle.key)}`);
  if (section) params.push(`section=${encodeURIComponent(section.key)}`);
  if (category) params.push(`category=${encodeURIComponent(category)}`);

  const path = basePath(scope) + (params.length ? `?${params.join("&")}` : "");
  const categoryName = categories.find((c) => c.slug === category)?.name;
  const heading =
    [vehicle ? vehicleLabel(vehicle) : null, section?.label ?? categoryName ?? null]
      .filter(Boolean)
      .join(" ") || null;

  if (input.q || params.length === 0) {
    return { path, heading, indexable: !input.q };
  }

  const { total } = queryCatalog({
    page: 1,
    limit: 1,
    category,
    section: section?.key,
    market: market?.key,
    vehicle: vehicle?.key,
  });
  return { path, heading, indexable: total >= MIN_VIEW_LISTINGS };
}

/** Every filtered view worth submitting in the sitemap. */
export function indexableCatalogViewPaths(): string[] {
  const paths = new Set<string>();
  const consider = (input: CatalogViewInput) => {
    const view = resolveCatalogView(input);
    if (view.indexable && view.path.includes("?")) paths.add(view.path);
  };

  for (const market of MARKETS) {
    if (market.groups.length === 0) continue;
    const overview = getMarketOverview(market);
    const vehicles = overview.groups.flatMap((g) => g.vehicles.map((v) => v.vehicle.key));
    for (const c of overview.categories) consider({ scope: market.key, category: c.slug });
    for (const s of getCatalogSections(market.key)) {
      consider({ scope: market.key, section: s.key });
    }
    for (const vehicle of vehicles) {
      consider({ scope: market.key, vehicle });
      for (const c of getMarketOverview(market, vehicle).categories) {
        consider({ scope: market.key, vehicle, category: c.slug });
      }
      for (const s of getCatalogSections(market.key, vehicle)) {
        consider({ scope: market.key, vehicle, section: s.key });
      }
    }
  }
  for (const s of getCatalogSections("all")) consider({ scope: "all", section: s.key });
  return [...paths];
}
