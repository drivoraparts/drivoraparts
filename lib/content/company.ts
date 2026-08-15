/**
 * The company details shown to customers.
 *
 * Every value here must be verifiable. The site previously named a
 * "Drivora Parts LLC" at a Torrance address that did not exist, alongside
 * company-operated logistics hubs in Nagoya and Sydney — the Japanese address
 * used a street-name format Japan does not use, and the Australian one had no
 * street number at all.
 *
 * The real entity is BROOKSTONEUS LLC, a California LLC filed 18 July 2024
 * (file no. 202463112215), and Drivora Parts is the brand it trades under.
 * Parts are sourced from suppliers in Japan and Australia rather than from
 * warehouses the company operates, so that is what the site now says.
 *
 * This matters commercially, not just ethically: payment providers check the
 * stated entity against the application, and a customer spending thousands
 * will look the address up.
 */

/** Registered entity. The storefront brand is DrivoraParts. */
export const COMPANY_LEGAL_NAME = "BROOKSTONEUS LLC";
export const COMPANY_DISPLAY_NAME = "Drivora Parts";
export const COMPANY_SUPPORT_EMAIL = "support@drivoraparts.com";

/** California Secretary of State filing reference — public record. */
export const COMPANY_REGISTRATION = {
  entityName: "BROOKSTONEUS LLC",
  jurisdiction: "California, United States",
  fileNumber: "202463112215",
  filedOn: "2024-07-18",
} as const;

export const US_HEADQUARTERS = {
  companyName: "BROOKSTONEUS LLC",
  street: "444 Alaska Avenue, Suite #BBW227",
  city: "Torrance",
  state: "CA",
  stateName: "California",
  postalCode: "90503",
  country: "United States",
} as const;

/**
 * Where parts come from — supplier networks, not facilities we operate.
 * Deliberately no street addresses: claiming premises we don't hold is what
 * this file exists to prevent.
 */
export const SOURCING_REGIONS = [
  { country: "Japan", note: "JDM engines, drivetrain and performance components" },
  { country: "Australia", note: "Canopies, bull bars, snorkels and touring equipment" },
  { country: "United States", note: "Domestic performance and truck parts" },
] as const;

export const SOURCING_SUMMARY =
  "Parts sourced from suppliers in Japan, Australia and the United States, shipped worldwide.";

export const COMPANY_MOTTO = "Engineered • Fitment • Performance";

/** Short lines for footer and about page. */
export const COMPANY_LOCATION_SUMMARY = {
  brand: COMPANY_DISPLAY_NAME,
  corporateHq: `Operated by ${COMPANY_LEGAL_NAME} · ${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.stateName}, USA`,
  distribution: SOURCING_SUMMARY,
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

/** One line naming the operating entity — for footers and policy pages. */
export function formatOperatedBy(): string {
  return `${COMPANY_DISPLAY_NAME} is a trading name of ${COMPANY_LEGAL_NAME}, ${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.state} ${US_HEADQUARTERS.postalCode}, ${US_HEADQUARTERS.country}.`;
}

/** @deprecated Use COMPANY_LEGAL_NAME. */
export const COMPANY_NAME = COMPANY_LEGAL_NAME;

/** @deprecated Use COMPANY_SUPPORT_EMAIL and US_HEADQUARTERS. */
export const COMPANY_CONTACT = {
  email: COMPANY_SUPPORT_EMAIL,
  usHeadquarters: US_HEADQUARTERS,
} as const;
