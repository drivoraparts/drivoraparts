import type { Product, RequirementsChecklistId } from "./types";

/**
 * What kind of product a listing is, worked out from its name and category.
 *
 * The catalog has no product-type field, and the category cannot answer this
 * ("engine" holds filters, manifolds and sensors as well as engines), so the
 * name is read for the thing being sold and the accessories that merely
 * mention a powertrain are excluded. This is the same rule the catalog audit
 * used, so the audit's counts and the page agree.
 *
 * It only decides which shared installation checklist a listing gets. It never
 * says anything about what a listing contains.
 */
export type ProductKind =
  | "engine-assembly"
  | "transmission"
  | "turbo-supercharger"
  | "transfer-case-differential";

const ACCESSORY =
  /\b(mount|mounts|bracket|brace|skid|filter|belt|hose|line|lines|manifold|sensor|gasket|seal|bolt|stud|nut|washer|hardware|cooler|pan|pump|adapter|adaptor|spacer|shifter|linkage|cable|harness|controller|solenoid|valve body|dipstick|crossmember|fluid|cover|plate|flange|clamp|bushing|insulator|power steering|service kit|rebuild kit|shift kit|install kit|swap kit|conversion kit|kit for|flexplate|flywheel|clutch|dust|shield|guard|spring|arm|link|exhaust brake|brakeloc|idle control|module|support|tuner|programmer|monitor|gauge|switch|relay|wire|piston|rod|rods|cam|camshaft|head|heads|crank|crankshaft|timing|valve|injector|rocker|lifter|pulley|damper|oil|pedal|actuator|wastegate|intercooler|piping|pipe|tuning)\b/i;

export function classifyProductKind(
  product: Pick<Product, "name" | "category">
): ProductKind | null {
  const name = product.name ?? "";

  if (
    /\b(complete engine|engine assembly|long ?block|short ?block|crate engine|engine package|swap package|drop[- ]in package|drivetrain|complete drivetrain|rotating assembly)\b/i.test(name) ||
    (/\bengine\b|\bV\d+\b.*\b(L|Liter)\b/i.test(name) &&
      product.category === "engine" &&
      !ACCESSORY.test(name) &&
      /\b\d\.\d\s?L?\b|engine$/i.test(name))
  ) {
    return "engine-assembly";
  }

  if (/\b(transmission|transaxle|gearbox)\b/i.test(name) && !ACCESSORY.test(name)) {
    return "transmission";
  }

  if (
    /\b(transfer case|differential|diff\b|axle)\b/i.test(name) &&
    !/\b(seal|bolt|bearing|cover|gasket|mount)\b/i.test(name)
  ) {
    return "transfer-case-differential";
  }

  if (/\b(turbocharger|turbo|supercharger)\b/i.test(name) && !ACCESSORY.test(name)) {
    return "turbo-supercharger";
  }

  return null;
}

/** The shared checklist a kind uses. A supercharger is told apart from a turbo by name. */
export function checklistForKind(
  kind: ProductKind,
  name: string
): RequirementsChecklistId {
  switch (kind) {
    case "engine-assembly":
      return "engine";
    case "transmission":
      return "transmission";
    case "transfer-case-differential":
      return "drivetrain";
    case "turbo-supercharger":
      return /\b(supercharger|blower|whipple|harrop|tvs\d*|roots)\b/i.test(name)
        ? "supercharger"
        : "turbocharger";
  }
}

/**
 * Kinds that currently get the shared checklist and the derived contents
 * status automatically. Widen this list as each product group is processed;
 * a listing outside it shows nothing new unless it has explicit contents.
 */
export const ROLLOUT_KINDS: readonly ProductKind[] = [
  "engine-assembly",
  "transmission",
  "turbo-supercharger",
  "transfer-case-differential",
];
