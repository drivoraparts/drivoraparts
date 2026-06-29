/* =========================================================
   DRIVORAPARTS — INVENTORY QUERY ENGINE
   ---------------------------------------------------------
   The single public entry point for inventory data.
   Import from "@/lib/inventory" everywhere.

   Safety: every query returns an array (possibly empty) or
   undefined for single lookups — it never throws, so pages
   can render a clean fallback when a category has no data.
========================================================= */

import { categories, categoryShowsProductsOnHub } from "./categories";
import { brands } from "./brands";
import { products } from "./products";
import { CHECKOUT_TEST_PRODUCT_ID } from "./pricing";
import type { Brand, Category, Product } from "./types";

export type { Brand, Category, Product, ProductCondition } from "./types";
export { categories, brands, products, categoryShowsProductsOnHub };
export { routes } from "./routes";
export {
  DEFAULT_PRODUCT_IMAGE,
  resolveProductImage,
  resolveProductGallery,
  getProductThumbnail,
} from "./media";
export {
  resolveProductCondition,
  getConditionDisplay,
  getConditionLabel,
  isCatalogCategory,
  isAftermarketCategory,
  CATALOG_CATEGORIES,
} from "./condition";
export type { ConditionDisplay } from "./condition";
export {
  getProductCatalogMeta,
  resolveProductHorsepower,
  resolveProductMileage,
  resolveProductRating,
  resolveProductReviewCount,
  resolveProductWarranty,
} from "./productEnhancements";
export type { ProductCatalogMeta } from "./productEnhancements";
/** Normalize any string into a canonical kebab-case slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ---------- Categories ---------- */

export const getCategories = (): Category[] => categories;

export const getCategory = (slug: string): Category | undefined =>
  categories.find((c) => c.slug === slug);

/* ---------- Brands ---------- */

export const getBrands = (): Brand[] => brands;

export const getBrandsByCategory = (category: string): Brand[] =>
  category ? brands.filter((b) => b.category === category) : [];

export const getBrandBySlug = (slug: string): Brand | undefined =>
  brands.find((b) => b.slug === slug);

/* ---------- Products ---------- */

function sortProductsNewestFirst(items: Product[]): Product[] {
  return [...items].sort(
    (a, b) => (b.createdAt ?? b.id) - (a.createdAt ?? a.id)
  );
}

/** Every marketplace listing (all categories) for the All Products feed. Newest first. */
export const getAllProducts = (): Product[] =>
  sortProductsNewestFirst(
    products.filter((product) => product.id !== CHECKOUT_TEST_PRODUCT_ID)
  );

export const getProductsByCategory = (category: string): Product[] =>
  category
    ? sortProductsNewestFirst(products.filter((p) => p.category === category))
    : [];

export const getProductsByBrand = (brand: string): Product[] =>
  brand ? products.filter((p) => p.brand === brand) : [];

export const getProductById = (id: number): Product | undefined =>
  products.find((p) => p.id === id);
