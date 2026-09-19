import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import MarketSelector from "@/components/catalog/MarketSelector";
import MarketplaceSearch from "@/components/catalog/MarketplaceSearch";
import PopularCategoriesSection from "@/components/catalog/PopularCategoriesSection";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { getAllProducts, routes } from "@/lib/inventory";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  SITE_KEYWORDS,
} from "@/lib/seo";

export const dynamic = "force-static";

const DESCRIPTION =
  "Shop DrivoraParts by market: trucks, diesel and performance for the USA, 4WDs and utes for Australia, 4x4s and European performance for the UK, and the complete catalog, shipped worldwide.";

export const metadata: Metadata = buildPageMetadata({
  title: "Shop Parts by Market",
  description: DESCRIPTION,
  path: routes.catalog,
  keywords: SITE_KEYWORDS,
});

const delay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

/**
 * Shop Parts: the catalog's front door.
 *
 * Four ways in, then everything. The markets are not stores -- each is a
 * view of the one catalog -- so the page ends on All Products and the full
 * category index, and nobody has to choose a market to reach a part.
 *
 * This page used to be a bare grid of category names. The categories are
 * still here, under the markets, as the richer index /catalog/all uses.
 */
export default function Page() {
  const productCount = getAllProducts().length;

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([{ name: "Catalog", path: routes.catalog }]),
          collectionPageJsonLd("Shop Parts by Market", DESCRIPTION, routes.catalog),
        ]}
      />
      <main className="min-h-screen bg-white text-neutral-900">
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
              Shop Parts
            </p>
            <h1
              className="rise-in mt-4 max-w-3xl text-[2rem] font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              style={delay(60)}
            >
              Start where you build.
            </h1>
            <p
              className="rise-in mt-5 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base"
              style={delay(120)}
            >
              4WDs and utes across Australia. Trucks and performance across
              the USA. 4x4s and performance across the UK. Builds everywhere.
            </p>

            <div className="rise-in mt-10 sm:mt-12" style={delay(180)}>
              <MarketSelector />
            </div>

            {/* The catalog every market is a view of, with the search that
                covers all of it. Full width under the plates, because it is
                what they add up to rather than a fifth market. */}
            <div
              className="rise-in mt-3 rounded-[3px] border border-white/10 bg-white/[0.02] p-5 sm:p-6"
              style={delay(240)}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
                  All products
                  <span className="ml-3 text-[11px] font-normal normal-case tracking-normal text-neutral-500">
                    <span className="tabular-nums">{productCount.toLocaleString()}</span>{" "}
                    listings
                  </span>
                </h2>
                <Link
                  href={routes.all}
                  prefetch={false}
                  className="group inline-flex touch-manipulation items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors duration-[var(--motion-duration-fast)] hover:text-accent-on-dark"
                >
                  Browse everything
                  <span
                    aria-hidden="true"
                    className="text-accent-on-dark transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </div>
              <div className="mt-4">
                <MarketplaceSearch />
              </div>
            </div>
          </div>
        </section>

        <PopularCategoriesSection />
      </main>
    </>
  );
}
