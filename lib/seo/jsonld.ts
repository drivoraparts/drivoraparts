import type { Product } from "@/lib/inventory/types";
import { COMPANY_SUPPORT_EMAIL, US_HEADQUARTERS } from "@/lib/content/company";
import { routes } from "@/lib/inventory/routes";
import { getBrandBySlug } from "@/lib/inventory";
import { resolveProductGallery } from "@/lib/inventory/media";
import {
  resolveProductRating,
  resolveProductReviewCount,
} from "@/lib/inventory/productEnhancements";
import { SITE_NAME, SITE_TAGLINE } from "./constants";
import { absoluteImageUrl, absoluteUrl } from "./urls";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteImageUrl("/favicon.png"),
    email: COMPANY_SUPPORT_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: US_HEADQUARTERS.street,
      addressLocality: US_HEADQUARTERS.city,
      addressRegion: US_HEADQUARTERS.state,
      postalCode: US_HEADQUARTERS.postalCode,
      addressCountry: "US",
    },
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_TAGLINE,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/catalog/all")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: Product, price: number): JsonLd {
  const gallery = resolveProductGallery(product.thumbnail, product.images).map(
    absoluteImageUrl
  );
  const brand = getBrandBySlug(product.brand);
  const inStock = product.stock !== false;
  const rating = resolveProductRating(product);
  const reviewCount = resolveProductReviewCount(product);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: gallery,
    description: product.description.split("\n").slice(0, 6).join(" ").trim(),
    sku: String(product.id),
    ...(product.partNumber ? { mpn: product.partNumber } : {}),
    brand: {
      "@type": "Brand",
      name: brand?.name ?? product.brand,
    },
    ...(reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(routes.product(product.id)),
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
}

export function itemListJsonLd(
  name: string,
  paths: string[]
): JsonLd | null {
  if (paths.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: paths.length,
    itemListElement: paths.slice(0, 50).map((path, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(path),
    })),
  };
}

export function collectionPageJsonLd(
  name: string,
  description: string,
  path: string
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };
}
