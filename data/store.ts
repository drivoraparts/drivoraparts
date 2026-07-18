/* =========================================================
   DRIVORAPARTS — DATA LAYER (LEGACY COMPATIBILITY SHIM)
   ---------------------------------------------------------
   The single source of truth is now /lib/inventory.
   This file no longer holds any data. It DERIVES the legacy
   `store` shape and helpers from the normalized inventory so
   existing consumers keep working unchanged:

     store[slug] = { name, brands: string[], products: Product[] }

   Legacy semantics preserved on purpose:
     - product.brand and category.brands use DISPLAY NAMES
       (e.g. "BMW"), not slugs.
     - getProductById takes a numeric id.
========================================================= */

import {
  categories as invCategories,
  brands as invBrands,
  products as invProducts,
  slugify as invSlugify,
  getConditionLabel,
  resolveProductGallery,
  getProductThumbnail,
} from "@/lib/inventory";

export const slugify = invSlugify;

export type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  platform?: string;
  price: number;
  compareAtPrice?: number;
  condition: string;
  location: string;
  thumbnail: string;
  images: string[];
  description: string;
  sourceUrl?: string;
};

export type Category = {
  name: string;
  brands: string[];
  products: Product[];
};

/** Map a brand slug back to its display name (legacy stored value).
 * Scoped by category — the same slug can be registered under multiple
 * categories with different display names (e.g. "toyota" is plain "Toyota"
 * in most categories but "Toyota Genuine" in lighting), and an unscoped
 * lookup would always resolve to whichever entry happens to appear first
 * in brands.ts regardless of which category is actually being rendered. */
function brandNameForSlug(slug: string, categorySlug: string): string {
  return (
    invBrands.find((b) => b.slug === slug && b.category === categorySlug)
      ?.name ?? slug
  );
}

/** Reconstruct the legacy store record from the normalized inventory. */
export const store: Record<string, Category> = Object.fromEntries(
  invCategories.map((category) => {
    const brands = invBrands
      .filter((b) => b.category === category.slug)
      .map((b) => b.name);

    const products: Product[] = invProducts
      .filter((p) => p.category === category.slug)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        brand: brandNameForSlug(p.brand, category.slug),
        platform: p.platform,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        condition: getConditionLabel(p),
        location: p.location ?? "",
        thumbnail: getProductThumbnail(p),
        images: resolveProductGallery(p.thumbnail ?? p.image, p.images),
        description: p.description ?? "",
        sourceUrl: p.sourceUrl,
      }));

    return [category.slug, { name: category.name, brands, products }] as [
      string,
      Category
    ];
  })
);

/* =========================
   HELPERS (DERIVED — NOT A SECOND SOURCE)
========================= */

export function getCategory(slug: string): Category | undefined {
  return Object.prototype.hasOwnProperty.call(store, slug)
    ? store[slug]
    : undefined;
}

export function getBrand(
  categorySlug: string,
  brandSlug: string
): string | undefined {
  // Trust the registered slug field directly rather than re-deriving one
  // from the display name via slugify() — some entries (e.g. "Toyota
  // Genuine" in lighting) have a registered slug that intentionally
  // doesn't match slugify(name), and re-deriving silently breaks the lookup.
  const brandRecord = invBrands.find(
    (b) => b.category === categorySlug && b.slug === brandSlug
  );
  return brandRecord?.name;
}

export function getCategoryList(): { slug: string; name: string }[] {
  return Object.entries(store).map(([slug, category]) => ({
    slug,
    name: category.name,
  }));
}

export function getAllProducts(): Product[] {
  return Object.values(store).flatMap((category) => category.products);
}

export function getProductById(id: number): Product | undefined {
  return getAllProducts().find((product) => product.id === id);
}
