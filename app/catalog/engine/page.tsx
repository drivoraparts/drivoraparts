import type { Metadata } from "next";
import EngineGroups from "@/components/catalog/EngineGroups";
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
  title: "Performance Engines by Platform",
  description:
    "Shop BMW, Toyota, Nissan, Honda, GM Gen V, Ford Coyote, LS/LT swap packages, and more — crate motors, drivetrains, and swap-ready powerplants.",
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
            "Performance Engines by Platform",
            "Browse engine platforms and shop crate motors, long blocks, and swap-ready powerplants.",
            "/catalog/engine"
          ),
        ]}
      />
      <main className="min-h-screen bg-white p-6 text-neutral-900">
        <PageHeading title="Engine" subtitle="Select an engine platform" />
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-gray-400">
          Browse legendary engine platforms including BMW N54, Toyota 2JZ, Nissan
          RB, Honda K-Series, GM LS/LT, Gen V L86/L83 packages, Ford Coyote, and
          more.
        </p>
        <EngineGroups />
      </main>
    </>
  );
}
