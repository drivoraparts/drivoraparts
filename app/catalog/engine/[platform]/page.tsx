import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEnginePlatform, engineTree, getPlatformSlug } from "@/data/engine";
import { store } from "@/data/store";
import { routes } from "@/lib/inventory";
import PageHeading from "@/components/catalog/PageHeading";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import JsonLdScript from "@/components/seo/JsonLdScript";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

export function generateStaticParams() {
  return engineTree.flatMap((group) =>
    group.platforms.map((platform) => ({
      platform: getPlatformSlug(platform),
    }))
  );
}

type PageProps = {
  params: Promise<{ platform: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { platform: platformSlug } = await params;
  const found = getEnginePlatform(platformSlug);

  if (!found) {
    return buildPageMetadata({
      title: "Engine Platform",
      path: "/catalog/engine",
    });
  }

  const path = `/catalog/engine/${platformSlug}`;

  return buildPageMetadata({
    title: `${found.platform.name} Performance Engines`,
    description: `Shop ${found.platform.name} engines and crate motors for ${found.group.title} builds. Compare specs, pricing, and availability at DrivoraParts.`,
    path,
  });
}

export default async function Page({ params }: PageProps) {
  const { platform: platformSlug } = await params;

  const found = getEnginePlatform(platformSlug);
  if (!found) return notFound();

  const products = store.engine.products.filter(
    (p) => p.platform === platformSlug
  );
  const path = `/catalog/engine/${platformSlug}`;
  const description = `Shop ${found.platform.name} engines and performance crate motors for ${found.group.title} builds.`;
  const productPaths = products.map((product) => routes.product(product.id));

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Catalog", path: routes.catalog },
            { name: "Engine", path: "/catalog/engine" },
            { name: found.platform.name, path },
          ]),
          collectionPageJsonLd(
            `${found.platform.name} Performance Engines`,
            description,
            path
          ),
          itemListJsonLd(`${found.platform.name} engines`, productPaths),
        ]}
      />
      <main className="min-h-screen p-6 text-white">
        <PageHeading
          title={found.platform.name}
          subtitle={`Engine · ${found.group.title}`}
        />
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-gray-400">
          {description}
        </p>

        {products.length === 0 ? (
          <p className="text-gray-500">No products for this platform yet.</p>
        ) : (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <CatalogProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  thumbnail: product.thumbnail,
                  images: product.images,
                  category: "engine",
                  brand: product.brand,
                }}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
