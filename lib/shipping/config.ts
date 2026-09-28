/* =========================================================
   DRIVORAPARTS — SHIPPING RULES
   ---------------------------------------------------------
   SHIPPING IS QUOTED BY HAND. THERE IS NO CARRIER API.

   Nothing in this codebase talks to a carrier, and no product
   carries a weight, so no shipping price can be derived from
   what the system knows. An admin works the figure out and
   enters it when they send the customer their payment details
   -- see components/admin/ManualPaymentPanel.tsx.

   What lives here is the policy an admin applies, expressed so
   the admin screen can state it and so nothing else in the app
   has to guess at it:

     - Standard shipping CAN be free on an eligible order to
       the USA or the UK.
     - Australia and other international destinations are
       charged.
     - Engines, transmissions, truck beds and anything else
       that moves as freight can carry a charge even to a
       normally-free destination.

   "Can be free" is the whole point of the word. Eligibility is
   a starting position for the person doing the quoting, never
   a promise made to a customer before the number exists, and
   never a calculation. Storefront copy must not translate it
   into "free shipping".
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

/**
 * Destination groups. Derived from the country already collected at checkout.
 *
 * The UK is its own zone rather than sharing one with Europe, because the
 * free-standard rule applies to it and not to the rest of the continent. The
 * old combined "uk-eu" key is still accepted when reading historical orders --
 * `shipment_zone` is a stored string and past orders keep whatever they were
 * written with.
 */
export type ShippingZone = "us" | "uk" | "ca" | "eu" | "au-nz" | "rest";

export const ZONE_LABEL: Record<ShippingZone, string> = {
  us: "United States",
  uk: "United Kingdom",
  ca: "Canada",
  eu: "Europe",
  "au-nz": "Australia & New Zealand",
  rest: "Rest of world",
};

/**
 * Destinations where an eligible standard order can ship at no charge.
 *
 * Read by the admin payment screen to show the person quoting which rule
 * applies. It prices nothing and promises nothing: a freight-class item, an
 * oversized consignment or an expedited request can all carry a charge to
 * these destinations too.
 */
export const FREE_STANDARD_ELIGIBLE_ZONES: readonly ShippingZone[] = ["us", "uk"];

export function isFreeStandardEligibleZone(zone: ShippingZone): boolean {
  return FREE_STANDARD_ELIGIBLE_ZONES.includes(zone);
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
  "united kingdom": "uk",
  uk: "uk",
  "great britain": "uk",
  england: "uk",
  scotland: "uk",
  wales: "uk",
  "northern ireland": "uk",
  ireland: "eu",
  germany: "eu",
  france: "eu",
  spain: "eu",
  italy: "eu",
  netherlands: "eu",
  belgium: "eu",
  poland: "eu",
  sweden: "eu",
  norway: "eu",
  denmark: "eu",
  finland: "eu",
  portugal: "eu",
  austria: "eu",
  switzerland: "eu",
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

/** Label for a zone string read back off an order, including retired keys. */
export function zoneLabel(zone: string | null | undefined): string {
  if (!zone) return "Unknown destination";
  if (zone === "uk-eu") return "UK & Europe (recorded before the zones were split)";
  return ZONE_LABEL[zone as ShippingZone] ?? zone;
}
