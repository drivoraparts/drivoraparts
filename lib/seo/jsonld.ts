import type { Product } from "@/lib/inventory/types";
import {
  COMPANY_ADDRESS,
  COMPANY_LEGAL_NAME,
  COMPANY_PHONE_DISPLAY,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/content/company";
import { routes } from "@/lib/inventory/routes";
import { getBrandBySlug } from "@/lib/inventory";
import { resolveProductGallery } from "@/lib/inventory/media";
import type { ProductReview } from "@/lib/reviews/types";
import { SITE_NAME, SITE_TAGLINE } from "./constants";
import {
  productOfferItemCondition,
  productOfferPriceValidUntil,
  productOfferReturnPolicy,
  productOfferShippingDetails,
  productOfferValidFrom,
} from "./merchant-policies";
import { absoluteImageUrl, absoluteUrl } from "./urls";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    // The registered entity behind the brand, with the business address and
    // phone number the owner has chosen to publish.
    legalName: COMPANY_LEGAL_NAME,
    url: absoluteUrl("/"),
    logo: absoluteImageUrl("/favicon.png"),
    email: COMPANY_SUPPORT_EMAIL,
    telephone: COMPANY_PHONE_DISPLAY,
    ...(COMPANY_ADDRESS
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: COMPANY_ADDRESS.street,
            addressLocality: COMPANY_ADDRESS.city,
            addressRegion: COMPANY_ADDRESS.state,
            postalCode: COMPANY_ADDRESS.postalCode,
            addressCountry: "US",
          },
        }
      : {}),
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description:
      "Shop performance engines, rust-free truck beds, 4x4 lift kits, bull bars, snorkels, turbos, brakes, suspension and swap parts.",
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

/**
 * Article markup for a DrivoraParts News story. Plain `Article`, not
 * `NewsArticle`: these are company-authored pieces, and the author and
 * publisher are both the organisation, stated as such. No legalName is
 * included -- the legal entity is not restated in editorial markup.
 */
export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  image: string;
  datePublished: string;
  author: string;
}): JsonLd {
  const url = absoluteUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: input.title,
    description: input.description,
    image: [absoluteImageUrl(input.image)],
    datePublished: input.datePublished,
    dateModified: input.datePublished,
    author: { "@type": "Organization", name: input.author, url: absoluteUrl("/") },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      logo: { "@type": "ImageObject", url: absoluteImageUrl("/favicon.png") },
    },
  };
}

export type ProductJsonLdReviews = {
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
};

/**
 * Review markup is emitted only from approved, stored reviews. With none, the
 * fields are left out entirely: Search Console flags them as non-critical, but
 * inventing a rating to silence it would be misleading markup.
 */
function productReviewJsonLd(input?: ProductJsonLdReviews): JsonLd {
  if (!input || input.reviewCount <= 0 || input.rating <= 0) return {};

  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: input.rating,
      reviewCount: input.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: input.reviews.map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.reviewerName },
      datePublished: review.createdAt.slice(0, 10),
      reviewBody: review.review,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };
}

export function productJsonLd(
  product: Product,
  price: number,
  reviews?: ProductJsonLdReviews
): JsonLd {
  const gallery = resolveProductGallery(product.thumbnail, product.images).map(
    absoluteImageUrl
  );
  const brand = getBrandBySlug(product.brand);
  const inStock = product.stock !== false;

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: gallery,
    description: (product.description ?? product.name)
      .split("\n")
      .slice(0, 6)
      .join(" ")
      .trim(),
    sku: String(product.id),
    ...(product.partNumber ? { mpn: product.partNumber } : {}),
    brand: {
      "@type": "Brand",
      name: brand?.name ?? product.brand,
    },
    ...productReviewJsonLd(reviews),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price,
      validFrom: productOfferValidFrom(),
      priceValidUntil: productOfferPriceValidUntil(),
      // Omitted when no condition is recorded (listing held pending
      // confirmation) instead of defaulting to NewCondition.
      ...(product.condition?.trim()
        ? { itemCondition: productOfferItemCondition(product.condition) }
        : {}),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(routes.product(product.id)),
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      shippingDetails: productOfferShippingDetails(product, price),
      hasMerchantReturnPolicy: productOfferReturnPolicy(),
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
