import type { Product, ProductLogistics } from "./types";
import {
  getConditionLabel,
  resolveProductCondition,
} from "./condition";
import { productLogistics } from "./logistics";

export type { ProductLogistics };

export type InstallationResources = {
  difficulty?: string;
  estimatedTime?: string;
  torqueSpecs?: string;
  guideUrl?: string;
  videoUrl?: string;
};

export type ProductCatalogMeta = {
  horsepower?: string;
  /** Absent when mileage does not apply to this product. */
  mileage?: string;
  conditionLabel: string;
  warranty: string;
  rating: number;
  reviewCount: number;
  descriptionBody: string;
  specifications: string;
  /**
   * Verified attributes, as label/value pairs ready to render.
   *
   * The Specifications tab used to be built by parsing the description back
   * into sections, which meant a fact could only be shown if someone had
   * written it into prose first. These come from the product's own structured
   * fields, so the recovered part numbers and measurements appear without
   * being duplicated into the copy, where the two would drift apart.
   */
  specRows: { label: string; value: string }[];
  shippingAndWarranty: string;
  logistics: ProductLogistics;
  installResources: InstallationResources;
};

/** True when at least one real installation-resource field is populated. */
export function hasInstallationResources(resources: InstallationResources): boolean {
  return Boolean(
    resources.difficulty ||
      resources.estimatedTime ||
      resources.torqueSpecs ||
      resources.guideUrl ||
      resources.videoUrl
  );
}

/** True when at least one structured logistics field is populated. */
export function hasLogistics(logistics: ProductLogistics): boolean {
  return Boolean(
    logistics.partNumber ||
      logistics.fitment ||
      logistics.drivetrain ||
      (logistics.included && logistics.included.length > 0) ||
      logistics.coreCharge ||
      logistics.weight ||
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
    weight: text(product.weight, fallback.weight),
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

/*
 * Lines the ESS import wrote into the Highlights of 1,200+ listings that
 * describe the store rather than the part. The product page now states
 * shipping and fitment help from the store's published terms, so repeating
 * them as features said the same thing twice -- and "Quality-checked before
 * shipment" is a process nothing in the order flow performs or records. The
 * descriptions themselves are untouched; only these lines are not rendered.
 */
const STORE_BOILERPLATE_FEATURES = [
  /^usa warehouse fulfillment$/i,
  /^technical fitment support available$/i,
  /^quality-checked before shipment$/i,
];

function withoutStoreBoilerplate(block: string): string {
  return block
    .split("\n")
    .filter((line) => {
      const bare = line.trim().replace(/^[•\-*✓]\s*/, "");
      return !STORE_BOILERPLATE_FEATURES.some((re) => re.test(bare));
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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
  const highlights = withoutStoreBoilerplate(getSection("Highlights"));
  const keyFeatures = withoutStoreBoilerplate(getSection("Key Features"));
  const warranty = getSection("Warranty");
  const shipping = getSection("Shipping");

  const shippingAndWarranty = [warranty, shipping].filter(Boolean).join("\n\n");

  return {
    descriptionBody: descriptionBody || description.trim(),
    /** The Specifications section on its own -- see buildSpecRows. */
    specifications,
    /** Feature bullets, which are claims about the part rather than attributes. */
    featureBlocks: [highlights, keyFeatures].filter(Boolean).join("\n\n"),
    shippingAndWarranty,
  };
}

/*
 * A unit that accrues mileage, as opposed to a part bolted to one.
 *
 * The category field cannot answer this: "engine" holds 1,024 items, most of
 * them filters, manifolds and sensors. This reads the product name for the
 * thing being sold, then removes the accessories that merely mention a
 * powertrain -- an exhaust brake "(Automatic Transmission)" is a brake, and a
 * transfer case brace is a bracket.
 */
const POWERTRAIN_ASSEMBLY =
  /\b(complete engine|engine assembly|long ?block|short ?block|crate engine|engine package|swap package|drivetrain package|complete drivetrain|rotating assembly|transmission|transaxle|transfer case|gearbox)\b/i;

const POWERTRAIN_ACCESSORY =
  /\b(mount|mounts|bracket|brace|skid|filter|belt|hose|line|manifold|sensor|gasket|seal|bolt|stud|nut|washer|hardware|cooler|pan|pump|adapter|adaptor|spacer|shifter|linkage|cable|harness|controller|solenoid|valve body|dipstick|crossmember|fluid|cover|plate|flange|clamp|bushing|insulator|power steering|service kit|rebuild kit|shift kit|install kit|swap kit|conversion kit|kit for|flexplate|flywheel|clutch|dust|shield|guard|spring|arm|link|exhaust brake|brakeloc|idle control|module|support|tuner|programmer|monitor|gauge|switch|relay|wire)\b/i;

export function isPowertrainAssembly(product: Product): boolean {
  const name = product.name ?? "";
  return POWERTRAIN_ASSEMBLY.test(name) && !POWERTRAIN_ACCESSORY.test(name);
}

/**
 * Mileage, shown only where it means something.
 *
 * This used to return "0 Miles" for anything marked brand-new, which put an
 * odometer reading on 3,567 products -- seat belts, alternators, canopies,
 * recovery boards. That number was never recorded anywhere; it was inferred
 * from the condition field and rendered as though it were data. Forty-one
 * products in the catalog actually record a mileage.
 *
 * Returns undefined when the row should not appear at all. "Brand New" in the
 * condition row already tells a buyer the part is unused.
 */
export function resolveProductMileage(product: Product): string | undefined {
  if (product.mileage?.trim()) return product.mileage.trim();

  const condition = resolveProductCondition(product);

  // A crate engine or gearbox genuinely is zero miles, and that is worth
  // stating -- it is the difference between a new unit and a takeout.
  if (condition === "brand-new") {
    return isPowertrainAssembly(product) ? "0 Miles (Crate / Brand New)" : undefined;
  }

  // Used or remanufactured: mileage is a real question and we do not hold the
  // answer, so the row invites the one conversation that can settle it.
  return "Inquire for Mileage";
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

/*
 * Review aggregates are no longer computed here.
 *
 * They live in the database now, so reading them is async, while this builds
 * the static half of a product's presentation synchronously. The product page
 * fetches the real figures and merges them over these defaults — see
 * app/product/[id]/page.tsx. A product with no reviews reports none, which is
 * also the correct starting point for one that has some.
 */
export function resolveProductRating(_product: Product): number {
  return 0;
}

export function resolveProductReviewCount(_product: Product): number {
  return 0;
}

/*
 * Labels for the structured specification keys.
 *
 * The keys come from the research data, where they are terse and inconsistent
 * by nature ("anSize", "millimetres", "spal_model"). Anything not named here
 * falls back to a readable form of the key itself rather than being dropped --
 * a recovered fact should never go unshown because nobody wrote a label.
 */
const SPEC_LABELS: Record<string, string> = {
  product_type: "Product Type",
  finish: "Finish",
  millimetres: "Length",
  inches: "Size",
  psi: "Pressure",
  anSize: "AN Size",
  micronRating: "Filtration",
  lph: "Flow Rate",
  cfm: "Airflow",
  airflow_cfm: "Airflow",
  ar: "A/R Ratio",
  bar: "Pressure",
  ampHours: "Capacity",
  diameter_in: "Diameter",
  current_draw_a: "Current Draw",
  dimensions_mm: "Dimensions",
  dimensions_in: "Dimensions",
  spal_model: "Manufacturer Model",
  case_group: "Battery Group",
  primaries_in: "Primary Tube",
  lead_pipes_in: "Lead Pipe",
  flanges_in: "Flange Thickness",
  rotor_finish: "Rotor Finish",
  caliper_finish: "Caliper Finish",
  wheel_clearance: "Wheel Clearance",
  spring_rate: "Spring Rate",
  max_drop: "Maximum Drop",
  compressor_wheel: "Compressor Wheel",
  turbine_wheel: "Turbine Wheel",
  supercharger_drive: "Supercharger Drive",
  belt_wrap: "Belt Wrap",
  blade_style: "Blade Style",
  capacities_available: "Capacities Available",
};

/** Values that carry a unit the label does not already imply. */
const SPEC_UNITS: Record<string, string> = {
  millimetres: "mm",
  psi: "psi",
  micronRating: "micron",
  lph: "lph",
  cfm: "CFM",
  airflow_cfm: "CFM",
  bar: "bar",
  ampHours: "Ah",
  inches: "in",
  diameter_in: "in",
  current_draw_a: "A",
};

const humanizeKey = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/*
 * "Manufacturer: BD Diesel Performance" written into a description is an
 * attribute, not prose, and 2,351 products carry 11,000 such lines. They were
 * rendered as a wall of text because the only structured source was the
 * `specifications` field, which the ESS research filled and nothing else has.
 *
 * Reading them back out here rather than rewriting the catalog is deliberate:
 * most of these products are object literals inside a five-megabyte
 * TypeScript source file, and the descriptions are the authored original. A
 * parser keeps one source of truth; a migration would create two that drift.
 */
const SPEC_LINE = /^\s*[•\-*]?\s*([A-Za-z][A-Za-z0-9 /&()'.+-]{1,34}):\s*(.+?)\s*$/;

const normalizeValue = (value: unknown) =>
  String(value ?? "").toLowerCase().replace(/\s+/g, " ").replace(/[.,;]+$/, "").trim();

/**
 * Fields the product page already shows on another tab. A spec line is dropped
 * only when its text matches one of them exactly -- anything that differs is
 * kept, because a near-match is usually extra detail and losing it to tidy the
 * page would trade information for neatness.
 */
function shownElsewhere(product: Product, key: string): string[] {
  switch (key.toLowerCase()) {
    case "part number":
    case "part no":
      return [product.partNumber ?? ""];
    case "application":
    case "applications":
    case "vehicle":
    case "fitment":
      return [product.fitment ?? ""];
    case "drivetrain":
      return [product.drivetrain ?? ""];
    case "core charge":
      return [product.coreCharge ?? ""];
    case "warranty":
      return [product.warranty ?? ""];
    case "included":
    case "includes":
      return product.included ?? [];
    default:
      return [];
  }
}

/*
 * Boilerplate from the ESS import that carries no information about the part.
 * It was removed from 1,095 descriptions; the 124 still holding it are the
 * listings whose identity is unresolved and which are waiting on evidence.
 * Parsing lifts a line out of a paragraph and gives it a label and its own
 * row, so without this the claim we deleted everywhere else would end up
 * *more* prominent on exactly the products we trust least.
 */
const UNSUPPORTED_SPEC = [
  /^confirm vehicle fitment at checkout$/i,
  /^drivoraparts performance catalog$/i,
  /^new or low-mile takeout \(unit dependent\)$/i,
  /^performance \/ swap component$/i,
  // Says the photograph is of the unit being sold. True for the listings shot
  // in-house, unverified for the rest, and not something to assert as a spec.
  /^inspected and photographed as the actual unit/i,
];

/*
 * Availability written into a description ("Stock Status: In Stock") is a
 * snapshot of the day it was written. The page states availability from the
 * listing's stock field, which is the one that changes, so a copy frozen in
 * the prose could only ever agree with it or contradict it.
 */
const LIVE_STATE_LABEL = /^(stock status|availability)$/i;
const LIVE_STATE_LINE = /^(stock status|availability)\s*:/i;

function specRowsFromDescription(product: Product, section: string) {
  const rows: { label: string; value: string }[] = [];
  const seen = new Set<string>();

  for (const line of section.split("\n")) {
    const match = line.match(SPEC_LINE);
    if (!match) continue;
    const label = match[1].trim();
    const value = match[2].trim();
    if (!label || !value) continue;
    if (LIVE_STATE_LABEL.test(label)) continue;
    if (UNSUPPORTED_SPEC.some((re) => re.test(value))) continue;
    if (seen.has(label.toLowerCase())) continue;
    if (shownElsewhere(product, label).some((v) => v && normalizeValue(v) === normalizeValue(value))) continue;
    seen.add(label.toLowerCase());
    rows.push({ label, value });
  }

  return rows;
}

function buildSpecRows(
  product: Product,
  descriptionSection = ""
): { label: string; value: string }[] {
  // The researched field wins where it exists; otherwise read the description.
  if (!product.specifications && descriptionSection.trim()) {
    return specRowsFromDescription(product, descriptionSection);
  }

  const rows: { label: string; value: string }[] = [];
  const specs = product.specifications ?? {};

  // Several source keys can mean the same thing -- a SPAL fan carries both
  // `cfm` and `airflow_cfm` -- and both map to one label. Keep the first.
  const seen = new Set<string>();

  for (const [key, raw] of Object.entries(specs)) {
    const value = String(raw ?? "").trim();
    if (!value) continue;
    const label = SPEC_LABELS[key] ?? humanizeKey(key);
    if (seen.has(label)) continue;
    seen.add(label);
    const unit = SPEC_UNITS[key];
    rows.push({
      label,
      // "70" alone means nothing; "70 mm" does. Skip the unit when the value
      // already carries one, which the free-text specs sometimes do.
      value: unit && !new RegExp(`${unit}\\b`, "i").test(value) ? `${value} ${unit}` : value,
    });
  }

  // Product Type reads as the heading of the list, not a row in the middle.
  rows.sort((a, b) => (a.label === "Product Type" ? -1 : b.label === "Product Type" ? 1 : 0));
  return rows;
}

export function getProductCatalogMeta(product: Product): ProductCatalogMeta {
  const description = product.description ?? "";
  const sections = splitDescriptionSections(description);

  /*
   * Some products carry their attributes loose in the body rather than under a
   * Specifications heading -- a used gearbox stating its casting number, a tyre
   * its size and category. Those are read too, but only when there is no
   * Specifications section to read instead, and the lines are then taken out of
   * the narrative so the page does not state them on two tabs.
   */
  const fromBody = sections.specifications.trim() ? "" : sections.descriptionBody;
  const specRows = buildSpecRows(product, sections.specifications || fromBody);
  /*
   * Strip whenever there are rows, not only when they came from the body: a
   * few products state an attribute under Specifications AND again in their
   * opening paragraph, which read as the page repeating itself.
   */
  const descriptionBody = specRows.length > 0
    ? sections.descriptionBody
        .split("\n")
        // Matched on the label, not the whole line: the body often ends the
        // sentence with a full stop that the captured value does not carry,
        // and an exact comparison left the line sitting under its own row.
        .filter((line) => {
          const bare = line.trim().replace(/^[•\-*]\s*/, "").toLowerCase();
          if (LIVE_STATE_LINE.test(bare)) return false;
          return !specRows.some((r) => bare.startsWith(`${r.label.toLowerCase()}:`));
        })
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : sections.descriptionBody;

  return {
    horsepower: resolveProductHorsepower(product),
    mileage: resolveProductMileage(product),
    conditionLabel: getConditionLabel(product),
    warranty: resolveProductWarranty(product, description),
    rating: resolveProductRating(product),
    reviewCount: resolveProductReviewCount(product),
    descriptionBody,
    /*
     * Attributes become rows; feature bullets stay prose. When the spec lines
     * are parsed out of the description they must not also appear below the
     * rows, or the page states everything twice.
     */
    specifications: specRows.length > 0 ? sections.featureBlocks : [sections.specifications, sections.featureBlocks].filter(Boolean).join("\n\n"),
    specRows,
    shippingAndWarranty: sections.shippingAndWarranty,
    logistics: resolveProductLogistics(product),
    installResources: {
      difficulty: product.installDifficulty?.trim() || undefined,
      estimatedTime: product.installEstimatedTime?.trim() || undefined,
      torqueSpecs: product.installTorqueSpecs?.trim() || undefined,
      guideUrl: product.installGuideUrl?.trim() || undefined,
      videoUrl: product.installVideoUrl?.trim() || undefined,
    },
  };
}

export function getConditionLabelForProduct(product: Product): string {
  return getConditionLabel(product);
}
