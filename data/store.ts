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
} from "@/lib/inventory";

export const slugify = invSlugify;

export type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  platform?: string;
  price: number;
  condition: string;
  location: string;
  thumbnail: string;
  images: string[];
  description: string;
};

export type Category = {
  name: string;
  brands: string[];
  products: Product[];
};

/** Map a brand slug back to its display name (legacy stored value). */
function brandNameForSlug(slug: string): string {
  return invBrands.find((b) => b.slug === slug)?.name ?? slug;
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
        brand: brandNameForSlug(p.brand),
        platform: p.platform,
        price: p.price,
        condition: getConditionLabel(p),
        location: p.location ?? "",
        thumbnail: p.thumbnail ?? p.image ?? "",
        images: p.images ?? [],
        description: p.description ?? "",
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
  const category = getCategory(categorySlug);
  if (!category) return undefined;
  return category.brands.find((brand) => slugify(brand) === brandSlug);
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
