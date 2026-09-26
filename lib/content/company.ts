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

/**
 * City, ward and prefecture only -- no street line or postcode on file.
 *
 * It previously carried "3-12-1 Golden Drive, Midori-ku" with postcode
 * 458-0004, neither of which matches any record held for this hub (and an
 * English street name is not how a Japanese address is written). The locality
 * stands; the rest stays unpublished until there is a document behind it, the
 * same basis AUSTRALIA_LOGISTICS_HUB has always been on.
 */
export const JAPAN_LOGISTICS_HUB = {
  companyName: "Drivora Logistics Japan",
  city: "Nagoya",
  ward: "Midori-ku",
  prefecture: "Aichi",
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
    `${JAPAN_LOGISTICS_HUB.city}, ${JAPAN_LOGISTICS_HUB.ward}`,
    JAPAN_LOGISTICS_HUB.prefecture,
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
