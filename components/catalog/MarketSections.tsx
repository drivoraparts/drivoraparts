import CatalogSectionRails from "./CatalogSectionRails";
import { getCatalogSections } from "@/lib/catalog/sections";
import { vehicleLabel, type MarketOverview } from "@/lib/catalog/markets";
import { routes } from "@/lib/inventory/routes";

/**
 * A market as rows of parts rather than one endless grid.
 *
 * Each row is a system that market actually buys, built from listings in the
 * current scope -- the market, or one of its vehicles when the visitor has
 * chosen one. Rows are dropped rather than padded when the stock is not
 * there, so a market with nothing to say about winches says nothing about
 * winches (see lib/catalog/sections.ts).
 *
 * The rows themselves are CatalogSectionRails, which /catalog/all also uses.
 * What is left here is the part that is specific to a market: which scope to
 * build, where "View all" points, and what the closing band says.
 *
 * "View all" opens that section in the grid below, narrowed by the same rule
 * the row was built from, and the band at the end goes to the whole market.
 */
export default function MarketSections({
  overview,
}: {
  overview: MarketOverview;
}) {
  const { market, vehicle } = overview;
  const sections = getCatalogSections(market.key, vehicle?.key);
  if (sections.length === 0) return null;

  const base = routes.market(market.key);
  const scopeParam = vehicle ? `vehicle=${encodeURIComponent(vehicle.key)}&` : "";
  const scopeName = vehicle ? vehicleLabel(vehicle) : market.name;

  return (
    <CatalogSectionRails
      sections={sections}
      viewAllHref={(section) =>
        `${base}?${scopeParam}section=${encodeURIComponent(section.key)}`
      }
      closing={{
        title: `Everything in ${scopeName}`,
        detail: (
          <>
            <span className="tabular-nums">
              {overview.total.toLocaleString()}
            </span>{" "}
            listings, with search, brand, budget and condition filters.
          </>
        ),
        href: `${base}?${scopeParam}view=all`,
        cta: "Browse all listings",
      }}
    />
  );
}
