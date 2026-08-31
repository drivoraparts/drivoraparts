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

function resolveAftermarketCondition(raw?: string): ProductCondition {
  const value = (raw ?? "").toLowerCase().trim();

  if (value.includes("mixed")) return "aftermarket-mixed";
  if (value.includes("remanufactured") || value.includes("refurbished")) {
    return "refurbished";
  }
  if (value === "new") return "refurbished";
  if (value.includes("used")) return "aftermarket-used";

  return "aftermarket-used";
}

/**
 * Resolve canonical condition slug for any product.
 * Catalog products are always forced to brand-new.
 */
export function resolveProductCondition(
  product: Pick<Product, "category" | "condition">
): ProductCondition {
  if (isAftermarketCategory(product.category)) {
    return resolveAftermarketCondition(product.condition);
  }

  /*
   * An explicitly declared condition wins over the category default.
   *
   * Catalog categories used to be forced to brand-new unconditionally, on the
   * assumption that everything in them is new. That silently overrode listings
   * that said otherwise: the Audi 4.0 TFSI (id 55) declared "used" and was
   * badged Brand New on the storefront and in the Meta catalog feed. Selling a
   * used engine under a Brand New badge is a dispute the seller cannot win, so
   * a stated condition is now respected.
   *
   * Anything that does not declare one still defaults to brand-new, which is
   * what the overwhelming majority of catalog listings are.
   */
  const declared = (product.condition ?? "").toLowerCase().trim();

  if (declared.includes("refurbished") || declared.includes("remanufactured")) {
    return "refurbished";
  }

  if (declared.includes("used")) {
    return "used";
  }

  if (isCatalogCategory(product.category)) {
    return "brand-new";
  }

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
