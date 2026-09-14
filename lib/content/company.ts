export const COMPANY_LEGAL_NAME = "DrivoraParts LLC";
export const COMPANY_DISPLAY_NAME = "DrivoraParts";
export const COMPANY_SUPPORT_EMAIL = "support@drivoraparts.com";

export const US_HEADQUARTERS = {
  companyName: COMPANY_LEGAL_NAME,
  street: "19800 S. Vermont Ave, Suite 240",
  city: "Torrance",
  state: "CA",
  stateName: "California",
  postalCode: "90502",
  country: "United States",
} as const;

export const JAPAN_LOGISTICS_HUB = {
  companyName: "Drivora Logistics Japan",
  street: "3-12-1 Golden Drive, Midori-ku",
  city: "Nagoya",
  ward: "Midori-ku",
  prefecture: "Aichi",
  postalCode: "458-0004",
  country: "Japan",
} as const;

/** Suburb/state only -- no street number or postcode on file yet for this hub. */
export const AUSTRALIA_LOGISTICS_HUB = {
  companyName: "Drivora Logistics Australia",
  city: "Sydney",
  suburb: "Lidcombe",
  state: "NSW",
  stateName: "New South Wales",
  country: "Australia",
} as const;

export const COMPANY_MOTTO = "Engineered • Fitment • Performance";

/** Short lines for footer and about page. */
export const COMPANY_LOCATION_SUMMARY = {
  brand: COMPANY_DISPLAY_NAME,
  corporateHq: "Corporate HQ: Torrance, California, USA",
  distribution: "Distribution & Inventory: Nagoya, Aichi, Japan & Sydney, NSW, Australia",
  motto: COMPANY_MOTTO,
} as const;

/**
 * The operating footprint, one entry per market, for the footer. The United
 * States and Australia lead as the two primary markets; Japan follows. Built
 * from the records above, so a hub that moves cannot leave this line behind.
 *
 * Sydney and Nagoya are "logistics hubs" -- what these records and the
 * shipping policy call them -- rather than "distribution & inventory": the
 * policy says only select premium parts may be dispatched from them, and
 * almost every listing names a USA ship-from location.
 */
export const COMPANY_FOOTPRINT = [
  {
    market: US_HEADQUARTERS.country,
    role: "Corporate HQ",
    place: `${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.stateName}`,
  },
  {
    market: AUSTRALIA_LOGISTICS_HUB.country,
    role: "Logistics hub",
    place: `${AUSTRALIA_LOGISTICS_HUB.city}, ${AUSTRALIA_LOGISTICS_HUB.state}`,
  },
  {
    market: JAPAN_LOGISTICS_HUB.country,
    role: "Logistics hub",
    place: `${JAPAN_LOGISTICS_HUB.city}, ${JAPAN_LOGISTICS_HUB.prefecture}`,
  },
] as const;

export function formatUsHeadquarters(multiline = true): string {
  const lines = [
    US_HEADQUARTERS.companyName,
    US_HEADQUARTERS.street,
    `${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.state} ${US_HEADQUARTERS.postalCode}`,
    US_HEADQUARTERS.country,
  ];
  return multiline ? lines.join("\n") : lines.join(", ");
}

export function formatJapanLogisticsHub(multiline = true): string {
  const lines = [
    JAPAN_LOGISTICS_HUB.companyName,
    JAPAN_LOGISTICS_HUB.street,
    `${JAPAN_LOGISTICS_HUB.city}, ${JAPAN_LOGISTICS_HUB.ward}`,
    `${JAPAN_LOGISTICS_HUB.prefecture} ${JAPAN_LOGISTICS_HUB.postalCode}`,
    JAPAN_LOGISTICS_HUB.country,
  ];
  return multiline ? lines.join("\n") : lines.join(", ");
}

/** @deprecated Use US_HEADQUARTERS and formatters — kept for existing imports. */
export const COMPANY_NAME = COMPANY_LEGAL_NAME;

/** @deprecated Use COMPANY_SUPPORT_EMAIL — kept for existing imports. */
export const COMPANY_CONTACT = {
  email: COMPANY_SUPPORT_EMAIL,
  usHeadquarters: US_HEADQUARTERS,
  japanLogisticsHub: JAPAN_LOGISTICS_HUB,
} as const;
