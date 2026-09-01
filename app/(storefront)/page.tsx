import Link from "next/link";
import HomeCategoryGrid from "@/components/home/HomeCategoryGrid";
import StarterPicksRail from "@/components/home/StarterPicksRail";
import HomeFeaturedRotator from "@/components/home/HomeFeaturedRotator";
import HomeTrustBadges from "@/components/home/HomeTrustBadges";
import ShopByVehicleSection from "@/components/home/ShopByVehicleSection";
import FeaturedBrandsStrip from "@/components/home/FeaturedBrandsStrip";
import GuidesPreviewSection from "@/components/home/GuidesPreviewSection";
import HomeHeroCinematic from "@/components/home/HomeHeroCinematic";
import VehiclePlatformGrid from "@/components/home/VehiclePlatformGrid";
import BuildStorySection from "@/components/home/BuildStorySection";
import GlobalReachBand from "@/components/home/GlobalReachBand";
import GarageClosingSection from "@/components/home/GarageClosingSection";
import TrendingRail from "@/components/catalog/TrendingRail";
import RecentlyAddedRail from "@/components/catalog/RecentlyAddedRail";
import {
  getFeaturedBatch,
  getFeaturedTimeSlot,
  getHomeFeaturedProductPool,
} from "@/lib/home/featured-products";
import { HOME_LISTING_COUNT } from "@/lib/home/listing-count";
import { routes } from "@/lib/inventory/routes";
import { buildPageMetadata, SITE_KEYWORDS } from "@/lib/seo";

export const revalidate = 600;

export const metadata = buildPageMetadata({
  title: "Performance Auto Parts & Truck Beds Marketplace",
  description:
    "Shop 1,400+ listings: rust-free truck beds, LS & JDM engine swaps, OME & Fox 4x4 lift kits, ARB bull bars, Safari snorkels, turbos, brakes & suspension. Secure crypto checkout with worldwide shipping.",
  path: "/",
  keywords: SITE_KEYWORDS,
});

export default function Home() {
  const listingCount = HOME_LISTING_COUNT;
  const featuredPool = getHomeFeaturedProductPool();
  const featuredProducts = getFeaturedBatch(featuredPool, getFeaturedTimeSlot());

  return (
    <div className="relative z-0 w-full min-w-0 max-w-full overflow-x-hidden bg-[var(--background)] text-neutral-900">
      <HomeHeroCinematic listingCount={listingCount} />

      {/* Vehicles before products: the page should say "we understand
          vehicles" before it says "we sell things". */}
      <VehiclePlatformGrid />

      <BuildStorySection />

      {/* Affordable stock first: checkout is crypto-only and irreversible, so a
          new visitor needs something they can risk before a $5,900 engine. */}
      <StarterPicksRail />

      <ShopByVehicleSection />

      {/* Category grid — priority interaction zone */}
      <section className="relative z-10 border-b border-neutral-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                Popular Categories
              </p>
              <h2 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
                Find the Right Parts for Every Build
              </h2>
            </div>
            <Link
              href="/catalog"
              prefetch={false}
              className="touch-manipulation text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
            >
              Full catalog →
            </Link>
          </div>

          <HomeCategoryGrid />
        </div>
      </section>

      {featuredProducts.length > 0 ? (
        <section className="relative z-10 border-b border-neutral-200 bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                  Curated from live inventory
                </p>
                <h2 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
                  Performance Picks
                </h2>
              </div>
              <Link
                href={routes.all}
                prefetch={false}
                className="touch-manipulation text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
              >
                View all →
              </Link>
            </div>

            <HomeFeaturedRotator
              pool={featuredPool}
              initialBatch={featuredProducts}
            />
          </div>
        </section>
      ) : null}

      {/* The dark reach band sits mid-shopping rather than after it. Once the
          build stories each gained their own product rail, everything from
          "Under $400" onward became one long pale scroll and the page stopped
          breathing. Placed here it splits that run near its middle, restoring
          the intended cadence -- editorial, shopping, editorial. */}
      <GlobalReachBand />

      <TrendingRail />

      <RecentlyAddedRail />

      {/* SeasonalCollectionsSection was removed from the homepage once each
          build story gained its own product rail: "Off-Road Essentials" and
          "Premium JDM Collection" pull the same categories (4x4-accessories,
          engine) as the off-roader and tourer rails a few sections above.
          The component still runs on /catalog/all, where nothing precedes it. */}

      <FeaturedBrandsStrip />

      <GuidesPreviewSection />

      <HomeTrustBadges />

      {/* The photography credits band that used to sit here has moved to
          /photography-credits, linked from the footer of every page. The
          licence data itself is untouched -- it is read from the same
          manifest as the images. The page closes on the artwork instead. */}
      <GarageClosingSection />
    </div>
  );
}
