import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import PageHeading from "@/components/catalog/PageHeading";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { getGenuineSectionProducts, isGenuineInquiryOnly } from "@/lib/catalog/toyota-departments";
import Link from "next/link";
import { getProductThumbnail } from "@/lib/inventory/media";
import { genuineCardTitle } from "@/lib/catalog/genuine-card-title";
import { routes, toCatalogCardData } from "@/lib/inventory";
import { breadcrumbJsonLd, buildPageMetadata, collectionPageJsonLd, itemListJsonLd } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "Toyota Genuine Parts";
const DESCRIPTION =
  "Genuine Toyota parts, each verified against its Toyota part number before it is listed here.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: routes.genuine,
});

/*
 * Only listings verified in lib/inventory/data/toyota-genuine.json: confirmed
 * against the Toyota part number on a supplier invoice or Toyota's parts
 * catalog. A supplier's title saying "Toyota Genuine" does not put a listing
 * here. With nothing verified the page does not exist (404), and the header
 * link and homepage tile are hidden, so the section never opens empty.
 *
 * This is a claim about the parts, not about DrivoraParts' relationship with
 * Toyota: no Toyota logo, and no "authorized" wording.
 */
export default function ToyotaGenuinePage() {
  // Verified listings; those awaiting stock and price confirmation are shown
  // as "Available to order" with an inquiry, never with Add to Cart.
  const products = getGenuineSectionProducts();
  if (products.length === 0) notFound();

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Catalog", path: routes.catalog },
            { name: TITLE, path: routes.genuine },
          ]),
          collectionPageJsonLd(TITLE, DESCRIPTION, routes.genuine),
          itemListJsonLd(TITLE, products.map((p) => routes.product(p.id))),
        ]}
      />
      <main className="mx-auto min-h-screen max-w-6xl bg-white px-4 py-8 text-foreground sm:px-6 lg:px-8">
        <PageHeading title={TITLE} subtitle={`${products.length} verified ${products.length === 1 ? "part" : "parts"}`} />
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted">
          Every part in this section is a Genuine Toyota part, verified against its Toyota part
          number before it is listed. Other parts on DrivoraParts are aftermarket brands, labelled
          as such on each listing.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) =>
            isGenuineInquiryOnly(product) ? (
              <InquiryCard
                key={product.id}
                href={routes.product(product.id)}
                name={product.name}
                partNumber={product.partNumber}
                image={getProductThumbnail(product)}
              />
            ) : (
              <CatalogProductCard key={product.id} product={toCatalogCardData(product)} />
            )
          )}
        </div>
      </main>
    </>
  );
}

/** A verified Genuine part whose price and stock are confirmed on request. */
function InquiryCard({
  href,
  name,
  partNumber,
  image,
}: {
  href: string;
  name: string;
  partNumber?: string;
  image: string;
}) {
  return (
    <Link
      href={href}
      title={name}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white transition-colors hover:border-foreground"
    >
      <div className="flex aspect-square items-center justify-center bg-surface-muted p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-success">Toyota Genuine Part</p>
        <p className="mt-1 line-clamp-5 text-sm font-semibold text-foreground">
          {genuineCardTitle(name, partNumber)}
        </p>
        {partNumber ? <p className="mt-1 text-xs text-muted">Part no. {partNumber}</p> : null}
        <p className="mt-auto pt-3 text-sm font-semibold text-foreground">Available to order</p>
        <p className="text-xs text-muted group-hover:text-accent-hover">Ask about price and availability →</p>
      </div>
    </Link>
  );
}
