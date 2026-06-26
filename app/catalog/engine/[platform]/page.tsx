import { notFound } from "next/navigation";
import { getEnginePlatform, engineTree, getPlatformSlug } from "@/data/engine";
import { store } from "@/data/store";
import PageHeading from "@/components/catalog/PageHeading";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";

export const dynamic = "force-static";

export function generateStaticParams() {
  return engineTree.flatMap((group) =>
    group.platforms.map((platform) => ({
      platform: getPlatformSlug(platform),
    }))
  );
}

export default async function Page({ params }: any) {
  const { platform: platformSlug } = await params;

  const found = getEnginePlatform(platformSlug);
  if (!found) return notFound();

  const products = store.engine.products.filter(
    (p) => p.platform === platformSlug
  );

  return (
    <main className="min-h-screen p-6 text-white">
      <PageHeading
        title={found.platform.name}
        subtitle={`Engine · ${found.group.title}`}
      />

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
                category: "engine",
                brand: product.brand,
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
