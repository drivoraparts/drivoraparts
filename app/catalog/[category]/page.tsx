import type { Metadata } from "next";
import { getCategory as getLegacyCategory } from "@/data/store";
import {
  getCategory,
  getProductsByCategory,
  routes,
  slugify,
} from "@/lib/inventory";
import { LIST_SCROLL_KEYS } from "@/lib/catalog/list-scroll-restore";
import { categories } from "@/lib/inventory/categories";
import CategoryTemplate from "@/components/catalog/CategoryTemplate";
import JsonLdScript from "@/components/seo/JsonLdScript";
import {
  buildPageMetadata,
  collectionPageJsonLd,
  getCategoryKeywords,
  getCategorySeoDescription,
  itemListJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);

  if (!category) {
    return buildPageMetadata({
      title: "Catalog Category",
      path: routes.catalog,
    });
  }

  const productCount = getProductsByCategory(slug).length;

  return buildPageMetadata({
    title: `${category.name} Performance Parts`,
    description: getCategorySeoDescription(slug, productCount),
    keywords: getCategoryKeywords(slug),
    path: routes.category(slug),
  });
}

export default async function Page({ params }: PageProps) {
  const { category: slug } = await params;

  const categoryData = getLegacyCategory(slug);

  if (!categoryData) {
    return (
      <div className="bg-white p-6 text-neutral-900">No products found in this category</div>
    );
  }

  const products = getProductsByCategory(slug);
  const productPaths = products.map((product) => routes.product(product.id));
  const description = getCategorySeoDescription(slug, products.length);

  return (
    <>
      <JsonLdScript
        data={[
          collectionPageJsonLd(
            `${categoryData.name} Performance Parts`,
            description,
            routes.category(slug)
          ),
          itemListJsonLd(`${categoryData.name} products`, productPaths),
        ]}
      />
      <CategoryTemplate
        title={categoryData.name}
        intro={description}
        brands={categoryData.brands.map((brand) => ({
          name: brand,
          href: routes.brand(slug, slugify(brand)),
        }))}
        products={categoryData.products}
        showProducts
        scrollListKey={LIST_SCROLL_KEYS.category(slug)}
      />
    </>
  );
}
