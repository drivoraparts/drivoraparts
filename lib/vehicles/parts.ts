import { getAllProducts, type Product } from "@/lib/inventory";
import {
  getVehiclePlatform,
  type VehiclePlatform,
} from "@/data/vehicles";

/**
 * Resolves which catalogue products belong on a vehicle platform hub.
 *
 * Matching runs over the product name and its fitment text only — never the
 * description. Descriptions mention compatible and comparable vehicles in
 * passing ("similar to the Ranger", "also available for Amarok"), and matching
 * on those produced obvious nonsense: a Ford Ranger roof rack surfaced on the
 * Amarok and BT-50 pages purely because their names appeared in its prose.
 *
 * Nothing is invented here. A platform with no matching stock returns an empty
 * array and the page says so, rather than padding itself with near-misses.
 */

/**
 * The text fitment is matched against: name and fitment, never description.
 * Exported so the market views in lib/catalog/markets.ts match vehicles by
 * exactly the same rule as these hubs -- two places deciding separately what
 * "fits a Ranger" means is how the site starts contradicting itself.
 */
export const fitmentMatchText = (product: Product): string =>
  [product.name, product.fitment].filter(Boolean).join(" • ");

/**
 * The same text, built from the manufacturer's structured application list.
 *
 * `fitment` is a sentence someone wrote; `fitmentApplications` is the
 * manufacturer's own table of what the part fits -- 11,873 verified rows
 * across the catalogue, each a make, a model, an optional submodel and a year
 * range. Nothing here is inferred: a listing with no applications recorded
 * yields an empty string and matches nothing.
 *
 * Rendered in the same shape the catalogue's own fitment prose uses
 * ("1964-1968 Ford Mustang"), because that is the shape the existing vehicle
 * patterns were written against -- including the exclusions that depend on a
 * year range being present, such as the pre-2011 US compact Ranger. Reusing
 * the patterns rather than writing new ones is the point: one definition of
 * what "fits a Mustang" means, tested against two sources of evidence.
 */
export const applicationMatchText = (product: Product): string =>
  (product.fitmentApplications ?? [])
    .map((application) => {
      const { yearFrom, yearTo, make, model, submodel } = application;
      const years =
        yearFrom && yearTo
          ? yearFrom === yearTo
            ? String(yearFrom)
            : `${yearFrom}-${yearTo}`
          : (yearFrom ?? yearTo ?? "");
      return [years, make, model, submodel].filter(Boolean).join(" ");
    })
    .join(" • ");

export function matchesFitmentPatterns(
  text: string,
  include: RegExp[],
  exclude?: RegExp[]
): boolean {
  if (!include.some((pattern) => pattern.test(text))) return false;
  if (exclude?.some((pattern) => pattern.test(text))) return false;
  return true;
}

export function getVehicleParts(platform: VehiclePlatform): Product[] {
  return getAllProducts().filter((product) =>
    matchesFitmentPatterns(
      fitmentMatchText(product),
      platform.include,
      platform.exclude
    )
  );
}

/**
 * Parts from the platform this vehicle is mechanically derived from.
 *
 * Used only where the relationship is a documented manufacturing fact — the
 * Amarok NF on the Ranger T6.2 platform, the BT-50 TF on the D-Max RG01. The
 * page presents these as "frequently fits, confirm before ordering", never as
 * verified fitment, because chassis sharing does not mean every part crosses.
 */
export function getSharedPlatformParts(platform: VehiclePlatform): {
  parts: Product[];
  donor: VehiclePlatform | undefined;
} {
  if (!platform.sharedWith) return { parts: [], donor: undefined };

  const donor = getVehiclePlatform(platform.sharedWith.slug);
  if (!donor) return { parts: [], donor: undefined };

  const own = new Set(getVehicleParts(platform).map((p) => p.id));

  return {
    parts: getVehicleParts(donor).filter((p) => !own.has(p.id)),
    donor,
  };
}

/** Count used by the index cards, so a hub never advertises stock it lacks. */
export function getVehiclePartCount(platform: VehiclePlatform): number {
  return getVehicleParts(platform).length;
}
