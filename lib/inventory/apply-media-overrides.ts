import type { Product } from "./types";
import productMediaOverrides from "./data/product-media-overrides.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

type MediaOverride = {
  thumbnail: string;
  images: string[];
};

const overrides = productMediaOverrides as Record<string, MediaOverride>;

function placeholderForProduct(id: number): string {
  return `/product-media/placeholders/${id}.svg`;
}

function replaceDefaultMedia(product: Product, media: MediaOverride): MediaOverride {
  const placeholder = placeholderForProduct(product.id);
  const thumbnail =
    media.thumbnail === DEFAULT_PRODUCT_IMAGE ? placeholder : media.thumbnail;
  const images = media.images.map((ref) =>
    ref === DEFAULT_PRODUCT_IMAGE ? placeholder : ref
  );

  return {
    thumbnail,
    images: images.length > 0 ? images : [thumbnail],
  };
}

/** Apply generated media dedupe overrides (see scripts/fix-duplicate-product-media.mjs). */
export function applyProductMediaOverrides(catalog: Product[]): Product[] {
  return catalog.map((product) => {
    const override = overrides[String(product.id)];
    const media = override
      ? replaceDefaultMedia(product, override)
      : product.thumbnail === DEFAULT_PRODUCT_IMAGE ||
          product.images?.includes(DEFAULT_PRODUCT_IMAGE)
        ? replaceDefaultMedia(product, {
            thumbnail: product.thumbnail ?? DEFAULT_PRODUCT_IMAGE,
            images:
              product.images?.length && product.images.length > 0
                ? product.images
                : [product.thumbnail ?? DEFAULT_PRODUCT_IMAGE],
          })
        : null;

    if (!media) return product;

    return {
      ...product,
      thumbnail: media.thumbnail,
      image: media.thumbnail,
      images: media.images,
    };
  });
}
