import { getAllProducts } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";

export type StaffPick = {
  categorySlug: string;
  reason: string;
  product: Product;
};

const PICKS: { categorySlug: string; reason: string }[] = [
  {
    categorySlug: "engine",
    reason:
      "A complete engine is the highest-stakes purchase in any build — we check fitment and condition notes closely before it's listed.",
  },
  {
    categorySlug: "suspension",
    reason:
      "Suspension is the part of a build most people underspend on. It's the difference between a car that just looks lowered and one that actually handles.",
  },
  {
    categorySlug: "turbocharger",
    reason:
      "Sizing a turbo wrong ruins an otherwise good build. We stock a range so you can match spool characteristics to how the car is actually driven.",
  },
  {
    categorySlug: "brakes",
    reason:
      "More power always means you need more stopping power to match it. Don't be the build with a 500hp motor and stock brakes.",
  },
];

/** Real, currently-in-stock products with genuine editorial reasoning per category. */
export function getStaffPicks(): StaffPick[] {
  const all = getAllProducts();

  return PICKS.map(({ categorySlug, reason }) => {
    const product = all.find((p) => p.category === categorySlug);
    return product ? { categorySlug, reason, product } : null;
  }).filter((pick): pick is StaffPick => Boolean(pick));
}
