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
  { slug: "electronics", name: "Electronics" },
  { slug: "lighting", name: "Lighting" },
  { slug: "body-parts", name: "Body Parts" },
  { slug: "interior", name: "Interior" },
  { slug: "aftermarket", name: "Aftermarket" },
];
