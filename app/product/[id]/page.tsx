import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/data/store";
import {
  routes,
  getProductById as getInventoryProductById,
  getProductCatalogMeta,
  getCategory,
  getRelatedProducts,
  toCatalogCardData,
  brands,
} from "@/lib/inventory";
import { getProductThumbnail } from "@/lib/inventory/media";
import ProductTemplate from "@/components/product/ProductTemplate";
import JsonLdScript from "@/components/seo/JsonLdScript";
import {
  absoluteImageUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  buildProductMetaKeywords,
  buildProductSeoDescription,
  buildProductSeoTitle,
  hasGenericPlaceholderDescription,
  productJsonLd,
} from "@/lib/seo";
import { getProductReviewAggregate } from "@/lib/reviews";
import { getProductInterest } from "@/lib/analytics/product-interest";

export const revalidate = 3600;

/**
 * Returning an empty array is what turns this route into ISR. Next renders a
 * product on its first request and then caches it for the hour declared above;
 * without this the segment is dynamically rendered and `revalidate` never
 * applies, which is why the route was absent from dynamicRoutes in the
 * prerender manifest and every crawler hit paid for a full render.
 *
 * Empty rather than all 1,889 ids on purpose: prebuilding every product would
 * add roughly 245MB of HTML to the Worker asset bundle for pages that are
 * cheap to render once and then cache.
 */
export function generateStaticParams(): { id: string }[] {
  return [];
}
type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(Number(id));

  if (!product) {
    return { title: "Product Not Found" };
  }

  const inventoryProduct = getInventoryProductById(product.id);
  const previewImage = getProductThumbnail(inventoryProduct ?? product);
  const seoInput = {
    name: product.name,
    category: product.category,
    brand: inventoryProduct?.brand ?? product.brand,
    fitment: inventoryProduct?.fitment,
    description: product.description,
  };

  return buildPageMetadata({
    title: buildProductSeoTitle(seoInput),
    description: buildProductSeoDescription(seoInput),
    keywords: buildProductMetaKeywords(seoInput),
    path: routes.product(product.id),
    image: previewImage,
    noIndex: hasGenericPlaceholderDescription(product.description),
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductById(Number(id));

  if (!product) return notFound();

  const inventoryProduct = getInventoryProductById(product.id);
  const baseMeta = getProductCatalogMeta(
    inventoryProduct ?? {
      id: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price,
      condition: inventoryProduct?.condition ?? product.condition,
      description: product.description,
      platform: product.platform,
    }
  );
  /*
   * Review figures come from the database, so they are fetched here rather
   * than baked into the static meta above. Merging them keeps the shape
   * ProductTemplate already expects.
   */
  const [reviewAggregate, productInterest] = await Promise.all([
    getProductReviewAggregate(product.id),
    getProductInterest(product.id),
  ]);
  const catalogMeta = { ...baseMeta, ...reviewAggregate };

  const inStock = inventoryProduct?.stock !== false;
  const rawCondition = inventoryProduct?.condition ?? product.condition;
  const category = getCategory(product.category);
  const brandSlug =
    inventoryProduct?.brand ??
    brands.find((b) => b.name === product.brand)?.slug ??
    product.brand;
  const inventorySource = {
    id: product.id,
    category: product.category,
    brand: brandSlug,
    platform: inventoryProduct?.platform ?? product.platform,
  };
  const relatedProducts = getRelatedProducts(inventorySource).map(toCatalogCardData);

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Catalog", path: routes.catalog },
    ...(category
      ? [{ name: category.name, path: routes.category(category.slug) }]
      : []),
    { name: product.name, path: routes.product(product.id) },
  ]);

  const structuredData = inventoryProduct
    ? [
        breadcrumbs,
        productJsonLd(inventoryProduct, product.price),
      ]
    : [breadcrumbs];

  return (
    <>
      <JsonLdScript data={structuredData} />
      <ProductTemplate
        product={product}
        catalogMeta={catalogMeta}
        productInterest={productInterest}
        inStock={inStock}
        rawCondition={rawCondition}
        categoryName={category?.name ?? product.category}
        categorySlug={category?.slug ?? product.category}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
