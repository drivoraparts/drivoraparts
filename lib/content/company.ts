export const COMPANY_LEGAL_NAME = "DrivoraParts LLC";
export const COMPANY_DISPLAY_NAME = "DrivoraParts";
export const COMPANY_SUPPORT_EMAIL = "support@drivoraparts.com";

/**
 * The registered office -- the entity a customer contracts with.
 *
 * This is the company's legal identity, not a place parts move through. It is
 * what Contact, Terms of Sale, the privacy and refund policies and the
 * Organization JSON-LD all state, and they should keep stating it: mail and
 * legal notice go here. Where an order physically ships from is a different
 * question with a different answer -- see CALIFORNIA_FULFILLMENT.
 */
export const US_HEADQUARTERS = {
  companyName: COMPANY_LEGAL_NAME,
  street: "19800 S. Vermont Ave, Suite 240",
  city: "Torrance",
  state: "CA",
  stateName: "California",
  postalCode: "90502",
  country: "United States",
} as const;

/**
 * The California fulfillment address -- where orders are actually handled.
 *
 * Kept separate from US_HEADQUARTERS on purpose. Collapsing the two would
 * either move the registered office, which is wrong, or imply parts are picked
 * and packed out of a corporate suite, which is also wrong. A customer asking
 * "where does my part ship from" and a customer asking "who am I buying from"
 * are asking different things.
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
 * What is supportable is that parts are sourced, inspected and dispatched in
 * both countries. That is a region, so it is published as a region.
 */
export const REGIONAL_FULFILLMENT_SUMMARY =
  "Regional Fulfillment: California, Japan & Australia";

export const COMPANY_MOTTO = "Engineered • Fitment • Performance";

/** Short lines for the about page. */
export const COMPANY_LOCATION_SUMMARY = {
  brand: COMPANY_DISPLAY_NAME,
  corporateHq: "Corporate HQ: Torrance, California, USA",
  distribution: REGIONAL_FULFILLMENT_SUMMARY,
  motto: COMPANY_MOTTO,
} as const;

export function formatUsHeadquarters(multiline = true): string {
  const lines = [
    US_HEADQUARTERS.companyName,
    US_HEADQUARTERS.street,
    `${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.state} ${US_HEADQUARTERS.postalCode}`,
    US_HEADQUARTERS.country,
  ];
  return multiline ? lines.join("\n") : lines.join(", ");
}

/** @deprecated Use COMPANY_LEGAL_NAME — kept for existing imports. */
export const COMPANY_NAME = COMPANY_LEGAL_NAME;
