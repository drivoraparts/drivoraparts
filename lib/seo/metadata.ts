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
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
