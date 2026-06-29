export const SITE_NAME = "DrivoraParts";
export const SITE_TAGLINE = "Automotive Performance Marketplace";

/** Bump when favicon / default link-preview art changes (cache bust for crawlers). */
export const ICON_VERSION = "7";

export const DEFAULT_DESCRIPTION =
  "Shop performance engines, turbo systems, transmissions, brakes, suspension, electronics, lighting, and body parts from a trusted automotive marketplace.";

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
