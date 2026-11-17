import { HOME_LISTING_COUNT } from "@/lib/home/listing-count";

export const SITE_NAME = "DrivoraParts";
export const SITE_TAGLINE =
  "Toyota parts for the Tacoma, Tundra, 4Runner, Land Cruiser and more, matched to the models they fit";

// The count is the synced catalog size (lib/home/listing-count.ts), not a
// typed-in figure: this read "1,400+" long after the catalog passed 4,000.
export const DEFAULT_DESCRIPTION = `Shop ${HOME_LISTING_COUNT.toLocaleString("en-US")} Toyota parts for the Tacoma, Tundra, 4Runner, Land Cruiser and more: suspension, bumpers, lighting, engines, transmissions and accessories, each matched to the models it fits.`;

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
