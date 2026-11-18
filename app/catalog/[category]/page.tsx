import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory as getLegacyCategory } from "@/data/store";
import {
  getCategory,
  getProductsByCategory,
  routes,
  slugify,
} from "@/lib/inventory";
import { LIST_SCROLL_KEYS } from "@/lib/catalog/list-scroll-restore";
import { brands as registeredBrands } from "@/lib/inventory/brands";
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

/** Singular catalog category names that read better plural in a title. */
const PLURAL_TITLE: Record<string, string> = {
  engine: "Engines",
  transmission: "Transmissions",
  turbocharger: "Turbochargers",
};

/** "Toyota Engines", "Toyota Suspension": the category page title. */
function toyotaCategoryTitle(slug: string, name: string): string {
  return `Toyota ${PLURAL_TITLE[slug] ?? name}`;
}

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

  /*
   * An unknown slug 404s in the page body below, and generateMetadata still
   * runs first -- so without this the 404 went out carrying robots
   * "index, follow". The status code is what actually keeps it out of the
   * index, and a robots tag on a 404 is ignored, but the two should not read
   * as if they disagree.
   */
  if (!category) {
    return buildPageMetadata({
      title: "Catalog Category",
      path: routes.catalog,
      noIndex: true,
    });
  }

  const productCount = getProductsByCategory(slug).length;

  return buildPageMetadata({
    title: toyotaCategoryTitle(category.slug, category.name),
    description: getCategorySeoDescription(slug, productCount),
    keywords: getCategoryKeywords(slug),
    path: routes.category(slug),
  });
}

export default async function Page({ params }: PageProps) {
  const { category: slug } = await params;

  const categoryData = getLegacyCategory(slug);

  /*
   * An unknown slug is a 404, not an empty category page.
   *
   * This used to render "No products found in this category" and return 200,
   * which made every misspelling and every piece of crawler junk under
   * /catalog/ its own indexable page -- an unbounded set of them, all empty,
   * all carrying robots "index, follow". The sibling brand route
   * (/catalog/[category]/[brand]) has always called notFound() for the same
   * case; this route was the one that did not.
   */
  if (!categoryData) {
    notFound();
  }

  const products = getProductsByCategory(slug);
  // A category with no public (Toyota) listings -- turbochargers today -- is
  // not published: a 404 rather than an indexable empty page.
  if (products.length === 0) {
    notFound();
  }
  const productPaths = products.map((product) => routes.product(product.id));
  const description = getCategorySeoDescription(slug, products.length);

  return (
    <>
      <JsonLdScript
        data={[
          collectionPageJsonLd(
            toyotaCategoryTitle(slug, categoryData.name),
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
          // The registered slug, not slugify(name): the brand page looks the
          // brand up by slug, and the two differ for some ("Yukon Gear &
          // Axle" is yukon-gear), which made those links 404.
          href: routes.brand(
            slug,
            registeredBrands.find((b) => b.category === slug && b.name === brand)?.slug ??
              slugify(brand)
          ),
        }))}
        products={categoryData.products}
        showProducts
        scrollListKey={LIST_SCROLL_KEYS.category(slug)}
      />
    </>
  );
}
