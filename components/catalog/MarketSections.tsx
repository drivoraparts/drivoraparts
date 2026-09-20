import Link from "next/link";

import ProductRail from "./ProductRail";
import { getMarketSections, SECTION_ROW_SIZE } from "@/lib/catalog/sections";
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
 * The rows reuse the site's existing rail: snap scrolling with momentum on
 * touch, roughly two cards visible on a 375px screen so it is obvious the row
 * continues, a fade at the right edge on wider screens, and no page-level
 * horizontal scrolling anywhere.
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
  const sections = getMarketSections(market.key, vehicle?.key);
  if (sections.length === 0) return null;

  const base = routes.market(market.key);
  const scopeParam = vehicle ? `vehicle=${encodeURIComponent(vehicle.key)}&` : "";
  const scopeName = vehicle ? vehicleLabel(vehicle) : market.name;

  return (
    <>
      {/* Where the hero's vehicle chips land (#listings), so choosing a
          vehicle opens on that vehicle's rows rather than back at the top of
          the market -- on a phone the difference is a full screen. */}
      <div id="listings" className="scroll-mt-[112px] sm:scroll-mt-[122px]" />

      {sections.map((section, index) => (
        <ProductRail
          key={section.key}
          eyebrow={`${section.total.toLocaleString()} listing${section.total === 1 ? "" : "s"}`}
          title={section.label}
          description={section.blurb}
          products={section.products}
          viewAllHref={
            section.total > SECTION_ROW_SIZE
              ? `${base}?${scopeParam}section=${encodeURIComponent(section.key)}`
              : undefined
          }
          tone={index % 2 === 0 ? "light" : "muted"}
        />
      ))}

      <section className="border-b border-neutral-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">
              Everything in {scopeName}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              <span className="tabular-nums">{overview.total.toLocaleString()}</span>{" "}
              listings, with search, brand, budget and condition filters.
            </p>
          </div>
          <Link
            href={`${base}?${scopeParam}view=all`}
            prefetch={false}
            className="group inline-flex shrink-0 touch-manipulation items-center gap-1.5 text-sm font-semibold text-accent transition-colors duration-[var(--motion-duration-fast)] hover:text-accent-hover"
          >
            Browse all listings
            <span
              aria-hidden="true"
              className="transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
