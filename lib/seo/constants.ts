import { HOME_LISTING_COUNT } from "@/lib/home/listing-count";

export const SITE_NAME = "DrivoraParts";
export const SITE_TAGLINE =
  "Performance auto parts marketplace — engines, truck beds, 4x4 lift kits, bull bars & international shipping";

// The count is the synced catalog size (lib/home/listing-count.ts), not a
// typed-in figure: this read "1,400+" long after the catalog passed 4,000.
export const DEFAULT_DESCRIPTION = `Shop ${HOME_LISTING_COUNT.toLocaleString("en-US")}+ performance auto parts: rust-free truck beds, LS & JDM engine swaps, 4x4 lift kits, bull bars, snorkels, turbos, brakes & suspension. Free standard shipping from DrivoraParts.`;

/** Bump when favicon / default link-preview art changes (cache bust for crawlers). */
export const ICON_VERSION = "7";

/** Default link preview for site pages (homepage, catalog, etc.). */
export const DEFAULT_OG_IMAGE = `/favicon.png?v=${ICON_VERSION}`;

export const POLICY_PATHS = [
  "/policies/privacy-policy",
  "/policies/cookie-policy",
  "/policies/shipping-policy",
  "/policies/refund-policy",
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
