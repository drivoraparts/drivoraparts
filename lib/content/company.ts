export const COMPANY_LEGAL_NAME = "DrivoraParts LLC";
export const COMPANY_DISPLAY_NAME = "Drivora Parts";
export const COMPANY_SUPPORT_EMAIL = "support@drivoraparts.com";

export const US_HEADQUARTERS = {
  companyName: "Drivora Parts LLC",
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

export const COMPANY_MOTTO = "Purity • Potency • Protocol";

/** Short lines for footer and about page. */
export const COMPANY_LOCATION_SUMMARY = {
  brand: COMPANY_DISPLAY_NAME,
  corporateHq: "Corporate HQ: Torrance, California, USA",
  distribution: "Distribution & Inventory: Nagoya, Aichi, Japan",
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
