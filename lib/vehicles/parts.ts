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

const searchableText = (product: Product): string =>
  [product.name, product.fitment].filter(Boolean).join(" • ");

export function getVehicleParts(platform: VehiclePlatform): Product[] {
  return getAllProducts().filter((product) => {
    const text = searchableText(product);

    if (!platform.include.some((pattern) => pattern.test(text))) return false;
    if (platform.exclude?.some((pattern) => pattern.test(text))) return false;

    return true;
  });
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
