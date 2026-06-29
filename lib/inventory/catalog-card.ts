import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";
import type { Product } from "./types";
import { getProductThumbnail } from "./media";

export function toCatalogCardData(product: Product): CatalogProductCardData {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    thumbnail: getProductThumbnail(product),
    images: product.images,
    category: product.category,
    brand: product.brand,
  };
}
