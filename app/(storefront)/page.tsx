import Link from "next/link";
import { preload } from "react-dom";
import HomeParallaxHero from "@/components/home/HomeParallaxHero";
import HomeFeaturedGrid from "@/components/home/HomeFeaturedGrid";
import TrustBadgeStrip from "@/components/product/TrustBadgeStrip";
import {
  getCategories,
  routes,
} from "@/lib/inventory";
import {
  getHomeFeaturedProducts,
  getHomeProductCount,
} from "@/lib/home/featured-products";
import { HOME_CATEGORY_BLURBS } from "@/lib/home/category-blurbs";
import { directAssetUrl } from "@/lib/media/optimize-image";
import { buildPageMetadata } from "@/lib/seo";

const HERO_IMAGE = "/home/hero-1280.webp";

const SHOP_BY_NEED = [
  {
    label: "Truck Beds & Shells",
    href: routes.category("body-parts"),
    detail: "Rust-free beds, cabs & camper toppers",
  },
  {
    label: "Engine Swaps",
    href: routes.category("engine"),
    detail: "LT, Coyote, 2JZ & complete packages",
  },
  {
    label: "Transmissions",
    href: routes.category("transmission"),
    detail: "Manual, auto & swap-ready driveline",
  },
  {
    label: "Canopies & Caps",
    href: routes.category("aftermarket"),
    detail: "Leer, Snugtop & utility toppers",
  },
  {
    label: "Brakes & Suspension",
    href: routes.category("brakes"),
    detail: "Stop hard, handle sharper",
  },
  {
    label: "All Products",
    href: routes.all,
    detail: "Browse the full marketplace",
  },
] as const;

export const metadata = buildPageMetadata({
  title: "Automotive Performance Marketplace",
  description:
    "Performance parts, truck beds, engine swaps, and drivetrain packages. Shop 1,400+ listings with secure crypto checkout at DrivoraParts.",
  path: "/",
});

export default function Home() {
  const heroSrc = directAssetUrl(HERO_IMAGE);
  preload(heroSrc, { as: "image", fetchPriority: "high" });

  const featured = getHomeFeaturedProducts(8);
  const listingCount = getHomeProductCount();
  const categories = getCategories();

  return (
    <div className="relative z-0 w-full min-w-0 max-w-full overflow-x-clip bg-[var(--background)] text-neutral-900">
      {/* Compact hero — shoppable above the fold on laptop */}
      <section className="relative -mt-[72px] flex min-h-[58vh] min-h-[420px] w-full min-w-0 items-center justify-center overflow-hidden pt-[72px] sm:-mt-[80px] sm:min-h-[62vh] sm:pt-[80px]">
        <HomeParallaxHero heroSrc={heroSrc} heroAlt="Performance automotive parts" />

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
              className="inline-block rounded-full bg-red-600 px-8 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700"
            >
              Shop All Parts
            </Link>
            <Link
              href={routes.category("body-parts")}
              className="inline-block rounded-full border border-white/50 bg-white/10 px-8 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/20"
            >
              Truck Beds & Shells
            </Link>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="border-b border-neutral-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
                Shop by category
              </p>
              <h2 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
                Find your next upgrade
              </h2>
            </div>
            <Link
              href="/catalog"
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Full catalog →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={routes.category(cat.slug)}
                className="group rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition hover:border-red-500 hover:bg-white hover:shadow-md"
              >
                <p className="font-semibold text-neutral-900 group-hover:text-red-600">
                  {cat.name}
                </p>
                <p className="mt-1 text-xs leading-snug text-neutral-500">
                  {HOME_CATEGORY_BLURBS[cat.slug] ?? "Shop listings"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
                Popular right now
              </p>
              <h2 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
                Featured listings
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Real photos, clear pricing, add to cart in one click.
              </p>
            </div>
            <Link
              href={routes.all}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              View all {listingCount.toLocaleString()}+ parts →
            </Link>
          </div>

          <HomeFeaturedGrid products={featured} />
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-neutral-200 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <TrustBadgeStrip variant="pro" />
        </div>
      </section>

      {/* Shop by need */}
      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
            Shop by need
          </p>
          <h2 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
            Know what you&apos;re looking for?
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SHOP_BY_NEED.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-xl border border-neutral-200 bg-neutral-50 p-5 transition hover:border-red-500 hover:bg-white hover:shadow-md"
              >
                <span className="text-lg font-bold text-neutral-900 group-hover:text-red-600">
                  {item.label}
                </span>
                <span className="mt-1 text-sm text-neutral-600">{item.detail}</span>
                <span className="mt-3 text-sm font-semibold text-red-600">
                  Shop now →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value prop + freight note */}
      <section className="border-t border-neutral-200 bg-neutral-900 px-4 py-14 text-center text-white sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Exact item, as pictured — or upgraded to your spec
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
            Oversized truck beds and shells ship freight — contact us for an LTL quote.
            Secure checkout with crypto accepted worldwide.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={routes.all}
              className="inline-block rounded-full bg-red-600 px-10 py-3.5 text-sm font-bold uppercase tracking-wide transition hover:bg-red-500"
            >
              Browse marketplace
            </Link>
            <Link
              href="/contact"
              className="inline-block rounded-full border border-white/30 px-10 py-3.5 text-sm font-semibold transition hover:bg-white/10"
            >
              Freight quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
