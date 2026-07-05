import { getBrandBySlug } from "@/lib/inventory";
import { buildProductKeywords } from "./keywords";
import { truncateSeoDescription } from "./text";

type ProductSeoInput = {
  name: string;
  category: string;
  brand?: string;
  fitment?: string;
  description?: string;
};

export function buildProductSeoTitle(input: ProductSeoInput): string {
  const brand = getBrandBySlug(input.brand ?? "");
  const brandLabel = brand?.name;
  const parts = [input.name];

  if (brandLabel && !input.name.toLowerCase().includes(brandLabel.toLowerCase())) {
    parts.push(brandLabel);
  }
  if (input.fitment && !input.name.includes(input.fitment)) {
    parts.push(input.fitment);
  }

  const title = parts.join(" — ");
  return title.length > 110 ? `${title.slice(0, 107).trim()}…` : title;
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
