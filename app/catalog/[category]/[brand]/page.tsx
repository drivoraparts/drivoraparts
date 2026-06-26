import { notFound } from "next/navigation";
import { getCategory, getBrand } from "@/data/store";
import { brands } from "@/lib/inventory/brands";
import PageHeading from "@/components/catalog/PageHeading";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";

export const dynamic = "force-static";

export function generateStaticParams() {
  return brands.map((brand) => ({
    category: brand.category,
    brand: brand.slug,
  }));
}

export default async function Page({ params }: any) {
  const { category: categorySlug, brand: brandSlug } = await params;

  const category = getCategory(categorySlug);
  if (!category) return notFound();

  const brand = getBrand(categorySlug, brandSlug);
  if (!brand) return notFound();

  const products = category.products.filter((p) => p.brand === brand);

  return (
    <main className="min-h-screen p-6 text-white">
      <PageHeading title={brand} subtitle={category.name} />

      {products.length === 0 ? (
        <p className="text-gray-500">No products for this brand yet.</p>
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
                category: categorySlug,
                brand: product.brand,
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
