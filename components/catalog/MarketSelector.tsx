import Link from "next/link";

import { MARKETS, getMarketOverview } from "@/lib/catalog/markets";
import { routes } from "@/lib/inventory/routes";

/** Systems listed on the Worldwide plate. The market page has all of them. */
const WORLDWIDE_SYSTEMS_SHOWN = 8;

/**
 * The four ways in, as plates.
 *
 * Each plate says what the market is for in three words and then shows what
 * it holds: the vehicles it can serve, grouped the way its tagline reads
 * (trucks and engines, 4WDs and utes, 4x4s and European), and the real number
 * of listings behind it. Worldwide lists systems instead of vehicles because
 * it is the whole catalog.
 *
 * Type on the drafting ground, no photography: a photograph could honestly
 * represent the USA and Australia plates, but the catalog has nothing to show
 * for a UK vehicle that the Australian plate would not already show, and four
 * plates where one is mute read as a gap. Identity comes from the words.
 *
 * Every name and count comes from lib/catalog/markets.ts at render, so a
 * vehicle only appears here once the catalog has listings for it.
 */
export default function MarketSelector() {
  const overviews = MARKETS.map((market) => getMarketOverview(market));

  return (
    // Four across only from xl. At 1024px a quarter of the container is
    // narrower than "AUSTRALIA" set at plate size, so below xl the plates sit
    // two by two, which also gives each vehicle list room to breathe.
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {overviews.map((overview) => {
        const { market } = overview;
        const href = routes.market(market.key);

        const lists =
          overview.groups.length > 0
            ? overview.groups.map((group) => ({
                label: group.label,
                items: group.vehicles.map(({ vehicle }) => ({
                  key: vehicle.key,
                  label: vehicle.model,
                  href: `${href}?vehicle=${encodeURIComponent(vehicle.key)}`,
                })),
              }))
            : [
                {
                  label: "Systems",
                  items: overview.categories
                    .slice(0, WORLDWIDE_SYSTEMS_SHOWN)
                    .map((category) => ({
                      key: category.slug,
                      label: category.name,
                      href: `${href}?category=${encodeURIComponent(category.slug)}`,
                    })),
                },
              ];

        return (
          <li key={market.key} className="min-w-0">
            <article className="group/plate flex h-full flex-col rounded-[3px] border border-white/10 bg-white/[0.02] p-5 transition-[border-color,background-color] duration-[var(--motion-duration-fast)] hover:border-white/25 hover:bg-white/[0.04] sm:p-6">
              <div className="flex items-baseline justify-between gap-3 text-[11px] tabular-nums">
                <span className="font-bold tracking-[0.2em] text-neutral-600">
                  {market.index}
                </span>
                <span className="text-neutral-500">
                  {overview.marketTotal.toLocaleString()} listings
                </span>
              </div>

              {/* Sized per breakpoint so the longest names -- AUSTRALIA,
                  WORLDWIDE -- always fit the plate they are on. */}
              <h2 className="mt-5 text-3xl font-bold uppercase leading-none tracking-tight sm:mt-7 sm:text-[2rem] md:text-[2.5rem] xl:text-[1.875rem]">
                <Link
                  href={href}
                  prefetch={false}
                  className="touch-manipulation transition-colors duration-[var(--motion-duration-fast)] hover:text-accent-on-dark"
                >
                  {market.name}
                </Link>
              </h2>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-on-dark">
                {market.tagline}
              </p>

              <div className="mt-6 space-y-3">
                {lists.map((list) => (
                  <div key={list.label}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
                      {list.label}
                    </p>
                    {/* Each name and its trailing dot are held together, and
                        the space after them is the only place a line can
                        break -- so no line ever starts with a stranded dot,
                        and no name splits across two lines. */}
                    <ul className="mt-1.5 text-[13px] leading-relaxed text-neutral-300">
                      {list.items.map((item, i) => (
                        <li key={item.key} className="inline">
                          <span className="whitespace-nowrap">
                            <Link
                              href={item.href}
                              prefetch={false}
                              className="touch-manipulation transition-colors duration-[var(--motion-duration-fast)] hover:text-white"
                            >
                              {item.label}
                            </Link>
                            {i < list.items.length - 1 ? (
                              <span aria-hidden="true" className="ml-1.5 text-neutral-700">
                                ·
                              </span>
                            ) : null}
                          </span>{" "}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <Link
                href={href}
                prefetch={false}
                className="mt-auto inline-flex touch-manipulation items-center gap-2 pt-7 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors duration-[var(--motion-duration-fast)] hover:text-accent-on-dark"
              >
                Shop {market.name}
                <span
                  aria-hidden="true"
                  className="text-accent-on-dark transition-transform duration-[var(--motion-duration-fast)] group-hover/plate:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
