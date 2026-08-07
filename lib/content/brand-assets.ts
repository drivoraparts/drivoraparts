/* =========================================================
   DRIVORAPARTS — BRAND ASSET REGISTRY
   ---------------------------------------------------------
   Single source of truth for the "brands we carry parts for"
   marquee (components/home/FeaturedBrandsStrip.tsx).

   `listingCount` is pulled from the real catalog distribution
   (lib/inventory/products.ts) — do not pad this list with
   brands that have zero live listings.

   `logo` is intentionally optional and absent for every brand
   today: Drivora has no licensing/reseller agreement granting
   rights to display these companies' trademarked logo marks.
   The marquee renders a wordmark for any brand without a logo.

   To add a real logo once a brand grants permission (dealer
   agreement, reseller brand kit, etc.): drop the licensed SVG
   in /public/brands/, then set `logo: { src: "/brands/<file>.svg" }`
   below. No component changes needed — FeaturedBrandsStrip
   picks it up automatically.
========================================================= */

export type BrandCategory = "manufacturer" | "performance";

export type BrandAsset = {
  slug: string;
  name: string;
  category: BrandCategory;
  /** Live listing count in the current catalog — keep this accurate. */
  listingCount: number;
  logo?: {
    src: string;
    /** Set true for marks that need a light backing chip to stay legible (e.g. dark wordmark logos). */
    padded?: boolean;
  };
};

export const BRAND_ASSETS: BrandAsset[] = [
  { slug: "bmw", name: "BMW", category: "manufacturer", listingCount: 9 },
  { slug: "garrett", name: "Garrett", category: "performance", listingCount: 9 },
  { slug: "toyota", name: "Toyota", category: "manufacturer", listingCount: 5 },
  { slug: "precision", name: "Precision Turbo", category: "performance", listingCount: 4 },
  { slug: "hks", name: "HKS", category: "performance", listingCount: 4 },
  { slug: "chevrolet", name: "Chevrolet", category: "manufacturer", listingCount: 4 },
  { slug: "audi", name: "Audi", category: "manufacturer", listingCount: 4 },
  { slug: "zf", name: "ZF", category: "performance", listingCount: 3 },
  { slug: "turbosmart", name: "Turbosmart", category: "performance", listingCount: 3 },
  { slug: "nissan", name: "Nissan", category: "manufacturer", listingCount: 3 },
  { slug: "honda", name: "Honda", category: "manufacturer", listingCount: 3 },
  { slug: "borgwarner", name: "BorgWarner", category: "performance", listingCount: 3 },
  { slug: "mercedes-benz", name: "Mercedes-Benz", category: "manufacturer", listingCount: 3 },
  { slug: "ford", name: "Ford", category: "manufacturer", listingCount: 2 },
  { slug: "brembo", name: "Brembo", category: "performance", listingCount: 2 },
  { slug: "ebc", name: "EBC", category: "performance", listingCount: 2 },
  { slug: "gm", name: "GM", category: "manufacturer", listingCount: 2 },
  { slug: "tremec", name: "Tremec", category: "performance", listingCount: 2 },
  { slug: "volkswagen", name: "Volkswagen", category: "manufacturer", listingCount: 1 },
  { slug: "mazda", name: "Mazda", category: "manufacturer", listingCount: 1 },
  { slug: "dodge", name: "Dodge", category: "manufacturer", listingCount: 1 },
  { slug: "wilwood", name: "Wilwood", category: "performance", listingCount: 1 },
  { slug: "ate", name: "ATE", category: "performance", listingCount: 1 },
];
