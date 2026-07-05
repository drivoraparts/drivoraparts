import type { Metadata } from "next";
import CategoryGrid from "@/components/shared/CategoryGrid";
import PageHeading from "@/components/catalog/PageHeading";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { routes } from "@/lib/inventory";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  SITE_KEYWORDS,
} from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = buildPageMetadata({
  title: "Performance Parts Catalog",
  description:
    "Browse engines, JDM swaps, truck beds, 4x4 lift kits, bull bars, snorkels, turbos, brakes, suspension, electronics, lighting & body parts by category. 1,400+ listings with worldwide shipping.",
  path: routes.catalog,
  keywords: SITE_KEYWORDS,
});

export default function Page() {
  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([{ name: "Catalog", path: routes.catalog }]),
          collectionPageJsonLd(
            "Performance Parts Catalog",
            "Browse automotive performance categories and shop by brand or vehicle platform.",
            routes.catalog
          ),
        ]}
      />
      <main className="min-h-screen bg-white p-6 text-neutral-900">
        <PageHeading title="Catalog" />
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-neutral-500">
          Browse engines, transmissions, turbo systems, brakes, suspension,
          electronics, lighting, and body parts from trusted performance brands.
        </p>
        <CategoryGrid />
      </main>
    </>
  );
}
