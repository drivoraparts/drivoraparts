import Link from "next/link";
import { preload } from "react-dom";
import HomeCategoryGrid from "@/components/home/HomeCategoryGrid";
import HomeTrustBadges from "@/components/home/HomeTrustBadges";
import { HOME_LISTING_COUNT } from "@/lib/home/listing-count";
import { routes } from "@/lib/inventory/routes";
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

  const listingCount = HOME_LISTING_COUNT;

  return (
    <div className="relative z-0 w-full min-w-0 max-w-full overflow-x-hidden bg-[var(--background)] text-neutral-900">
      {/* Compact hero — static image (no scroll JS) */}
      <section className="relative -mt-[72px] flex min-h-[58vh] min-h-[420px] w-full min-w-0 items-center justify-center overflow-hidden pt-[72px] sm:-mt-[80px] sm:min-h-[62vh] sm:pt-[80px]">
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

      {/* Category grid — priority interaction zone */}
      <section className="relative z-10 border-b border-neutral-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
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
              prefetch={false}
              className="touch-manipulation text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
            >
              Full catalog →
            </Link>
          </div>

          <HomeCategoryGrid />
        </div>
      </section>

      <HomeTrustBadges />

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
                prefetch={false}
                className="touch-manipulation flex flex-col rounded-xl border border-neutral-200 bg-neutral-50 p-5 transition-colors hover:border-red-500 hover:bg-white active:bg-red-50"
              >
                <span className="text-lg font-bold text-neutral-900">{item.label}</span>
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
        </div>
      </section>
    </div>
  );
}
