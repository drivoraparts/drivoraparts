import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "./constants";
import { truncateSeoDescription } from "./text";
import { absoluteImageUrl, absoluteUrl } from "./urls";

type PageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const metaDescription = truncateSeoDescription(description);
  const ogImage = absoluteImageUrl(image);

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
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
