import Link from "next/link";
import HomeCategoryGrid from "@/components/home/HomeCategoryGrid";
import HomeFeaturedRotator from "@/components/home/HomeFeaturedRotator";
import HomeTrustBadges from "@/components/home/HomeTrustBadges";
import CinematicLifestyleSection from "@/components/home/CinematicLifestyleSection";
import ShopByVehicleSection from "@/components/home/ShopByVehicleSection";
import FeaturedBrandsStrip from "@/components/home/FeaturedBrandsStrip";
import WhyDrivoraSection from "@/components/home/WhyDrivoraSection";
import HomeStatsBand from "@/components/home/HomeStatsBand";
import GuidesPreviewSection from "@/components/home/GuidesPreviewSection";
import HomeStatementBanner from "@/components/home/HomeStatementBanner";
import ScrollReveal from "@/components/home/ScrollReveal";
import TrendingRail from "@/components/catalog/TrendingRail";
import RecentlyAddedRail from "@/components/catalog/RecentlyAddedRail";
import SeasonalCollectionsSection from "@/components/catalog/SeasonalCollectionsSection";
import {
  getFeaturedBatch,
  getFeaturedTimeSlot,
  getHomeFeaturedProductPool,
} from "@/lib/home/featured-products";
import { HOME_LISTING_COUNT } from "@/lib/home/listing-count";
import { routes } from "@/lib/inventory/routes";
import { directAssetUrl } from "@/lib/media/optimize-image";
import { buildPageMetadata, SITE_KEYWORDS } from "@/lib/seo";

const HERO_IMAGE = "/home/hero-1280.webp";

export const revalidate = 600;

export const metadata = buildPageMetadata({
  title: "Performance Auto Parts & Truck Beds Marketplace",
  description:
    "Shop 1,400+ listings: rust-free truck beds, LS & JDM engine swaps, OME & Fox 4x4 lift kits, ARB bull bars, Safari snorkels, turbos, brakes & suspension. Secure crypto checkout with worldwide shipping.",
  path: "/",
  keywords: SITE_KEYWORDS,
});

export default function Home() {
  const heroSrc = directAssetUrl(HERO_IMAGE);
  const listingCount = HOME_LISTING_COUNT;
  const featuredPool = getHomeFeaturedProductPool();
  const featuredProducts = getFeaturedBatch(featuredPool, getFeaturedTimeSlot());

  return (
    <div className="relative z-0 w-full min-w-0 max-w-full overflow-x-hidden bg-[var(--background)] text-neutral-900">
      {/* Compact hero — static image (no scroll JS) */}
      <section className="relative -mt-[106px] flex min-h-[58vh] min-h-[420px] w-full min-w-0 items-center justify-center overflow-hidden pt-[106px] sm:-mt-[114px] sm:min-h-[62vh] sm:pt-[114px]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={heroSrc}
            alt="Performance automotive parts"
            width={1280}
            height={720}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes="100vw"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 bg-neutral-900/55" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-neutral-900/35 via-neutral-900/50 to-neutral-900/75" />

        <div className="relative z-20 mx-auto max-w-4xl px-4 text-center text-white sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">
            DrivoraParts Marketplace
          </p>
          <h1 className="mt-3 text-[clamp(1.75rem,5vw,3.25rem)] font-bold leading-tight tracking-tight">
            Performance Parts &{" "}
            <span className="text-red-500">Truck Beds</span>
            <span className="block text-[0.92em] font-bold text-white">
              Built for Real Builds
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-200 sm:text-base">
            Engines, transmissions, rust-free truck beds, and swap-ready drivetrains.
            {listingCount.toLocaleString()}+ listings — what you see is what you get.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href={routes.all}
              prefetch={false}
              className="touch-manipulation inline-block rounded-full bg-red-600 px-8 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700 active:bg-red-800"
            >
              Shop All Parts
            </Link>
            <Link
              href={routes.category("body-parts")}
              prefetch={false}
              className="touch-manipulation inline-block rounded-full border border-white/50 bg-white/10 px-8 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/20 active:bg-white/30"
            >
              Truck Beds & Shells
            </Link>
          </div>
        </div>
      </section>

      <ShopByVehicleSection />

      {/* Category grid — priority interaction zone */}
      <section className="relative z-10 border-b border-neutral-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
                Popular Categories
              </p>
              <h2 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
                Find the Right Parts for Every Build
              </h2>
            </div>
            <Link
              href="/catalog"
              prefetch={false}
              className="touch-manipulation text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
            >
              Full catalog →
            </Link>
          </div>

          <HomeCategoryGrid />
        </div>
      </section>

      <CinematicLifestyleSection />

      <HomeStatementBanner />

      {featuredProducts.length > 0 ? (
        <section className="relative z-10 border-b border-neutral-200 bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
                  Curated from live inventory
                </p>
                <h2 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
                  Performance Picks
                </h2>
              </div>
              <Link
                href={routes.all}
                prefetch={false}
                className="touch-manipulation text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
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

      <TrendingRail />

      <RecentlyAddedRail />

      <SeasonalCollectionsSection />

      <FeaturedBrandsStrip />

      <WhyDrivoraSection />

      <HomeStatsBand />

      <GuidesPreviewSection />

      <HomeTrustBadges />

      {/* Premium closing CTA */}
      <section className="relative overflow-hidden px-4 py-20 text-center text-white sm:px-6 sm:py-28">
        <div className="absolute inset-0 z-0">
          <img
            src={directAssetUrl("/home/pexels-mikebirdy-30734921.jpg")}
            alt=""
            loading="lazy"
            decoding="async"
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-neutral-950/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/40" />
        </div>

        <ScrollReveal className="relative z-10 mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Start your build today
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
            Exact item, as pictured — or upgraded to your spec. Secure crypto
            checkout, worldwide shipping, freight-ready logistics.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={routes.all}
              prefetch={false}
              className="touch-manipulation inline-block rounded-full bg-red-600 px-10 py-3.5 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-red-500 active:bg-red-700"
            >
              Browse marketplace
            </Link>
            <Link
              href="/contact"
              prefetch={false}
              className="touch-manipulation inline-block rounded-full border border-white/30 px-10 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10 active:bg-white/20"
            >
              Freight quote
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
