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
    "Buy online at DrivoraParts with free standard shipping.",
  ]
    .filter(Boolean)
    .join(" ");

  return truncateSeoDescription(composed);
}

/** Section headings a description may carry after its opening title line. */
const DESCRIPTION_SECTIONS = /^(Specifications|Highlights|Warranty|Shipping|Key Features)$/;

/**
 * True when a listing has no copy of its own — nothing beyond its name and the
 * store-wide warranty and shipping lines every listing repeats.
 *
 * Google treats those as thin, near-duplicate pages and will not index them
 * even with a correct canonical, so they stay out of the sitemap and carry
 * noindex until they have real copy. Merchandising reads the same signal to
 * sort them behind listings that do (lib/catalog/merchandising.ts).
 *
 * This used to look for the two template sentences the bulk imports wrote
 * ("Sourced and inspected for DrivoraParts..." / "Confirm vehicle fitment at
 * checkout"). Those sentences are gone: the ESS listings now carry the
 * seller's own copy where it exists, and where it does not the body is simply
 * absent rather than filled with a template. Matching strings would therefore
 * match nothing, and ~590 body-less pages would have quietly become indexable.
 *
 * So the test is structural instead of textual: is there a body at all? That
 * holds for the next import too, without anyone having to register its
 * particular boilerplate here.
 */
export function hasGenericPlaceholderDescription(description?: string): boolean {
  if (!description) return true;

  const lines = description.split("\n");
  const firstSection = lines.findIndex((line) =>
    DESCRIPTION_SECTIONS.test(line.trim())
  );

  // Everything between the title line and the first section heading.
  const body = lines
    .slice(1, firstSection === -1 ? lines.length : firstSection)
    .join("\n")
    .trim();

  if (body) return false;

  /*
   * No prose, but a Specifications or Highlights block is still substance a
   * buyer came for -- a spec table is not thin content. Only a listing with
   * neither is treated as having nothing to say.
   */
  if (firstSection === -1) return true;

  const sectionNames = lines
    .slice(firstSection)
    .map((line) => line.trim())
    .filter((line) => DESCRIPTION_SECTIONS.test(line));

  return !sectionNames.some(
    (name) =>
      name === "Specifications" || name === "Highlights" || name === "Key Features"
  );
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
