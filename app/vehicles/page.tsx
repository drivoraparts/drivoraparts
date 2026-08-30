import type { Metadata } from "next";
import Link from "next/link";
import { vehiclePlatforms } from "@/data/vehicles";
import vehicleMedia from "@/data/vehicle-media.json";
import { getVehiclePartCount } from "@/lib/vehicles/parts";
import PageHeading from "@/components/catalog/PageHeading";
import JsonLdScript from "@/components/seo/JsonLdScript";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

type MediaEntry = { src: string; author: string; licence: string; sourceUrl: string };
const media = vehicleMedia as Record<string, MediaEntry[]>;

const TITLE = "Shop 4x4 Parts by Vehicle";
const DESCRIPTION =
  "Find parts by vehicle platform — Ford Ranger, Toyota HiLux, Isuzu D-Max, LandCruiser 70 Series and more. Fitment by series, body and drive configuration.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/vehicles",
  keywords: [
    "4x4 parts by vehicle",
    "ute accessories",
    "pickup truck parts",
    "4x4 fitment guide",
    "bull bars by vehicle",
  ],
});

export default function Page() {
  const platforms = vehiclePlatforms.map((platform) => ({
    platform,
    count: getVehiclePartCount(platform),
    hero: media[platform.slug]?.[0],
  }));

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([{ name: "Vehicles", path: "/vehicles" }]),
          collectionPageJsonLd(TITLE, DESCRIPTION, "/vehicles"),
          itemListJsonLd(
            "4x4 vehicle platforms",
            vehiclePlatforms.map((p) => `/vehicles/${p.slug}`)
          ),
        ]}
      />

      <main className="min-h-screen bg-white px-4 py-8 text-neutral-900 sm:px-6 sm:py-10">
        <PageHeading title={TITLE} subtitle="Fitment by platform, not guesswork" />

        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-neutral-600">
          {DESCRIPTION} Each platform page lists the series, cab and drive
          configurations we cover, so you can check fitment before you order
          rather than after.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map(({ platform, count, hero }) => (
            <Link
              key={platform.slug}
              href={`/vehicles/${platform.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 transition hover:border-neutral-300 hover:shadow-sm"
            >
              <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                {hero ? (
                  <img
                    src={hero.src}
                    alt={platform.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-sm font-semibold text-neutral-900">
                  {platform.name}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">{platform.tagline}</p>
                <p className="mt-3 flex-1 text-xs leading-relaxed text-neutral-600">
                  {platform.summary}
                </p>

                {/*
                 * The count is the real number of matching listings. A platform
                 * with none says so here rather than letting someone click
                 * through expecting stock.
                 */}
                <span className="mt-3 text-xs font-medium text-neutral-500">
                  {count > 0
                    ? `${count} part${count === 1 ? "" : "s"} in stock`
                    : "Sourcing only — request a part"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
