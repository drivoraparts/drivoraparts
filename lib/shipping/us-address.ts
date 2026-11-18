/* =========================================================
   DRIVORAPARTS — US-ONLY DELIVERY ADDRESSES
   ---------------------------------------------------------
   DrivoraParts ships only within the United States. This is
   the single rule for what counts as a deliverable address,
   used by the checkout page (to tell the customer at once),
   by POST /api/checkout and by processCheckout (so a crafted
   request cannot place an order to anywhere else), and by the
   shipping quote (so no international charge is ever shown).

   Pure data and functions, no imports, so client components
   can use it too.

   Coverage is the 50 states and the District of Columbia.
   US territories (Puerto Rico, Guam, USVI...) and APO/FPO/DPO
   military addresses are NOT accepted: the published rates
   were never set for them and their carriers and transit
   differ. Add them here only with a deliberate rate decision.
========================================================= */

export const SHIPPING_COUNTRY_NAME = "United States";

export const US_STATES: readonly { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

/**
 * Country as typed or sent, reduced to letters and single spaces so "U.S.A",
 * "U.S.", "united states of america" and "the United States" compare equal.
 */
export function normalizeCountryInput(country?: string | null): string {
  return String(country ?? "")
    .toLowerCase()
    .replace(/[.'\u2019]/g, "")
    .replace(/[^a-z]+/g, " ")
    .trim()
    .replace(/^the /, "");
}

const US_NAMES: ReadonlySet<string> = new Set([
  "us",
  "usa",
  "u s",
  "u s a",
  "united states",
  "united states usa",
  "united states of america",
  "america",
]);

export function isUnitedStates(country?: string | null): boolean {
  return US_NAMES.has(normalizeCountryInput(country));
}

/** Two-letter code for a state given as a code or a name, or null. */
export function normalizeUsState(state?: string | null): string | null {
  const raw = String(state ?? "").trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  const byCode = US_STATES.find((s) => s.code === upper);
  if (byCode) return byCode.code;
  const lower = raw.toLowerCase().replace(/\s+/g, " ");
  return US_STATES.find((s) => s.name.toLowerCase() === lower)?.code ?? null;
}

/** 5-digit ZIP or ZIP+4. */
export function isValidUsZip(zip?: string | null): boolean {
  return /^\d{5}(-\d{4})?$/.test(String(zip ?? "").trim());
}

/** US territories and military (APO/FPO/DPO) state codes, which are not served. */
const NOT_SERVED_US_REGIONS: ReadonlySet<string> = new Set([
  "PR", "GU", "VI", "AS", "MP", "UM", "AA", "AE", "AP",
  "PUERTO RICO", "GUAM", "US VIRGIN ISLANDS", "AMERICAN SAMOA", "NORTHERN MARIANA ISLANDS",
]);

export const NOT_SERVED_US_REGION_MESSAGE =
  "We currently ship only to the 50 states and Washington, DC. We can't deliver to US territories or APO/FPO/DPO addresses.";

export const OUTSIDE_US_MESSAGE =
  "DrivoraParts ships only within the United States, so we can't deliver to this address. International orders can't be placed.";

/**
 * Why this destination cannot be shipped to, in words for the customer, or
 * null when it is a deliverable US address. Country is checked first so an
 * international customer is told the real reason, not asked for a ZIP code.
 */
export function usShippingAddressError(input: {
  country?: string | null;
  state?: string | null;
  zip?: string | null;
}): string | null {
  if (!String(input.country ?? "").trim()) {
    return "Please choose your country so we can calculate shipping.";
  }
  if (!isUnitedStates(input.country)) return OUTSIDE_US_MESSAGE;
  const stateRaw = String(input.state ?? "").trim().toUpperCase();
  if (NOT_SERVED_US_REGIONS.has(stateRaw)) return NOT_SERVED_US_REGION_MESSAGE;
  if (!normalizeUsState(input.state)) return "Please choose your state.";
  if (!isValidUsZip(input.zip)) return "Please enter a valid 5-digit US ZIP code.";
  return null;
}
