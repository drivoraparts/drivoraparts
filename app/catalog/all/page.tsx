import type { Metadata } from "next";
import { Suspense } from "react";
import AllProductsFeed from "@/components/catalog/AllProductsFeed";
import CatalogHero from "@/components/catalog/CatalogHero";
import PopularCategoriesSection from "@/components/catalog/PopularCategoriesSection";
import SeasonalCollectionsSection from "@/components/catalog/SeasonalCollectionsSection";
import TrendingRail from "@/components/catalog/TrendingRail";
import RecentlyAddedRail from "@/components/catalog/RecentlyAddedRail";
import StaffPicksSection from "@/components/catalog/StaffPicksSection";
import CatalogVehicleFinderSection from "@/components/catalog/CatalogVehicleFinderSection";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { routes } from "@/lib/inventory";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  collectionPageJsonLd,
} from "@/lib/seo";

// Was `revalidate = 600` (ISR). AllProductsFeed's useSearchParams() forces a
// dynamic hole inside this otherwise-cached page -- the CDN edge/ISR layer
// serves the cached static shell instantly and is supposed to stream that
// hole in fresh per request, but that combination can leave the Suspense
// boundary stuck on its "Loading products..." fallback forever for
// cache-served requests, independent of device, browser, or what was
// searched. force-dynamic renders the whole page fresh every time, so that
// boundary always resolves the same way it does on an uncached first visit.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "All Performance Parts",
  description:
    "Browse every listing on DrivoraParts — engines, turbos, brakes, suspension, electronics, lighting, body kits, interior, aftermarket, and more.",
  path: routes.all,
});

export default function AllProductsPage() {
  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Catalog", path: routes.catalog },
            { name: "All Products", path: routes.all },
          ]),
          collectionPageJsonLd(
            "All Performance Parts",
            "Complete marketplace feed of performance automotive parts and upgrades.",
            routes.all
          ),
        ]}
      />
      <main className="min-h-screen bg-white text-neutral-900">
        <CatalogHero />
        <CatalogVehicleFinderSection />
        <PopularCategoriesSection />
        <SeasonalCollectionsSection />
        <TrendingRail />
        <RecentlyAddedRail />
        <StaffPicksSection />

        <div className="px-3 pb-6 pt-10 sm:px-6">
          <header className="mb-3 sm:mb-6">
            <h2 className="inline-block border-b-2 border-red-600 pb-1 text-xl font-bold text-neutral-900 sm:text-3xl sm:pb-2">
              Browse Everything
            </h2>
            <p className="mt-1 hidden text-sm text-neutral-500 sm:block">
              Every listing in the marketplace, filterable by category, brand, and price.
            </p>
          </header>
          <Suspense fallback={<p className="text-sm text-gray-500">Loading products…</p>}>
            <AllProductsFeed />
          </Suspense>
        </div>
      </main>
    </>
  );
}
