import { notFound } from "next/navigation";
import { getCategory, getBrand } from "@/data/store";
import { brands } from "@/lib/inventory/brands";
import PageHeading from "@/components/catalog/PageHeading";
import CatalogCard from "@/components/catalog/CatalogCard";
import Price from "@/components/currency/Price";
import TranslatedText from "@/components/i18n/TranslatedText";

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <CatalogCard key={product.id} href={`/product/${product.id}`}>
              <img
                src={product.thumbnail}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="h-40 w-full object-cover rounded-lg"
              />
              <h3 className="mt-3 font-semibold">
                <TranslatedText as="span">{product.name}</TranslatedText>
              </h3>
              <p className="text-sm text-red-500 font-bold">
                <Price usd={product.price} />
              </p>
            </CatalogCard>
          ))}
        </div>
      )}
    </main>
  );
}
