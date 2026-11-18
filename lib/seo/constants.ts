import { HOME_LISTING_COUNT } from "@/lib/home/listing-count";

export const SITE_NAME = "DrivoraParts";
export const SITE_TAGLINE =
  "Built Around Toyota. Focused on What Drives You. Toyota parts and engines, shipped within the United States";

// The count is the synced catalog size (lib/home/listing-count.ts), not a
// typed-in figure: this read "1,400+" long after the catalog passed 4,000.
export const DEFAULT_DESCRIPTION = `Shop ${HOME_LISTING_COUNT.toLocaleString("en-US")} Toyota parts for the Tacoma, Tundra, 4Runner, Land Cruiser and more: engines, transmissions, suspension, bumpers, lighting and accessories, matched to the models they fit and shipped within the United States.`;

/** Bump when favicon / default link-preview art changes (cache bust for crawlers). */
export const ICON_VERSION = "7";

/** Default link preview for site pages (homepage, catalog, etc.). */
export const DEFAULT_OG_IMAGE = `/favicon.png?v=${ICON_VERSION}`;

export const POLICY_PATHS = [
  "/policies/privacy-policy",
  "/policies/cookie-policy",
  "/policies/shipping-policy",
  "/policies/refund-policy",
  "/policies/buyer-protection",
  "/policies/fitment-guarantee",
  "/policies/manual-payment",
  "/warranty",
  "/policies/terms-of-service",
  "/policies/terms-of-sale",
  "/policies/acceptable-use-policy",
  "/policies/accessibility-statement",
  "/policies/affiliate-disclosure",
  "/policies/disclaimer",
  "/policies/liability",
  "/policies/dpa",
  "/policies/eula",
] as const;
