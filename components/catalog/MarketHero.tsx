import type { CSSProperties } from "react";
import Link from "next/link";

import MarketSwitcher from "./MarketSwitcher";
import { vehicleLabel, type MarketOverview } from "@/lib/catalog/markets";
import { routes } from "@/lib/inventory/routes";

const delay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

/**
 * The head of a market view: which market this is, what it covers, and the
 * vehicles it can actually serve.
 *
 * Same ground as the marketplace intro (CatalogHero) -- the blueprint grid,
 * no photograph -- so a market reads as a view of the one catalog rather than
 * a separate shop. Regional identity is carried by type alone: the name, its
 * three-word tagline and the vehicles themselves. No flags; the vehicles say
 * more about a market than its colours do.
 *
 * VEHICLES ARE LINKS, NOT STATE
 * Choosing one navigates to ?vehicle=, and the page renders that vehicle's
 * listings on the server, opening at them rather than back up here. The URL
 * can be shared, the choice survives a reload, and it works before the page
 * has hydrated. Only vehicles with
 * enough listings to be worth a tap are offered (MIN_VEHICLE_LISTINGS); every
 * count is the real number of listings.
 *
 * Motion is the shared .rise-in entrance -- transform only, so a stalled
 * animation can never leave any of this hidden.
 */
export default function MarketHero({ overview }: { overview: MarketOverview }) {
  const { market, vehicle, groups } = overview;
  const base = routes.market(market.key);
  const regional = market.groups.length > 0;

  return (
    <section className="relative isolate overflow-hidden border-b border-neutral-800 bg-neutral-950 text-white">
      <div
        aria-hidden="true"
        className="blueprint-ground blueprint-fade pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-7 lg:px-8">
        <MarketSwitcher active={market.key} />

        <div className="mt-10 sm:mt-14">
          <p
            className="rise-in text-[11px] font-bold uppercase tracking-[0.28em] text-accent-on-dark"
            style={delay(0)}
          >
            <span className="tabular-nums">{market.index}</span>
            <span aria-hidden="true" className="mx-2 text-neutral-600">
              /
            </span>
            {regional ? "Market" : "The global catalog"}
          </p>

          <h1 className="rise-in mt-4" style={delay(60)}>
            <span className="block text-[2.75rem] font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              {market.name}
            </span>
            <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.24em] text-neutral-300 sm:text-sm">
              {market.tagline}
            </span>
          </h1>

          <p
            className="rise-in mt-5 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base"
            style={delay(120)}
          >
            {market.summary}{" "}
            <span className="text-neutral-300">
              <span className="font-semibold tabular-nums text-white">
                {overview.marketTotal.toLocaleString()}
              </span>{" "}
              {regional
                ? "listings, matched by the vehicle each one names."
                : "listings: everything in the catalog."}
            </span>
          </p>
        </div>

        {groups.length > 0 ? (
          <div className="rise-in mt-10 sm:mt-12" style={delay(180)}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                Choose your vehicle
              </h2>
              {vehicle ? (
                <Link
                  href={`${base}#listings`}
                  prefetch={false}
                  className="shrink-0 touch-manipulation text-xs font-semibold text-neutral-400 transition-colors duration-[var(--motion-duration-fast)] hover:text-white"
                >
                  All {market.name} vehicles
                </Link>
              ) : null}
            </div>

            <div className="mt-4 space-y-5">
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
                    {group.label}
                  </p>
                  <ul className="mt-2.5 flex flex-wrap gap-2">
                    {group.vehicles.map(({ vehicle: item, count }) => {
                      const selected = item.key === vehicle?.key;
                      return (
                        <li key={item.key}>
                          <Link
                            // Pressing the chosen vehicle again lets go of it.
                            // Either way the page opens at the listings the
                            // choice was for (#listings, see MarketCatalogView).
                            href={
                              selected
                                ? `${base}#listings`
                                : `${base}?vehicle=${encodeURIComponent(item.key)}#listings`
                            }
                            prefetch={false}
                            aria-current={selected ? "true" : undefined}
                            className={`inline-flex touch-manipulation items-baseline gap-1.5 rounded-[2px] border px-3 py-2 text-[13px] transition-[color,border-color,background-color] duration-[var(--motion-duration-fast)] ${
                              selected
                                ? "border-accent-on-dark bg-accent-on-dark/15 text-white"
                                : "border-white/15 bg-white/[0.03] text-neutral-200 hover:border-accent-on-dark/60 hover:bg-white/[0.07] hover:text-white"
                            }`}
                          >
                            {item.make ? (
                              <span className={selected ? "text-neutral-300" : "text-neutral-500"}>
                                {item.make}
                              </span>
                            ) : null}
                            <span className="font-semibold">{item.model}</span>
                            <span
                              className={`ml-1 text-[11px] tabular-nums ${
                                selected ? "text-accent-on-dark" : "text-neutral-500"
                              }`}
                            >
                              {count.toLocaleString()}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-7 max-w-2xl text-xs leading-relaxed text-neutral-500">
              A part appears here when its own listing names the vehicle. Check
              the fitment on the product page before ordering. Parts that fit
              any vehicle, like winches and air compressors, are in{" "}
              <Link
                href={routes.market("worldwide")}
                prefetch={false}
                className="font-semibold text-neutral-300 underline decoration-neutral-600 underline-offset-2 transition-colors duration-[var(--motion-duration-fast)] hover:text-white"
              >
                Worldwide
              </Link>
              .
              {vehicle?.hub ? (
                <>
                  {" "}
                  <Link
                    href={`/vehicles/${vehicle.hub}`}
                    prefetch={false}
                    className="font-semibold text-neutral-300 underline decoration-neutral-600 underline-offset-2 transition-colors duration-[var(--motion-duration-fast)] hover:text-white"
                  >
                    {vehicleLabel(vehicle)} generations and fitment
                  </Link>
                  .
                </>
              ) : null}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
