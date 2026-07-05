export const SITE_NAME = "DrivoraParts";
export const SITE_TAGLINE =
  "Performance auto parts marketplace — engines, truck beds, 4x4 lift kits, bull bars & worldwide shipping";

export const DEFAULT_DESCRIPTION =
  "Shop 1,400+ performance auto parts: rust-free truck beds, LS & JDM engine swaps, 4x4 lift kits, bull bars, snorkels, turbos, brakes & suspension. Secure checkout with worldwide shipping at DrivoraParts.";

/** Bump when favicon / default link-preview art changes (cache bust for crawlers). */
export const ICON_VERSION = "7";

/** Default link preview for site pages (homepage, catalog, etc.). */
export const DEFAULT_OG_IMAGE = `/favicon.png?v=${ICON_VERSION}`;

export const POLICY_PATHS = [
  "/policies/privacy-policy",
  "/policies/cookie-policy",
  "/policies/shipping-policy",
  "/policies/refund-policy",
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
