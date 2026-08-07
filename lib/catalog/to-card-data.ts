import { getProductThumbnail, resolveProductGallery } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";
import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";

export function toCatalogCardData(product: Product): CatalogProductCardData {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    thumbnail: getProductThumbnail(product),
    images: resolveProductGallery(product.thumbnail ?? product.image, product.images),
    category: product.category,
    brand: product.brand,
  };
}
