import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/data/store";
import {
  routes,
  getProductById as getInventoryProductById,
  getProductCatalogMeta,
  getCategory,
} from "@/lib/inventory";
import ProductTemplate from "@/components/product/ProductTemplate";
import JsonLdScript from "@/components/seo/JsonLdScript";
import {
  absoluteImageUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  productJsonLd,
  productSeoDescription,
} from "@/lib/seo";

export const revalidate = 3600;
type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(Number(id));

  if (!product) {
    return { title: "Product Not Found" };
  }

  const description = productSeoDescription(
    product.description,
    `Buy ${product.name} at DrivoraParts with secure checkout and worldwide shipping.`
  );

  return buildPageMetadata({
    title: product.name,
    description,
    path: routes.product(product.id),
    image: product.thumbnail,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductById(Number(id));

  if (!product) return notFound();

  const inventoryProduct = getInventoryProductById(product.id);
  const catalogMeta = getProductCatalogMeta(
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
  const inStock = inventoryProduct?.stock !== false;
  const rawCondition = inventoryProduct?.condition ?? product.condition;
  const category = getCategory(product.category);

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
        inStock={inStock}
        rawCondition={rawCondition}
      />
    </>
  );
}
