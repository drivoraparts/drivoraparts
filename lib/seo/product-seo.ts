import { getBrandBySlug } from "@/lib/inventory";
import { buildProductKeywords } from "./keywords";
import { normalizeSeoText, truncateSeoDescription, truncateSeoTitle } from "./text";

type ProductSeoInput = {
  name: string;
  category: string;
  brand?: string;
  fitment?: string;
  description?: string;
};

/**
 * Google renders roughly 60 characters of a title, and the root layout appends
 * " | DrivoraParts" (15) to whatever this returns — so a qualifier pushed past
 * ~45 characters is paid for and never seen. Brand and fitment are therefore
 * only appended while they still fit, and the product name (which carries the
 * search term) keeps the front of the tag.
 */
const TITLE_QUALIFIER_BUDGET = 45;
const TITLE_HARD_CAP = 65;

export function buildProductSeoTitle(input: ProductSeoInput): string {
  const brand = getBrandBySlug(input.brand ?? "");
  let title = normalizeSeoText(input.name);

  const appendIfItFits = (part?: string) => {
    const value = part?.trim();
    if (!value) return;
    if (title.toLowerCase().includes(value.toLowerCase())) return;

    const next = `${title} — ${value}`;
    if (next.length <= TITLE_QUALIFIER_BUDGET) title = next;
  };

  appendIfItFits(brand?.name);
  appendIfItFits(input.fitment);

  return truncateSeoTitle(title, TITLE_HARD_CAP);
}

export function buildProductSeoDescription(input: ProductSeoInput): string {
  const brand = getBrandBySlug(input.brand ?? "");
  const brandLabel = brand?.name ?? input.brand;
  const categoryLabel = input.category.replace(/-/g, " ");

  const lead = input.description
    ? input.description.split("\n").map((l) => l.trim()).find((l) => l.length > 40)
    : undefined;

  const fitmentLine = input.fitment ? `Fitment: ${input.fitment}.` : "";
  const brandLine = brandLabel ? `${brandLabel} ${categoryLabel} part.` : `${categoryLabel} upgrade.`;

  const composed = [
    lead,
    brandLine,
    fitmentLine,
    "Buy online at DrivoraParts with secure checkout and worldwide shipping.",
  ]
    .filter(Boolean)
    .join(" ");

  return truncateSeoDescription(composed);
}

/**
 * Bulk-imported catalog rows (ess-catalog, edmunds-truck-parts) fall back to a
 * generic template when no real spec/fitment copy exists ("Sourced and
 * inspected for DrivoraParts..." / "Confirm ... at checkout"). Google flags
 * these as near-duplicate thin content and won't index them even once the
 * canonical tag is correct, so they're kept out of the index until they get
 * real descriptions.
 */
const GENERIC_DESCRIPTION_MARKERS = [
  /sourced and inspected for drivoraparts customers who need reliable fitment/i,
  /confirm[^.\n]*at checkout/i,
];

export function hasGenericPlaceholderDescription(description?: string): boolean {
  if (!description) return false;
  return GENERIC_DESCRIPTION_MARKERS.some((marker) => marker.test(description));
}

export function buildProductMetaKeywords(input: ProductSeoInput): string[] {
  const brand = getBrandBySlug(input.brand ?? "");
  return buildProductKeywords({
    name: input.name,
    category: input.category,
    brand: input.brand,
    brandName: brand?.name,
    fitment: input.fitment,
  });
}
