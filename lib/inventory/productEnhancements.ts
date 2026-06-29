import type { Product, ProductLogistics } from "./types";
import {
  getConditionLabel,
  resolveProductCondition,
} from "./condition";
import { productLogistics } from "./logistics";
import { getProductReviewAggregate } from "@/lib/reviews";

export type { ProductLogistics };

export type ProductCatalogMeta = {
  horsepower?: string;
  mileage: string;
  conditionLabel: string;
  warranty: string;
  rating: number;
  reviewCount: number;
  descriptionBody: string;
  specifications: string;
  shippingAndWarranty: string;
  logistics: ProductLogistics;
};

/** True when at least one structured logistics field is populated. */
export function hasLogistics(logistics: ProductLogistics): boolean {
  return Boolean(
    logistics.partNumber ||
      logistics.fitment ||
      logistics.drivetrain ||
      (logistics.included && logistics.included.length > 0) ||
      logistics.coreCharge ||
      logistics.freightNotes ||
      logistics.warrantyTerms
  );
}

function resolveProductLogistics(product: Product): ProductLogistics {
  // Inline product fields take priority; fall back to the central map by id.
  const fallback = productLogistics[product.id] ?? {};
  const text = (inline?: string, mapped?: string) =>
    inline?.trim() || mapped?.trim() || undefined;

  return {
    partNumber: text(product.partNumber, fallback.partNumber),
    fitment: text(product.fitment, fallback.fitment),
    drivetrain: text(product.drivetrain, fallback.drivetrain),
    included:
      product.included && product.included.length > 0
        ? product.included
        : fallback.included && fallback.included.length > 0
          ? fallback.included
          : undefined,
    coreCharge: text(product.coreCharge, fallback.coreCharge),
    freightNotes: text(product.freightNotes, fallback.freightNotes),
    warrantyTerms: text(product.warrantyTerms, fallback.warrantyTerms),
  };
}

const SECTION_HEADERS = [
  "Specifications",
  "Highlights",
  "Warranty",
  "Shipping",
  "Key Features",
] as const;

function extractHorsepower(description: string): string | undefined {
  const match = description.match(/Factory Power:\s*(.+)/i);
  return match?.[1]?.trim();
}

function extractWarranty(description: string): string | undefined {
  const match = description.match(/Warranty\s*\n([^\n]+)/i);
  return match?.[1]?.trim();
}

function splitDescriptionSections(description: string) {
  const lines = description.split("\n");
  const sectionIndexes: { name: string; index: number }[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (SECTION_HEADERS.includes(trimmed as (typeof SECTION_HEADERS)[number])) {
      sectionIndexes.push({ name: trimmed, index });
    }
  });

  const introEnd =
    sectionIndexes.length > 0 ? sectionIndexes[0].index : lines.length;
  const descriptionBody = lines.slice(0, introEnd).join("\n").trim();

  const getSection = (name: string) => {
    const start = sectionIndexes.find((section) => section.name === name);
    if (!start) return "";

    const startIndex = sectionIndexes.findIndex(
      (section) => section.name === name
    );
    const endIndex =
      startIndex + 1 < sectionIndexes.length
        ? sectionIndexes[startIndex + 1].index
        : lines.length;

    return lines
      .slice(start.index + 1, endIndex)
      .join("\n")
      .trim();
  };

  const specifications = getSection("Specifications");
  const highlights = getSection("Highlights");
  const keyFeatures = getSection("Key Features");
  const warranty = getSection("Warranty");
  const shipping = getSection("Shipping");

  const specBlocks = [specifications, highlights, keyFeatures]
    .filter(Boolean)
    .join("\n\n");

  const shippingAndWarranty = [warranty, shipping].filter(Boolean).join("\n\n");

  return {
    descriptionBody: descriptionBody || description.trim(),
    specifications: specBlocks,
    shippingAndWarranty,
  };
}

export function resolveProductMileage(product: Product): string {
  if (product.mileage?.trim()) return product.mileage.trim();

  const condition = resolveProductCondition(product);
  if (condition === "brand-new") return "0 Miles";

  return "Contact for Details";
}

export function resolveProductWarranty(
  product: Product,
  description?: string
): string {
  if (product.warranty?.trim()) return product.warranty.trim();

  const fromDescription = description
    ? extractWarranty(description)
    : undefined;
  if (fromDescription) {
    return fromDescription.replace(/limited warranty/i, "Warranty").trim();
  }

  return "24 Month Warranty";
}

export function resolveProductHorsepower(product: Product): string | undefined {
  if (product.horsepower?.trim()) return product.horsepower.trim();
  if (product.category !== "engine" || !product.description) return undefined;
  return extractHorsepower(product.description);
}

export function resolveProductRating(product: Product): number {
  return getProductReviewAggregate(product.id).rating;
}

export function resolveProductReviewCount(product: Product): number {
  return getProductReviewAggregate(product.id).reviewCount;
}

export function getProductCatalogMeta(product: Product): ProductCatalogMeta {
  const description = product.description ?? "";
  const sections = splitDescriptionSections(description);

  return {
    horsepower: resolveProductHorsepower(product),
    mileage: resolveProductMileage(product),
    conditionLabel: getConditionLabel(product),
    warranty: resolveProductWarranty(product, description),
    rating: resolveProductRating(product),
    reviewCount: resolveProductReviewCount(product),
    descriptionBody: sections.descriptionBody,
    specifications: sections.specifications,
    shippingAndWarranty: sections.shippingAndWarranty,
    logistics: resolveProductLogistics(product),
  };
}

export function getConditionLabelForProduct(product: Product): string {
  return getConditionLabel(product);
}
