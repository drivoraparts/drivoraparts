/**
 * Listings whose catalog `brand` is the VEHICLE maker (Ford, Subaru, Nissan,
 * BMW, Audi), not the maker of the part. Merchant Center reads `brand` as the
 * manufacturer, so a car maker there misattributes the part (and for aftermarket
 * body kits and turbo upgrades it is simply wrong). Until the supplier names the
 * real manufacturer, these listings send no brand to the Google and Meta feeds
 * and carry no Brand in Product structured data. The site's own brand pages and
 * filters still group them by vehicle make.
 *
 * Source: gmc_73_flagged_products.csv (Merchant Center, 2026-10-30). Remove an id
 * from this set when its real manufacturer is recorded in the catalog.
 * docs/merchant-center/car-maker-brands.csv lists every other listing that
 * carries a vehicle maker as its brand, for review.
 */
const UNKNOWN_MANUFACTURER_IDS: ReadonlySet<number> = new Set([
  154, // Ford Mustang S550 widebody kit
  159, // Subaru WRX STI widebody aero kit
  158, // Nissan 370Z widebody aero kit
  151, // BMW G20 3 Series widebody aero kit
  95, // Audi RS3 hybrid turbo
  684, // GT 1000 supercharged Coyote engine
  685, // GT 1000 supercharged Coyote engine package
]);

export function hasUnknownManufacturer(product: { id: number }): boolean {
  return UNKNOWN_MANUFACTURER_IDS.has(product.id);
}
