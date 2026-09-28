/* =========================================================
   DRIVORAPARTS — BRAND WORDMARKS (HOMEPAGE STRIP)
   ---------------------------------------------------------
   The list of names the "Shop Parts By Brand" strip prints.
   Its only consumer is components/home/FeaturedBrandsStrip.tsx.

   THIS IS NOT THE CATALOG'S BRAND REGISTRY.
   That is lib/inventory/brands.ts, where a brand is a
   (slug, category) pair -- the same manufacturer is
   registered separately per category, sometimes under a
   product-line name. Four of the manufacturers below exist
   there only as brake product lines, under five entries:

     Brembo  -> brembo-gt-kits, brembo-oem
     EBC     -> ebc-rotors-pads
     Wilwood -> wilwood-big-brake-kits
     ATE     -> ate-oem-kits

   So `slug` here is a stable React key and nothing more. It
   is NOT a catalog brand slug and NOT a route: brand pages
   are /catalog/[category]/[brand] and need both halves, so
   a manufacturer name alone cannot address one.

   A `listingCount` field used to sit on each entry, claiming
   to be "the live listing count in the current catalog". It
   was never read by anything, and after the 2026-09-15
   market-expansion import 15 of the 23 values were wrong --
   Turbosmart said 3 against 113 listings, Chevrolet 4 against
   138, Wilwood 1 against 94. A number nothing renders and
   nobody can notice going stale is worse than no number, so
   it was removed rather than re-synced. Count from
   lib/catalog/counts.ts if a count is ever actually needed.

   `logo` is intentionally absent for every brand: DrivoraParts
   has no licensing agreement granting rights to display these
   companies' trademarked marks. The strip renders a wordmark
   for any brand without one. To add a licensed logo, drop the
   SVG in /public/brands/ and set
   `logo: { src: "/brands/<file>.svg" }` -- no component change
   needed.
========================================================= */

export type BrandCategory = "manufacturer" | "performance";

export type BrandAsset = {
  slug: string;
  name: string;
  /**
   * Vehicle manufacturer vs. parts/performance maker. Not currently rendered
   * -- the strip prints one undivided row -- but kept because it records a
   * fact that cannot go stale: BMW is a carmaker and Garrett is not. Any
   * future split of this section into "Vehicle Makes" and "Parts Brands"
   * needs exactly this.
   */
  category: BrandCategory;
  logo?: {
    src: string;
    /** Set true for marks that need a light backing chip to stay legible (e.g. dark wordmark logos). */
    padded?: boolean;
  };
};

export const BRAND_ASSETS: BrandAsset[] = [
  { slug: "bmw", name: "BMW", category: "manufacturer" },
  { slug: "garrett", name: "Garrett", category: "performance" },
  { slug: "toyota", name: "Toyota", category: "manufacturer" },
  { slug: "precision", name: "Precision Turbo", category: "performance" },
  { slug: "hks", name: "HKS", category: "performance" },
  { slug: "chevrolet", name: "Chevrolet", category: "manufacturer" },
  { slug: "audi", name: "Audi", category: "manufacturer" },
  { slug: "zf", name: "ZF", category: "performance" },
  { slug: "turbosmart", name: "Turbosmart", category: "performance" },
  { slug: "nissan", name: "Nissan", category: "manufacturer" },
  { slug: "honda", name: "Honda", category: "manufacturer" },
  { slug: "borgwarner", name: "BorgWarner", category: "performance" },
  { slug: "mercedes-benz", name: "Mercedes-Benz", category: "manufacturer" },
  { slug: "ford", name: "Ford", category: "manufacturer" },
  { slug: "brembo", name: "Brembo", category: "performance" },
  { slug: "ebc", name: "EBC", category: "performance" },
  { slug: "gm", name: "GM", category: "manufacturer" },
  { slug: "tremec", name: "Tremec", category: "performance" },
  { slug: "volkswagen", name: "Volkswagen", category: "manufacturer" },
  { slug: "mazda", name: "Mazda", category: "manufacturer" },
  { slug: "dodge", name: "Dodge", category: "manufacturer" },
  { slug: "wilwood", name: "Wilwood", category: "performance" },
  { slug: "ate", name: "ATE", category: "performance" },
];
