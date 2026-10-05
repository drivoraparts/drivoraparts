/**
 * The legal entity that operates DrivoraParts, and the ONE place its name is
 * written. Everything that names the entity -- the footer, every policy page,
 * the structured data -- reads this (the product page's Seller row shows the
 * store name, COMPANY_DISPLAY_NAME, not the entity), so a change
 * of name is one edit and cannot leave a stale one behind.
 *
 * Source: the California Articles of Organization filed in July 2024, which
 * name the company BROOKSTONEUS LLC (filings are in capitals). No registration
 * or tax number from those documents is stored in this repository, and none
 * should be. It was previously "DrivoraParts LLC", for
 * which no registration document exists; "DrivoraParts" is the store's brand,
 * not a legal entity, and is COMPANY_DISPLAY_NAME below.
 *
 * What that document does NOT establish, and so is not claimed anywhere: that
 * this entity is the merchant of record, holds the payment accounts, or has a
 * trade-name registration for "DrivoraParts".
 */
export const COMPANY_LEGAL_NAME = "BrookstoneUS LLC";
export const COMPANY_DISPLAY_NAME = "DrivoraParts";
export const COMPANY_SUPPORT_EMAIL = "support@drivoraparts.com";

/** Verified by the Articles of Organization above: a California LLC. */
export const COMPANY_STATE_OF_FORMATION = "California";

export type CompanyAddress = {
  street: string;
  city: string;
  state: string;
  stateName: string;
  postalCode: string;
  country: string;
};

/**
 * The business address customer-facing pages print -- or null, which is what
 * it is today, and every page that would show one simply omits it.
 *
 * Published at the owner's direction (2026-10-05): the Monterey Park address
 * is the main business address. It was null before, on purpose. The site used to publish "19800 S. Vermont Ave,
 * Suite 240, Torrance" as the registered office and headquarters; no document
 * supports that, and the address the Articles of Organization give is a
 * different one (which may be a private mailbox). Which address, if any, is
 * published is the owner's decision. When it is made, set it here and the
 * Privacy Policy, the Contact
 * page, the policy-page header and the structured data all pick it up.
 */
export const COMPANY_ADDRESS: CompanyAddress | null = {
  street: "1401 Monterey Pass Rd",
  city: "Monterey Park",
  state: "CA",
  stateName: "California",
  postalCode: "91754",
  country: "United States",
};

/**
 * The California fulfillment address -- where orders are actually handled.
 *
 * It is a fulfillment and returns address, nothing more: it is not labelled a
 * headquarters or an office, because nothing establishes that it is one. A
 * customer asking "where does my part ship from" and a customer asking "who am
 * I buying from" are asking different things.
 */
export const CALIFORNIA_FULFILLMENT = {
  street: "1401 Monterey Pass Rd",
  city: "Monterey Park",
  state: "CA",
  stateName: "California",
  postalCode: "91754",
  country: "United States",
} as const;

/*
 * Japan and Australia are named by country and nothing more.
 *
 * They previously carried named entities -- "Drivora Logistics Japan",
 * "Drivora Logistics Australia" -- against partial addresses: a Nagoya ward
 * (once a "3-12-1 Golden Drive" that is not how a Japanese address is written
 * at all) and the Sydney suburb of Lidcombe with no street or postcode. Two
 * invented-looking companies at two addresses that cannot be completed read
 * worse than saying nothing, and nothing on file supports us owning a facility
 * in either country.
 *
 * What is supportable is that some parts are sourced and dispatched through
 * suppliers and logistics partners, so the summary says only that orders ship
 * from DrivoraParts or the supplier network. It names no facility or region.
 */
export const REGIONAL_FULFILLMENT_SUMMARY =
  "Orders ship from DrivoraParts or our supplier network, depending on the part";

export const COMPANY_MOTTO = "Engineered • Fitment • Performance";

/**
 * Short lines for the about page. There is no "Corporate HQ" line: nothing
 * documents a headquarters, so none is claimed.
 */
export const COMPANY_LOCATION_SUMMARY = {
  brand: COMPANY_DISPLAY_NAME,
  operatedBy: `Operated by ${COMPANY_LEGAL_NAME}`,
  distribution: REGIONAL_FULFILLMENT_SUMMARY,
  motto: COMPANY_MOTTO,
} as const;

/** @deprecated Use COMPANY_LEGAL_NAME — kept for existing imports. */
export const COMPANY_NAME = COMPANY_LEGAL_NAME;

/**
 * The year the site's copyright notice starts from, and the one place that
 * knows it.
 *
 * Two surfaces print a copyright line -- the site footer and the foot of every
 * policy page -- and each used to build its own, from the current year alone.
 * Both now call copyrightYears(), so the range cannot differ between them and
 * rolls forward on its own: "2024–2026" this year, "2024–2027" next.
 *
 * The range is a property of the site's content, not of whichever legal entity
 * is named beside it, which is why it lives here rather than with the entity
 * name. The en dash is deliberate.
 */
export const COPYRIGHT_START_YEAR = 2024;

export function copyrightYears(now: Date = new Date()): string {
  const year = now.getFullYear();
  return year > COPYRIGHT_START_YEAR ? `${COPYRIGHT_START_YEAR}–${year}` : String(COPYRIGHT_START_YEAR);
}
