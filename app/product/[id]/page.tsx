import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/data/store";
import {
  routes,
  getProductById as getInventoryProductById,
  getProductCatalogMeta,
} from "@/lib/inventory";
import { getSiteUrl } from "@/lib/env";
import ProductTemplate from "@/components/product/ProductTemplate";

export const revalidate = 3600;
type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(Number(id));

  if (!product) {
    return { title: "Product Not Found | DrivoraParts" };
  }

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${routes.product(product.id)}`;
  const image = product.thumbnail.startsWith("http")
    ? product.thumbnail
    : `${siteUrl}${product.thumbnail}`;

  return {
    title: `${product.name} | DrivoraParts`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      url,
      type: "website",
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description.slice(0, 160),
      images: [image],
    },
    alternates: { canonical: url },
  };
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

  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.thumbnail.startsWith("http")
      ? product.thumbnail
      : `${siteUrl}${product.thumbnail}`,
    description: product.description.slice(0, 500),
    sku: String(product.id),
    ...(inventoryProduct?.partNumber
      ? { mpn: inventoryProduct.partNumber }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `${siteUrl}${routes.product(product.id)}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductTemplate
        product={product}
        catalogMeta={catalogMeta}
        inStock={inStock}
        rawCondition={rawCondition}
      />
    </>
  );
}
