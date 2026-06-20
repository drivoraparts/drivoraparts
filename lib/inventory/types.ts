/* =========================================================
   DRIVORAPARTS — INVENTORY CORE TYPES
   ---------------------------------------------------------
   Strict master types for the central inventory layer.
   Slugs are ALWAYS kebab-case and are the canonical keys
   used for routing and filtering.
========================================================= */

export type Category = {
  /** Canonical kebab-case slug, e.g. "engine", "body-parts". */
  slug: string;
  /** Human-readable display name, e.g. "Body Parts". */
  name: string;
};

export type Brand = {
  /** Canonical kebab-case slug, e.g. "bmw", "brembo-gt-kits". */
  slug: string;
  /** Human-readable display name, e.g. "BMW". */
  name: string;
  /** Parent category slug (kebab-case). */
  category: string;
};

/**
 * Product is the normalized inventory record.
 *
 * NOTE ON `id`:
 * The Phase-1 spec proposed `id: string`. The existing cart,
 * checkout, product route (`getProductById(Number(id))`) and
 * product cards are all typed to a numeric id. Because Phase 1
 * must NOT change UI/routing/behavior, we keep `id: number` for
 * now. Migrating to string ids is a safe follow-up once UI
 * components are allowed to change.
 *
 * `category` and `brand` reference the canonical kebab-case
 * slugs from categories.ts and brands.ts.
 */
export type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;

  /** Whether the product is in stock. */
  stock?: boolean;

  /** Optional unit quantity for marketplace stock testing. */
  stockQty?: number;

  /** Engine system only: the engine platform slug this product belongs to. */
  platform?: string;

  /** Primary image (alias supported for forward compatibility). */
  image?: string;
  /** Primary thumbnail used by the current UI. */
  thumbnail?: string;
  /** Gallery images used by the product detail page. */
  images?: string[];

  condition?: string;
  location?: string;
  description?: string;

  /** Optional listing timestamp for sort (e.g. aftermarket feed). */
  createdAt?: number;
};
