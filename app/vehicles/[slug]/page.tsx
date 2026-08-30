import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fitmentYears,
  getVehiclePlatform,
  vehiclePlatforms,
} from "@/data/vehicles";
import vehicleMedia from "@/data/vehicle-media.json";
import { getSharedPlatformParts, getVehicleParts } from "@/lib/vehicles/parts";
import { routes } from "@/lib/inventory";
import PageHeading from "@/components/catalog/PageHeading";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import ImageCarousel from "@/components/product/ImageCarousel";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { LIST_SCROLL_KEYS } from "@/lib/catalog/list-scroll-restore";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

type MediaEntry = {
  src: string;
  author: string;
  licence: string;
  sourceUrl: string;
};

const media = vehicleMedia as Record<string, MediaEntry[]>;

export function generateStaticParams() {
  return vehiclePlatforms.map((platform) => ({ slug: platform.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const platform = getVehiclePlatform(slug);

  if (!platform) {
    return buildPageMetadata({ title: "Vehicle", path: "/vehicles" });
  }

  return buildPageMetadata({
    title: platform.seoTitle,
    description: platform.seoDescription,
    path: `/vehicles/${platform.slug}`,
    keywords: platform.keywords,
  });
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-lg font-semibold text-neutral-900">{children}</h2>
  );
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const platform = getVehiclePlatform(slug);
  if (!platform) return notFound();

  const parts = getVehicleParts(platform);
  const shared = getSharedPlatformParts(platform);
  const images = media[platform.slug] ?? [];
  const path = `/vehicles/${platform.slug}`;
  const scrollListKey = LIST_SCROLL_KEYS.vehiclePlatform(platform.slug);

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Vehicles", path: "/vehicles" },
            { name: platform.name, path },
          ]),
          collectionPageJsonLd(platform.seoTitle, platform.seoDescription, path),
          itemListJsonLd(
            `${platform.name} parts`,
            parts.map((product) => routes.product(product.id))
          ),
        ]}
      />

      <main className="min-h-screen bg-white px-4 py-8 text-neutral-900 sm:px-6 sm:py-10">
        <PageHeading title={platform.name} subtitle={platform.tagline} />

        {images.length > 0 ? (
          <div className="mb-8 overflow-hidden rounded-xl border border-neutral-200">
            <ImageCarousel
              images={images.map((entry) => entry.src)}
              alt={platform.name}
              surface="light"
            />
          </div>
        ) : null}

        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-neutral-600">
          {platform.summary}
        </p>

        {/* Overview */}
        <section className="mb-10 max-w-3xl space-y-4">
          {platform.overview.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-neutral-700">
              {paragraph}
            </p>
          ))}
        </section>

        {/* Platform facts */}
        <section className="mb-10">
          <SectionHeading>Platform Notes</SectionHeading>
          <ul className="max-w-3xl space-y-2">
            {platform.highlights.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-sm leading-relaxed text-neutral-700"
              >
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-red-600" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Structured fitment */}
        <section className="mb-10">
          <SectionHeading>Fitment</SectionHeading>
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Make &amp; Model</th>
                  <th className="px-4 py-3 font-semibold">Series</th>
                  <th className="px-4 py-3 font-semibold">Years</th>
                  <th className="px-4 py-3 font-semibold">Body</th>
                  <th className="px-4 py-3 font-semibold">Drive</th>
                </tr>
              </thead>
              <tbody>
                {platform.fitment.map((row) => (
                  <tr
                    key={`${row.model}-${row.series}`}
                    className="border-t border-neutral-200 align-top"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {row.make} {row.model}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {row.series}
                      {row.notes ? (
                        <span className="mt-1 block text-xs leading-relaxed text-neutral-500">
                          {row.notes}
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-700">
                      {fitmentYears(row)}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {row.bodyStyles.join(", ")}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {row.drive.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-neutral-500">
            Fitment varies by market, build date and configuration. Send us your
            build year and chassis code and we will confirm before you order.
          </p>
        </section>

        {/* Parts we actually hold */}
        <section className="mb-10">
          <SectionHeading>
            Parts for the {platform.name}
            {parts.length > 0 ? (
              <span className="ml-2 text-sm font-normal text-neutral-500">
                {parts.length} listing{parts.length === 1 ? "" : "s"}
              </span>
            ) : null}
          </SectionHeading>

          {parts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {parts.map((product) => (
                <CatalogProductCard
                  key={product.id}
                  scrollListKey={scrollListKey}
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    thumbnail: product.thumbnail,
                    images: product.images,
                    category: product.category,
                    brand: product.brand,
                  }}
                />
              ))}
            </div>
          ) : (
            /*
             * No stock is stated plainly rather than dressed up. A page that
             * implies parts exist and then shows nothing wastes the customer's
             * time and costs more trust than admitting the gap.
             */
            <div className="max-w-3xl rounded-xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-sm leading-relaxed text-neutral-700">
                We do not currently stock parts listed specifically for the{" "}
                {platform.name}. Rather than show you near-misses, we would
                rather source what you actually need.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Request a part
              </Link>
            </div>
          )}
        </section>

        {/* Donor-platform parts, clearly caveated */}
        {shared.donor && shared.parts.length > 0 && platform.sharedWith ? (
          <section className="mb-10">
            <SectionHeading>
              Parts for the {platform.sharedWith.label}
            </SectionHeading>
            <div className="mb-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-relaxed text-amber-900">
                {platform.sharedWith.reason}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {shared.parts.map((product) => (
                <CatalogProductCard
                  key={product.id}
                  scrollListKey={scrollListKey}
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    thumbnail: product.thumbnail,
                    images: product.images,
                    category: product.category,
                    brand: product.brand,
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Warranty & shipping — site policy, not vehicle-specific claims */}
        <section className="mb-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 p-4">
            <h3 className="mb-2 text-sm font-semibold text-neutral-900">Warranty</h3>
            <p className="text-sm leading-relaxed text-neutral-600">
              Warranty terms are set per part and shown on each listing. All
              orders are covered by the DrivoraParts Warranty Policy.
            </p>
            <Link
              href="/returns"
              className="mt-3 inline-block text-sm font-medium text-red-600 hover:underline"
            >
              Returns &amp; warranty policy
            </Link>
          </div>
          <div className="rounded-xl border border-neutral-200 p-4">
            <h3 className="mb-2 text-sm font-semibold text-neutral-900">Shipping</h3>
            <p className="text-sm leading-relaxed text-neutral-600">
              Worldwide shipping is available. Bar work, canopies and suspension
              ship as freight, with cost calculated by destination at checkout.
            </p>
            <Link
              href="/faq"
              className="mt-3 inline-block text-sm font-medium text-red-600 hover:underline"
            >
              Shipping questions
            </Link>
          </div>
        </section>

        {/*
         * CC BY-SA requires attribution to the photographer and a link to the
         * source. Without this block the images would not be licensed for use
         * here at all, so it is not optional decoration.
         */}
        {images.length > 0 ? (
          <section className="max-w-3xl border-t border-neutral-200 pt-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Image credits
            </h3>
            <ul className="space-y-1">
              {images.map((entry) => (
                <li key={entry.src} className="text-xs leading-relaxed text-neutral-500">
                  Photo by {entry.author} —{" "}
                  <a
                    href={entry.sourceUrl}
                    rel="noopener noreferrer nofollow"
                    target="_blank"
                    className="underline hover:text-neutral-700"
                  >
                    {entry.licence}
                  </a>
                  , via Wikimedia Commons.
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-neutral-500">
              Vehicle imagery is shown for identification only. DrivoraParts is
              an independent parts supplier and is not affiliated with, endorsed
              by, or an authorised dealer for {platform.make}.
            </p>
          </section>
        ) : null}
      </main>
    </>
  );
}
