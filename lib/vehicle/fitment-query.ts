/**
 * Turning a vehicle selection into a catalog query.
 *
 * This was inline in ShopByVehicleFinder. It lives here because the catalog
 * now presents the same finder in a different shape, and two components
 * deciding separately what "compatible" means is how fitment quietly starts
 * disagreeing with itself. The presentation may differ; this must not.
 *
 * WHY YEAR IS NOT IN THE QUERY
 * The catalog has no structured year data. Matching runs against fitment text,
 * and a specific model year almost never appears literally in it, so folding
 * the year into the terms made nearly every real fitment match fail --
 * "2020 Toyota Supra 2JZ" returned nothing while "Toyota Supra 2JZ" returns
 * real products. Make, model and engine do appear in that text, so they are
 * what drive the search.
 *
 * The year control is therefore collected and discarded. That is a real
 * shortcoming rather than a subtlety: a customer who picks 2020 is entitled to
 * assume the results were narrowed to 2020, and they were not. Fixing it means
 * parsing the year ranges out of the 658 products that carry fitment text and
 * filtering on them -- worth doing, and deliberately not smuggled into a
 * styling pass, because it changes which products someone is told will fit.
 */

export type VehicleSelection = {
  year?: string;
  make?: string;
  model?: string;
  engine?: string;
};

/** The terms actually searched. Empty when nothing usable was chosen. */
export function buildFitmentQuery({
  make = "",
  model = "",
  engine = "",
}: VehicleSelection): string {
  return [make.trim(), model.trim(), engine.trim()].filter(Boolean).join(" ");
}

/** Where "Find compatible parts" goes. Falls back to the unfiltered catalog. */
export function fitmentHref(selection: VehicleSelection): string {
  const query = buildFitmentQuery(selection);
  return query ? `/catalog/all?q=${encodeURIComponent(query)}` : "/catalog/all";
}

/**
 * Whether the current selection will actually narrow anything.
 *
 * Used to tell the customer that a year on its own does nothing, rather than
 * sending them to the unfiltered catalog and letting them work it out.
 */
export function fitmentSelectionIsUsable(selection: VehicleSelection): boolean {
  return buildFitmentQuery(selection).length > 0;
}

/** Makes represented in the catalog's fitment data. */
export const VEHICLE_MAKES = [
  "BMW",
  "Toyota",
  "Nissan",
  "Honda",
  "Mazda",
  "Ford",
  "Chevrolet",
  "Dodge",
  "Audi",
  "Mercedes-Benz",
  "Jaguar",
  "Chrysler",
  "GMC",
  "Lexus",
  "Jeep",
  "Volkswagen",
  "Subaru",
  "Isuzu",
  "Mitsubishi",
  "Hino",
] as const;

/** Model years offered, newest first. */
export function vehicleYears(now = new Date()): number[] {
  const current = now.getFullYear();
  return Array.from({ length: current - 1969 }, (_, i) => current - i);
}
