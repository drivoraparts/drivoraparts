import type { Product } from "./types";
import productMediaOverrides from "./data/product-media-overrides.json";

type MediaOverride = {
  thumbnail: string;
  images: string[];
};

const overrides = productMediaOverrides as Record<string, MediaOverride>;

/** Apply folder-based media fixes (see scripts/fix-duplicate-product-media.mjs). */
export function applyProductMediaOverrides(catalog: Product[]): Product[] {
  return catalog.map((product) => {
    const override = overrides[String(product.id)];
    if (!override) return product;

    return {
      ...product,
      thumbnail: override.thumbnail,
      image: override.thumbnail,
      images: override.images,
    };
  });
}
