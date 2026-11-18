import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import PageHeading from "@/components/catalog/PageHeading";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { getVerifiedGenuineProducts } from "@/lib/catalog/toyota-departments";
import { routes, toCatalogCardData } from "@/lib/inventory";
import { isHeldListing } from "@/lib/inventory/held";
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
  // Held listings (out of stock, details being confirmed) are left out.
  const products = getVerifiedGenuineProducts(500).filter((p) => !isHeldListing(p));
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
          {products.map((product) => (
            <CatalogProductCard key={product.id} product={toCatalogCardData(product)} />
          ))}
        </div>
      </main>
    </>
  );
}
