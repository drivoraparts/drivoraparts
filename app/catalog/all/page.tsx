import type { Metadata } from "next";
import AllProductsFeed from "@/components/catalog/AllProductsFeed";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { routes } from "@/lib/inventory";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  collectionPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

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
      <main className="min-h-screen px-3 pb-6 pt-20 text-white sm:px-6 sm:pt-24">
        <header className="mb-3 sm:mb-6">
          <h1 className="inline-block border-b-2 border-red-600 pb-1 text-xl font-bold text-white sm:text-3xl sm:pb-2">
            All Products
          </h1>
          <p className="mt-1 hidden text-sm text-gray-400 sm:block">
            Browse everything in the marketplace
          </p>
        </header>
        <AllProductsFeed />
      </main>
    </>
  );
}
