import Link from "next/link";

import { MARKETS, type MarketKey } from "@/lib/catalog/markets";
import { routes } from "@/lib/inventory/routes";

/**
 * USA | AUSTRALIA | UK | WORLDWIDE | ALL PRODUCTS
 *
 * The same bar heads every view of the catalog, so moving between markets is
 * always one tap and nobody is shut inside one. "All products" sits apart
 * from the four because it is not a market: it is the catalog they are all
 * views of.
 *
 * On a phone the row wraps rather than scrolls. The four markets fit across
 * a 375px screen and All Products takes the line below, so every destination
 * is on screen at once -- a scrolling row would push whichever tab is current
 * off the edge. Taglines appear only where there is width for them.
 *
 * Plain links in a server component: no state, nothing to hydrate.
 */
export default function MarketSwitcher({
  active,
}: {
  active: MarketKey | "all";
}) {
  const tabClass = (current: boolean) =>
    `group block touch-manipulation border-b-2 pb-2.5 pt-1 transition-colors duration-[var(--motion-duration-fast)] sm:-mb-px ${
      current
        ? "border-accent-on-dark text-white"
        : "border-transparent text-neutral-400 hover:text-white"
    }`;

  const taglineClass = (current: boolean) =>
    `mt-1 hidden text-[11px] tracking-normal lg:block ${
      current ? "text-neutral-400" : "text-neutral-500 group-hover:text-neutral-400"
    }`;

  return (
    <nav aria-label="Shop by market">
      <ul className="flex flex-wrap gap-x-6 gap-y-1 sm:gap-x-8 sm:border-b sm:border-white/10">
        {MARKETS.map((market) => {
          const current = market.key === active;
          return (
            <li key={market.key}>
              <Link
                href={routes.market(market.key)}
                prefetch={false}
                aria-current={current ? "page" : undefined}
                className={tabClass(current)}
              >
                <span className="block text-[11px] font-bold uppercase tracking-[0.2em]">
                  {market.name}
                </span>
                <span className={taglineClass(current)}>{market.tagline}</span>
              </Link>
            </li>
          );
        })}

        <li className="sm:ml-auto">
          <Link
            href={routes.all}
            prefetch={false}
            aria-current={active === "all" ? "page" : undefined}
            className={tabClass(active === "all")}
          >
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em]">
              All products
            </span>
            <span className={taglineClass(active === "all")}>
              Search everything
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
