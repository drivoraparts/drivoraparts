import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_NAME } from "./constants";
import { truncateSeoDescription } from "./text";
import { absoluteImageUrl, absoluteUrl } from "./urls";

type PageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  /** Product or page-specific preview image. Omit to use the site favicon. */
  image?: string | null;
  keywords?: string[];
  noIndex?: boolean;
};

export function defaultSiteSocialImages(): NonNullable<
  Metadata["openGraph"]
>["images"] {
  return [
    {
      url: absoluteImageUrl(DEFAULT_OG_IMAGE),
      width: 512,
      height: 512,
      alt: SITE_NAME,
    },
  ];
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  keywords,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const metaDescription = truncateSeoDescription(description);
  const usesSiteImage = !image?.trim();
  const ogImage = absoluteImageUrl(image);
  const ogImages = usesSiteImage
    ? defaultSiteSocialImages()
    : [{ url: ogImage, alt: title }];

  return {
    title,
    description: metaDescription,
    ...(keywords?.length ? { keywords: keywords.slice(0, 24) } : {}),
    alternates: { canonical: url },
    openGraph: {
      title,
      description: metaDescription,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: ogImages,
    },
    twitter: {
      card: usesSiteImage ? "summary" : "summary_large_image",
      title,
      description: metaDescription,
      images: [ogImage],
    },
    // noindex keeps a thin page out of the index; nofollow also told crawlers
    // to stop at it, so the links out of 1,219 product pages — to categories,
    // to related products — were dead ends, and the pages worth indexing lost
    // that many paths to them. "noindex, follow" is the pairing that keeps the
    // page unindexed while letting the crawl continue through it.
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}
