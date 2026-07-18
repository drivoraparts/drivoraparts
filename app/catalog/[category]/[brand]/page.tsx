import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory, getBrand } from "@/data/store";
import { brands } from "@/lib/inventory/brands";
import { routes } from "@/lib/inventory";
import PageHeading from "@/components/catalog/PageHeading";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { LIST_SCROLL_KEYS } from "@/lib/catalog/list-scroll-restore";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  collectionPageJsonLd,
  getBrandSeoDescription,
  getCategoryKeywords,
  itemListJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

export function generateStaticParams() {
  // Skip brand-category combos with zero products — generating them anyway
  // produces a 200 with only "No products for this brand yet." (a soft 404),
  // and Search Console flags the resulting pages as soft-404 / near-duplicate.
  //
  // Also skip category "engine" entirely — /catalog/engine/[platform] is a
  // more specific literal-segment route that always wins over this generic
  // [category]/[brand] route for that path prefix, so engine's brand entries
  // (bmw, toyota, etc. registered in brands.ts) can never actually be served
  // here regardless of product data. Engine is browsed by platform instead;
  // see enginePlatformEntries in lib/seo/sitemap.ts.
  return brands
    .filter((brand) => {
      if (brand.category === "engine") return false;
      const category = getCategory(brand.category);
      return category?.products.some((p) => p.brand === brand.name);
    })
    .map((brand) => ({
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
      products.length,
      brandRecord.slug,
      categorySlug
    ),
    keywords: getCategoryKeywords(categorySlug),
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
  if (!products.length) return notFound();
  const path = routes.brand(categorySlug, brandSlug);
  const description = getBrandSeoDescription(brand, category.name, products.length);
  const productPaths = products.map((product) => routes.product(product.id));

  const scrollListKey = LIST_SCROLL_KEYS.brand(categorySlug, brandSlug);

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
      <main className="min-h-screen bg-white p-6 text-neutral-900">
        <PageHeading title={brand} subtitle={category.name} />
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-gray-400">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <CatalogProductCard
              key={product.id}
              scrollListKey={scrollListKey}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                thumbnail: product.thumbnail,
                images: product.images,
                category: categorySlug,
                brand: product.brand,
              }}
            />
          ))}
        </div>
      </main>
    </>
  );
}
