/* =========================================================
   DRIVORAPARTS — GLOBAL PRODUCT CONDITION RULES
   ---------------------------------------------------------
   Catalog categories always resolve to brand-new.
   Aftermarket always resolves to used / refurbished / mixed.
========================================================= */

import type { Product, ProductCondition } from "./types";

export type { ProductCondition };

/** Main catalog categories — never used/refurbished at listing level. */
export const CATALOG_CATEGORIES = [
  "engine",
  "transmission",
  "turbocharger",
  "suspension",
  "brakes",
  "bumper",
  "canopy",
  "electronics",
  "lighting",
  "body-parts",
  "interior",
  "4x4-accessories",
  "wheels-tires",
] as const;

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

export function isCatalogCategory(category: string): category is CatalogCategory {
  return (CATALOG_CATEGORIES as readonly string[]).includes(category);
}

export function isAftermarketCategory(category: string): boolean {
  return category === "aftermarket";
}

/**
 * Resolve the canonical condition slug from what the listing itself records.
 *
 * THE CATEGORY DOES NOT DECIDE THIS ANY MORE, AND IT NEVER SHOULD HAVE.
 * A category says where a part sits in the catalog. Only the listing knows
 * whether the part has been used. The old rule got that wrong in both
 * directions:
 *
 *  - Catalog categories were forced to brand-new unconditionally, which
 *    silently overrode listings that said otherwise: the Audi 4.0 TFSI (id
 *    55) declared "used" and was badged Brand New on the storefront and in
 *    the Meta catalog feed. Selling a used engine under a Brand New badge is
 *    a dispute the seller cannot win, so a stated condition started winning.
 *  - Everything in `aftermarket` was badged Used whatever it recorded. That
 *    category holds both genuine donor stock (truck beds, camper shells) and
 *    boxed new parts, so on 2026-09-20 an audit found 98 listings stored
 *    brand-new — Aeromotive regulators, DeatschWerks fittings — advertised
 *    as Used on the site, in the catalog filter's own results and to Meta.
 *
 * So the listing decides, whatever category it is in. Nothing is inferred
 * from the product name: a listing that records no condition at all falls
 * back to brand-new, which is what the overwhelming majority of the catalog
 * is, though in practice every listing carries one today.
 *
 * The aftermarket variants are kept rather than folded into `used`: they
 * carry the same wording and colour, and keeping them means an aftermarket
 * listing that says "used" resolves exactly as it did before this change.
 */
export function resolveProductCondition(
  product: Pick<Product, "category" | "condition">
): ProductCondition {
  const declared = (product.condition ?? "").toLowerCase().trim();
  const aftermarket = isAftermarketCategory(product.category);

  if (declared.includes("mixed")) return "aftermarket-mixed";

  if (declared.includes("refurbished") || declared.includes("remanufactured")) {
    return "refurbished";
  }

  // "Used Like New" is a used part, so used has to be tested before new.
  if (declared.includes("used")) {
    return aftermarket ? "aftermarket-used" : "used";
  }

  if (declared.includes("new")) return "brand-new";

  return "brand-new";
}

export type ConditionDisplay = {
  label: string;
  color: string;
  background: string;
  border: string;
};

export function getConditionDisplay(
  condition: ProductCondition
): ConditionDisplay {
  switch (condition) {
    case "brand-new":
      return {
        label: "Brand New",
        color: "var(--success)",
        background: "color-mix(in srgb, var(--success) 15%, transparent)",
        border: "color-mix(in srgb, var(--success) 40%, transparent)",
      };
    case "used":
      return {
        label: "Used",
        color: "var(--accent)",
        background: "var(--accent-subtle)",
        border: "var(--accent-border)",
      };
    case "refurbished":
      return {
        label: "Refurbished",
        color: "var(--info)",
        background: "var(--info-subtle)",
        border: "color-mix(in srgb, var(--info) 40%, transparent)",
      };
    case "aftermarket-used":
      return {
        label: "Used",
        color: "var(--accent)",
        background: "var(--accent-subtle)",
        border: "var(--accent-border)",
      };
    case "aftermarket-mixed":
      return {
        label: "Aftermarket",
        color: "var(--muted)",
        background: "var(--surface-muted)",
        border: "var(--border-strong)",
      };
  }
}

export function getConditionLabel(
  product: Pick<Product, "category" | "condition">
): string {
  const raw = (product.condition ?? "").toLowerCase();

  // A used item that has been checked over says so, so the badge matches the
  // Condition section further down the page rather than describing it twice
  // in two different ways.
  if (raw.includes("inspected")) {
    return "Used — Inspected & Tested";
  }

  // "Used Like New" was previously restricted to aftermarket listings. A
  // catalog item can be in that state just as easily — an inspected, tested
  // engine with little wear — and the seller should be able to say so.
  if (raw.includes("like new")) {
    return "Used Like New";
  }

  return getConditionDisplay(resolveProductCondition(product)).label;
}
