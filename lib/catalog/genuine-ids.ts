import genuine from "@/lib/inventory/data/toyota-genuine.json";

/**
 * Listing ids verified as Toyota Genuine Parts, for client components (the
 * product cards). Reads only the small verification file, never the catalog.
 * The same list drives the product page label and the Toyota Genuine section,
 * so a card can never carry the badge for a listing those do not.
 */
const VERIFIED_GENUINE_IDS: ReadonlySet<number> = new Set(
  (genuine.verified as { id: number }[]).map((entry) => entry.id)
);

export function isVerifiedGenuineId(id: number): boolean {
  return VERIFIED_GENUINE_IDS.has(id);
}

export const GENUINE_BADGE_TEXT = "Toyota Genuine";
