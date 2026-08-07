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

export const revalidate = 600;

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
        <PopularCategoriesSection />
        <SeasonalCollectionsSection />
        <Suspense fallback={null}>
          <TrendingRail />
        </Suspense>
        <RecentlyAddedRail />
        <StaffPicksSection />
        <CatalogVehicleFinderSection />

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
