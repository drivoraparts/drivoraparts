import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory, getBrand } from "@/data/store";
import { brands } from "@/lib/inventory/brands";
import { routes } from "@/lib/inventory";
import PageHeading from "@/components/catalog/PageHeading";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import JsonLdScript from "@/components/seo/JsonLdScript";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  collectionPageJsonLd,
  getBrandSeoDescription,
  itemListJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

export function generateStaticParams() {
  return brands.map((brand) => ({
    category: brand.category,
    brand: brand.slug,
  }));
}

type PageProps = {
  params: Promise<{ category: string; brand: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug, brand: brandSlug } = await params;
  const category = getCategory(categorySlug);
  const brandRecord = brands.find(
    (entry) => entry.category === categorySlug && entry.slug === brandSlug
  );

  if (!category || !brandRecord) {
    return buildPageMetadata({
      title: "Brand Catalog",
      path: routes.catalog,
    });
  }

  const products = category.products.filter((p) => p.brand === brandRecord.name);

  return buildPageMetadata({
    title: `${brandRecord.name} ${category.name} Parts`,
    description: getBrandSeoDescription(
      brandRecord.name,
      category.name,
      products.length
    ),
    path: routes.brand(categorySlug, brandSlug),
  });
}

export default async function Page({ params }: PageProps) {
  const { category: categorySlug, brand: brandSlug } = await params;

  const category = getCategory(categorySlug);
  if (!category) return notFound();

  const brand = getBrand(categorySlug, brandSlug);
  if (!brand) return notFound();

  const products = category.products.filter((p) => p.brand === brand);
  const path = routes.brand(categorySlug, brandSlug);
  const description = getBrandSeoDescription(brand, category.name, products.length);
  const productPaths = products.map((product) => routes.product(product.id));

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Catalog", path: routes.catalog },
            { name: category.name, path: routes.category(categorySlug) },
            { name: brand, path },
          ]),
          collectionPageJsonLd(`${brand} ${category.name}`, description, path),
          itemListJsonLd(`${brand} ${category.name} products`, productPaths),
        ]}
      />
      <main className="min-h-screen p-6 text-white">
        <PageHeading title={brand} subtitle={category.name} />
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-gray-400">
          {description}
        </p>

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
    </>
  );
}
