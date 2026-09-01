import type { CSSProperties } from "react";
import Link from "next/link";

import CountUp from "@/components/motion/CountUp";
import MarketplaceSearch from "./MarketplaceSearch";
import { categories } from "@/lib/inventory/categories";
import { getAllProducts } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";

/**
 * The marketplace intro.
 *
 * The job of this section is to answer one question before the visitor has
 * scrolled: this is where I find my part. So it states what the place is, how
 * much is in it, and hands over a search box -- in that order, and then stops.
 *
 * WHY THERE IS NO PHOTOGRAPH HERE
 * A hero image behind this much type either competes with the words or has to
 * be dimmed so far that it stops being worth its bytes, and a generic engine
 * bay would be stock imagery picked to look impressive rather than to mean
 * anything -- which is the one thing the imagery rule for this catalog
 * forbids. The ground is a CSS drafting grid instead: no image request, no
 * layout cost, and it reads as a measuring surface rather than decoration.
 * Photography belongs where it identifies something specific -- a category, a
 * vehicle, a collection -- not behind a heading.
 *
 * MOTION
 * The entrance is CSS (see .rise-in), so it cannot leave anything hidden: the
 * end of every keyframe is the element's natural state, and reduced motion
 * collapses the durations sitewide. The count is the one piece of JavaScript,
 * and it renders the true figure first and animates only if it can do so
 * without the number appearing to jump backwards.
 *
 * Nothing here delays reaching the products. The grid is directly below this
 * section and is server-rendered, so it is on screen at the same instant.
 */

// Eight of the fourteen systems: the ones people arrive naming. The complete
// set is the category section further down -- this is a shortcut, not a menu.
const QUICK_CATEGORY_SLUGS = [
  "engine",
  "transmission",
  "turbocharger",
  "suspension",
  "brakes",
  "body-parts",
  "lighting",
  "wheels-tires",
];

/** Stagger, in ms. Short enough to read as one movement, not a sequence. */
const CHIP_STAGGER = 25;
const CHIP_BASE_DELAY = 220;

const delay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

export default function CatalogHero({
  initialQuery = "",
}: {
  /**
   * Prefills the search box. Empty in practice today, because this section is
   * only rendered when there is no query -- a results page keeps the feed's
   * own prefilled input as its search rather than showing a second box with
   * the same text in it. Kept because the value belongs to the control, not
   * to the one caller that currently has nothing to put in it.
   */
  initialQuery?: string;
}) {
  const productCount = getAllProducts().length;
  const quickCategories = categories.filter((c) =>
    QUICK_CATEGORY_SLUGS.includes(c.slug)
  );

  return (
    <section className="relative isolate overflow-hidden border-b border-neutral-800 bg-neutral-950 text-white">
      <div
        aria-hidden="true"
        className="blueprint-ground blueprint-fade pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <p
          className="rise-in text-[11px] font-bold uppercase tracking-[0.28em] text-accent-on-dark"
          style={delay(0)}
        >
          The Marketplace
        </p>

        <h1
          className="rise-in mt-4 max-w-3xl text-[2rem] font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          style={delay(60)}
        >
          Explore Every Build-Ready Part
        </h1>

        <p
          className="rise-in mt-5 max-w-xl text-sm leading-relaxed text-neutral-300 sm:text-base"
          style={delay(120)}
        >
          <CountUp
            value={productCount}
            className="font-semibold tabular-nums text-white"
          />
          <span className="font-semibold text-white">+</span> listings across
          engines, transmissions, suspension, brakes and more — what you see is
          what you get.
        </p>

        <div className="rise-in mt-8" style={delay(180)}>
          <MarketplaceSearch defaultValue={initialQuery} />
        </div>

        <nav aria-label="Browse by system" className="mt-9">
          <p
            className="rise-in text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500"
            style={delay(CHIP_BASE_DELAY - 40)}
          >
            Jump to a system
          </p>

          <ul className="catalog-chip-row mt-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
            {quickCategories.map((cat, index) => (
              <li
                key={cat.slug}
                className="rise-in shrink-0"
                style={delay(CHIP_BASE_DELAY + index * CHIP_STAGGER)}
              >
                <Link
                  href={routes.category(cat.slug)}
                  prefetch={false}
                  className="group inline-flex touch-manipulation items-center gap-2 rounded-[2px] border border-white/15 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-neutral-200 transition-[color,border-color,background-color] duration-[var(--motion-duration-fast)] hover:border-accent-on-dark/60 hover:bg-white/[0.07] hover:text-white"
                >
                  {cat.name}
                  <span
                    aria-hidden="true"
                    className="translate-x-0 text-neutral-600 transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5 group-hover:text-accent-on-dark"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
