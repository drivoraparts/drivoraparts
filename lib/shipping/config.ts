/* =========================================================
   DRIVORAPARTS — SHIPPING CONFIGURATION
   ---------------------------------------------------------
   Standard shipping is free and always has been. This file
   only describes the OPTIONAL paid express upgrade.

   THE RATES BELOW ARE EMPTY ON PURPOSE.

   There is no weight data in the catalog (no product carries
   a numeric weight) and no carrier integration, so an express
   price cannot be derived from anything the system already
   knows. Rather than invent numbers that would charge real
   customers real money, every cell starts null and express
   is simply not offered until a price is filled in.

   Fill a cell with what your courier actually charges for
   that class of package to that destination. Any cell left
   null means "we do not offer express for that combination"
   -- the customer sees free standard shipping only, exactly
   as they do today.
========================================================= */

/**
 * How a product physically ships. These are the three classes the catalog
 * already describes in its freight notes (see lib/inventory/logistics.ts) --
 * not a new taxonomy, just the existing one made machine-readable.
 */
export type FreightClass = "parcel" | "multibox" | "pallet";

export const FREIGHT_CLASS_LABEL: Record<FreightClass, string> = {
  parcel: "Standard parcel",
  multibox: "Multi-box courier",
  pallet: "Palletized freight",
};

/** Destination groups. Derived from the country already collected at checkout. */
export type ShippingZone = "us" | "ca" | "uk-eu" | "au-nz" | "rest";

export const ZONE_LABEL: Record<ShippingZone, string> = {
  us: "United States",
  ca: "Canada",
  "uk-eu": "UK & Europe",
  "au-nz": "Australia & New Zealand",
  rest: "Rest of world",
};

/**
 * Express price in USD for one item of a given class to a given zone.
 * null = express not offered for that combination.
 *
 * A multi-item cart is charged the heaviest class once plus a per-extra-item
 * surcharge (see EXTRA_ITEM_SURCHARGE) rather than the naive sum, because
 * couriers price a consolidated shipment, not each box independently.
 */
export type ExpressRateTable = Record<
  ShippingZone,
  Record<FreightClass, number | null>
>;

export const EXPRESS_RATES: ExpressRateTable = {
  us: { parcel: null, multibox: null, pallet: null },
  ca: { parcel: null, multibox: null, pallet: null },
  "uk-eu": { parcel: null, multibox: null, pallet: null },
  "au-nz": { parcel: null, multibox: null, pallet: null },
  rest: { parcel: null, multibox: null, pallet: null },
};

/**
 * Added for each additional item beyond the first, per zone. Consolidation
 * means a second parcel costs less than the first, so this is deliberately
 * smaller than a full rate. null disables the surcharge (extras ship free
 * alongside the first).
 */
export const EXTRA_ITEM_SURCHARGE: Record<ShippingZone, number | null> = {
  us: null,
  ca: null,
  "uk-eu": null,
  "au-nz": null,
  rest: null,
};

/** True when at least one express price is configured anywhere. */
export function isExpressConfigured(): boolean {
  return Object.values(EXPRESS_RATES).some((zone) =>
    Object.values(zone).some((rate) => typeof rate === "number" && rate > 0)
  );
}

/* ---------------------------------------------------------
   Country -> zone
   Only the countries the storefront actually lists are
   mapped explicitly; everything else falls to "rest".
--------------------------------------------------------- */

const ZONE_BY_COUNTRY: Record<string, ShippingZone> = {
  "united states": "us",
  usa: "us",
  us: "us",
  "u.s.": "us",
  "u.s.a.": "us",
  america: "us",
  canada: "ca",
  ca: "ca",
  "united kingdom": "uk-eu",
  uk: "uk-eu",
  "great britain": "uk-eu",
  england: "uk-eu",
  scotland: "uk-eu",
  wales: "uk-eu",
  ireland: "uk-eu",
  germany: "uk-eu",
  france: "uk-eu",
  spain: "uk-eu",
  italy: "uk-eu",
  netherlands: "uk-eu",
  belgium: "uk-eu",
  poland: "uk-eu",
  sweden: "uk-eu",
  norway: "uk-eu",
  denmark: "uk-eu",
  finland: "uk-eu",
  portugal: "uk-eu",
  austria: "uk-eu",
  switzerland: "uk-eu",
  australia: "au-nz",
  au: "au-nz",
  "new zealand": "au-nz",
  nz: "au-nz",
};

export function resolveZone(country?: string | null): ShippingZone {
  const key = String(country ?? "").trim().toLowerCase();
  if (!key) return "rest";
  return ZONE_BY_COUNTRY[key] ?? "rest";
}
