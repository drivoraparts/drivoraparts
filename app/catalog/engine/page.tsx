import type { Metadata } from "next";
import EngineGroups from "@/components/catalog/EngineGroups";
import CategoryProductGrid from "@/components/catalog/CategoryProductGrid";
import PageHeading from "@/components/catalog/PageHeading";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { routes } from "@/lib/inventory";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  collectionPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = buildPageMetadata({
  title: "Toyota Engines by Platform",
  description:
    "Shop Toyota engines by platform: 2JZ-GTE, 1JZ-GTE and 1UZ-FE V8, plus engine parts and intakes for the Tacoma, Tundra, 4Runner and Land Cruiser.",
  path: "/catalog/engine",
});

export default function Page() {
  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Catalog", path: routes.catalog },
            { name: "Engine", path: "/catalog/engine" },
          ]),
          collectionPageJsonLd(
            "Toyota Engines by Platform",
            "Browse Toyota engine platforms and shop engines and engine parts.",
            "/catalog/engine"
          ),
        ]}
      />
      <main className="min-h-screen bg-white p-6 text-neutral-900">
        <PageHeading title="Engine" subtitle="Select an engine platform" />
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-gray-400">
          Toyota engine platforms, including the 2JZ-GTE, 1JZ-GTE and 1UZ-FE V8,
          followed by every engine part we list for Toyota models.
        </p>
        <EngineGroups />
        <CategoryProductGrid categorySlug="engine" />
      </main>
    </>
  );
}
