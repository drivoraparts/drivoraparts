import {
  getBrandBySlug,
  getConditionLabel,
  getProductThumbnail,
  resolveProductGallery,
} from "@/lib/inventory";
import { shortFitment } from "@/lib/catalog/short-fitment";
import type { Product } from "@/lib/inventory/types";
import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";

/**
 * A product as the rails' card wants it.
 *
 * This used to map ten fields and stop, which is why every rail on the site
 * printed a name and a price while the marketplace grid beside it printed the
 * brand, what the part fits, its condition and whether it was in stock. The
 * card's own type had always declared those fields; nothing was filling them.
 *
 * Everything here is read from the listing. Nothing is derived, defaulted or
 * inferred: a listing with no fitment recorded yields no fitment, and the card
 * prints nothing rather than a guess.
 */
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
    condition: product.condition,
    conditionLabel: product.condition ? getConditionLabel(product) : undefined,
    // The display name for the slug, so a card can print "Wilwood" rather
    // than "wilwood-big-brake-kits". Same resolution the query uses.
    brandName: getBrandBySlug(product.brand)?.name ?? product.brand,
    partNumber: product.partNumber || undefined,
    fitment: shortFitment(product.fitment),
    inStock: product.stock,
  };
}
