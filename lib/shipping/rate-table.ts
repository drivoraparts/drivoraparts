/* =========================================================
   DRIVORAPARTS — SHIPPING LABELS AND PUBLISHED US RATE TABLE
   ---------------------------------------------------------
   Pure data and functions, with no catalog import, so client
   components can use them. lib/shipping/rates.ts binds them to
   the catalog; read its header for how a charge is decided.
========================================================= */

/* ---------------------------------------------------------
   Labels
   These strings are sent to Google as `shipping_label` and
   are what Merchant Center shipping services are keyed on.
   Do not rename them without changing Merchant Center too.
--------------------------------------------------------- */

export type ShippingLabel = "parcel" | "multibox" | "freight";

export const SHIPPING_LABELS: readonly ShippingLabel[] = ["parcel", "multibox", "freight"];

export const SHIPPING_LABEL_TEXT: Record<ShippingLabel, string> = {
  parcel: "Standard parcel",
  multibox: "Multi-box shipment",
  freight: "Freight (oversized or palletized)",
};

/** Heavier labels win when a cart mixes them. */
const LABEL_ORDER: ShippingLabel[] = ["parcel", "multibox", "freight"];

export type ShippingClassification = {
  label: ShippingLabel;
  /**
   * "listing": read from the product's own freight notes.
   * "name": no notes, and the name is unmistakably a whole freight unit (a
   *   truck bed, a complete engine or gearbox) whatever its category says.
   * "category": no notes, so inferred from category and name.
   * "name" and "category" are UNCONFIRMED -- review them with
   * scripts/report-shipping-classification.mjs.
   */
  source: "listing" | "name" | "category";
};

/**
 * Label from a listing's freight notes. Order matters, and mirrors
 * shipmentType() in lib/content/purchase-terms.ts: "Ships via standard
 * insured parcel/courier -- no special freight handling required" mentions
 * freight only to rule it out, and a multi-box note says larger kits "may be
 * palletized".
 */
export function labelFromFreightNotes(notes?: string | null): ShippingLabel | undefined {
  const value = String(notes ?? "").toLowerCase().trim();
  if (!value) return undefined;
  if (/multiple\b.*\bboxes|multi-?box/.test(value)) return "multibox";
  if (/\bparcel\b/.test(value)) return "parcel";
  if (/pallet|freight|\bltl\b|oversize|bulky/.test(value)) return "freight";
  if (/courier/.test(value)) return "parcel";
  return undefined;
}

const SMALL_COMPONENT =
  /\b(pump|filter|sensor|gasket|seal|injector|hose|clamp|bolt|nut|cap|adapter|spacer|bracket|switch|relay|valve|belt|plug|wire|harness|bulb|lug|cover|knob|shirt|sticker|decal)\b/;

/**
 * Fallback for listings without freight notes. Categories are grouped by how
 * that kind of part usually ships; a small-component name (a fuel pump in the
 * "engine" category) is a parcel regardless.
 */
export function labelFromCategory(category: string, name: string): ShippingLabel {
  if (SMALL_COMPONENT.test(name.toLowerCase())) return "parcel";
  switch (category) {
    case "engine":
    case "transmission":
    case "canopy":
    case "body-parts":
      return "freight";
    case "suspension":
    case "bumper":
    case "wheels-tires":
    case "4x4-accessories":
      return "multibox";
    default:
      return "parcel";
  }
}

/**
 * The label for a listing, from its own freight notes when it has them and
 * from its category and name when it does not. Pure, so client components
 * (the product page) can call it without pulling in the catalog.
 */
/**
 * Names that are a whole freight unit whatever category the listing was filed
 * under -- found by the classification review, where a truck bed filed as
 * "aftermarket" fell through to parcel (and so to free shipping under $1,000).
 * Accessories for those units (a bed mat, a liner, a mount) are excluded.
 */
const WHOLE_FREIGHT_UNIT =
  /\b(truck ?bed|complete (engine|gearbox|transmission|motor)|long ?block|short ?block|crate (engine|motor)|engine assembly|transmission assembly|swap drivetrain|drivetrain package|camper shell|topper)\b/;
const UNIT_ACCESSORY =
  /\b(mat|liner|rail|rails|light|lights|mount|mounts|bracket|bolt|seal|gasket|tie|ties|step|steps|cover|tonneau|organizer|net|strap|sensor|filter)\b/;

export function classifyShipping(input: {
  category: string;
  name: string;
  freightNotes?: string | null;
}): ShippingClassification {
  const fromNotes = labelFromFreightNotes(input.freightNotes);
  if (fromNotes) return { label: fromNotes, source: "listing" };
  const name = input.name.toLowerCase();
  if (WHOLE_FREIGHT_UNIT.test(name) && !UNIT_ACCESSORY.test(name)) {
    return { label: "freight", source: "name" };
  }
  return { label: labelFromCategory(input.category, input.name), source: "category" };
}

/* ---------------------------------------------------------
   Rate tables
   Amounts in whole cents. Each bracket covers minCents to
   maxCents INCLUSIVE; the brackets are contiguous, with no
   gaps or overlaps (enforced by validateRateTable and the
   test in scripts/test-shipping-rates.mjs).
--------------------------------------------------------- */

export type RateBracket = { minCents: number; maxCents: number; feeCents: number };

function bracket(minUsd: number, maxUsd: number, feeUsd: number): RateBracket {
  return {
    minCents: Math.round(minUsd * 100),
    maxCents: Math.round(maxUsd * 100),
    feeCents: Math.round(feeUsd * 100),
  };
}

/** Standard US shipping for carts made up entirely of parcel items. */
export const US_PARCEL_RATE_TABLE: readonly RateBracket[] = [
  bracket(0, 999.99, 0),
  bracket(1000, 1999.99, 100),
  bracket(2000, 4999.99, 150),
  bracket(5000, 9999.99, 250),
  bracket(10000, 14999.99, 300),
  bracket(15000, 19999.99, 350),
  bracket(20000, 24999.99, 400),
  bracket(25000, 29999.99, 450),
  bracket(30000, 34999.99, 500),
  bracket(35000, 39999.99, 550),
  bracket(40000, 44999.99, 600),
  bracket(45000, 49999.99, 650),
  bracket(50000, 54999.99, 700),
  bracket(55000, 59999.99, 750),
  bracket(60000, 64999.99, 800),
  bracket(65000, 69999.99, 850),
  bracket(70000, 74999.99, 900),
];

/**
 * Published US rates for multibox and freight carts.
 *
 * NOT SET. No freight rate has been decided, and inventing one would either
 * undercharge for a crated engine or overcharge for a boxed bumper. While a
 * table is null, carts with that label are reported as "pending" and quoted
 * manually before payment. Setting a table here makes checkout, the product
 * pages and the policy page start using it; Merchant Center needs a matching
 * shipping service for the same label.
 */
export const FREIGHT_RATE_TABLES: Record<Exclude<ShippingLabel, "parcel">, readonly RateBracket[] | null> = {
  multibox: null,
  freight: null,
};

export function rateTableFor(label: ShippingLabel): readonly RateBracket[] | null {
  return label === "parcel" ? US_PARCEL_RATE_TABLE : FREIGHT_RATE_TABLES[label];
}

/** Throws if a table has a gap, an overlap, or does not start at zero. */
export function validateRateTable(table: readonly RateBracket[]): void {
  if (!table.length) throw new Error("Rate table is empty");
  if (table[0].minCents !== 0) throw new Error("Rate table must start at $0.00");
  for (let i = 0; i < table.length; i += 1) {
    const row = table[i];
    if (row.maxCents < row.minCents) throw new Error(`Bracket ${i} ends before it starts`);
    if (row.feeCents < 0) throw new Error(`Bracket ${i} has a negative fee`);
    if (i > 0 && row.minCents !== table[i - 1].maxCents + 1) {
      throw new Error(`Gap or overlap between brackets ${i - 1} and ${i}`);
    }
  }
}

export function findBracket(
  table: readonly RateBracket[],
  subtotalCents: number
): RateBracket | undefined {
  return table.find((row) => subtotalCents >= row.minCents && subtotalCents <= row.maxCents);
}

/* ---------------------------------------------------------
   Cart quote
--------------------------------------------------------- */

export type ShippingQuoteItem = { productId: number; quantity: number; price: number };

export type PendingReason =
  | "empty_cart"
  | "destination_unknown"
  | "outside_us"
  | "freight_rate_not_set"
  | "above_rate_table";

export type ShippingQuote =
  | {
      status: "calculated";
      /** USD, two decimals. 0 means free standard shipping. */
      amount: number;
      label: ShippingLabel;
      subtotal: number;
      bracket: { min: number; max: number };
    }
  | {
      status: "pending";
      reason: PendingReason;
      label: ShippingLabel;
      subtotal: number;
    };

const US_COUNTRY_NAMES = new Set([
  "us",
  "usa",
  "u.s.",
  "u.s.a.",
  "united states",
  "united states of america",
  "america",
]);

export function isUnitedStates(country?: string | null): boolean {
  return US_COUNTRY_NAMES.has(String(country ?? "").trim().toLowerCase());
}

export function cartShippingLabel(
  items: { productId: number }[],
  classify: (productId: number) => ShippingClassification | null
): ShippingLabel {
  let heaviest: ShippingLabel = "parcel";
  for (const item of items) {
    // A product the catalog no longer knows is treated as the heaviest class
    // rather than slipping through as a free parcel.
    const label = classify(item.productId)?.label ?? "freight";
    if (LABEL_ORDER.indexOf(label) > LABEL_ORDER.indexOf(heaviest)) heaviest = label;
  }
  return heaviest;
}

/**
 * The shipping charge for a cart, or the reason there is none yet.
 *
 * `price` is the catalog price per unit. The bracket is chosen from the GROSS
 * subtotal (before bulk, order or coupon discounts) because that is the
 * figure Google uses for the same table.
 */
export function quoteShippingWith(
  items: ShippingQuoteItem[],
  country: string | null | undefined,
  classify: (productId: number) => ShippingClassification | null
): ShippingQuote {
  const subtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * Math.max(0, Math.floor(item.quantity)),
    0
  );
  const subtotal = subtotalCents / 100;
  const label = cartShippingLabel(items, classify);
  const pending = (reason: PendingReason): ShippingQuote => ({ status: "pending", reason, label, subtotal });

  if (!items.length || subtotalCents <= 0) return pending("empty_cart");
  if (!String(country ?? "").trim()) return pending("destination_unknown");
  if (!isUnitedStates(country)) return pending("outside_us");

  const table = rateTableFor(label);
  if (!table) return pending("freight_rate_not_set");

  const row = findBracket(table, subtotalCents);
  if (!row) return pending("above_rate_table");

  return {
    status: "calculated",
    amount: row.feeCents / 100,
    label,
    subtotal,
    bracket: { min: row.minCents / 100, max: row.maxCents / 100 },
  };
}

/** What the product page / cart says about a quote, in one line. */
export function describeQuote(quote: ShippingQuote): string {
  if (quote.status === "calculated") {
    return quote.amount === 0 ? "Free standard US shipping" : `$${quote.amount.toFixed(2)} standard US shipping`;
  }
  switch (quote.reason) {
    case "freight_rate_not_set":
      return "Freight shipping — confirmed with you before payment";
    case "outside_us":
      return "International shipping — confirmed with you before payment";
    case "above_rate_table":
      return "Shipping for this order value is confirmed with you before payment";
    case "destination_unknown":
      return "Enter your country to see shipping";
    default:
      return "";
  }
}

/** Top of the parcel table, for copy that has to name it. */
export const US_PARCEL_TABLE_MAX = US_PARCEL_RATE_TABLE[US_PARCEL_RATE_TABLE.length - 1].maxCents / 100;
/** The subtotal below which an all-parcel US order ships free. */
export const US_FREE_PARCEL_BELOW = US_PARCEL_RATE_TABLE[1].minCents / 100;
