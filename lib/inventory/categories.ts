/* =========================================================
   DRIVORAPARTS — CATEGORIES (SINGLE SOURCE OF TRUTH)
   ---------------------------------------------------------
   ONE naming system only: kebab-case, singular.
   These slugs are the canonical routing keys.
========================================================= */

import type { Category } from "./types";

export const categories: Category[] = [
  { slug: "engine", name: "Engine" },
  { slug: "transmission", name: "Transmission" },
  { slug: "turbocharger", name: "Turbocharger" },
  { slug: "suspension", name: "Suspension" },
  { slug: "brakes", name: "Brakes" },
  { slug: "bumper", name: "Bumpers" },
  { slug: "canopy", name: "Canopies" },
  { slug: "electronics", name: "Electronics" },
  { slug: "lighting", name: "Lighting" },
  { slug: "body-parts", name: "Body Parts" },
  { slug: "interior", name: "Interior" },
  { slug: "4x4-accessories", name: "4x4 Accessories" },
  { slug: "aftermarket", name: "Aftermarket" },
  { slug: "wheels-tires", name: "Wheels & Tires" },
];

/** Category pages show brands only — products live under /catalog/[category]/[brand]. */
export const BRAND_FIRST_CATEGORY_SLUGS = new Set([
  "brakes",
  "bumper",
  "canopy",
  "transmission",
  "turbocharger",
  "suspension",
  "electronics",
  "lighting",
  "body-parts",
  "interior",
  "4x4-accessories",
  "wheels-tires",
]);

export function categoryShowsProductsOnHub(slug: string): boolean {
  return !BRAND_FIRST_CATEGORY_SLUGS.has(slug);
}
