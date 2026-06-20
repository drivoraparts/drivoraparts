import { notFound } from "next/navigation";
import { getEnginePlatform } from "@/data/engine";
import { store } from "@/data/store";
import PageHeading from "@/components/catalog/PageHeading";
import CatalogCard from "@/components/catalog/CatalogCard";

export const runtime = "edge";

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <CatalogCard key={product.id} href={`/product/${product.id}`}>
              <img
                src={product.thumbnail}
                alt={product.name}
                className="h-40 w-full object-cover rounded-lg"
              />
              <h3 className="mt-3 font-semibold">{product.name}</h3>
              <p className="text-sm text-red-500 font-bold">${product.price}</p>
            </CatalogCard>
          ))}
        </div>
      )}
    </main>
  );
}
