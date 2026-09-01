import { getAllProducts, getProductThumbnail } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";

export type StaffPick = {
  categorySlug: string;
  reason: string;
  product: Product;
};

/**
 * Editorial notes on four systems, each shown against a real listing.
 *
 * WHAT WAS REMOVED AND WHY
 * The engine note used to end "we check fitment and condition notes closely
 * before it's listed." That is a claim about how this business operates, and
 * nothing in this repository can support it -- there is no inspection record,
 * no QA field, no workflow it could be read from. Printing it beside a price
 * asks the customer to accept a diligence promise on the strength of a
 * sentence someone typed. It has been replaced with advice about the part,
 * which is the thing this section can actually stand behind.
 *
 * The remaining three were already claims about parts rather than about us,
 * and they stand.
 *
 * WHAT THE PICKS ACTUALLY ARE
 * These are notes on a category, shown against a representative listing from
 * it -- not four items someone chose individually. The selection used to be
 * `all.find(...)`, i.e. whichever listing happened to sit first in the
 * concatenated arrays, presented under the heading "what we'd grab off the
 * shelf". The rule is now explicit: the most recently listed item in the
 * category that has a real photograph. That is defensible and it changes as
 * stock changes. The section's copy says which of the two this is, so the
 * reader is not invited to read individual curation into it.
 */
const PICKS: { categorySlug: string; reason: string }[] = [
  {
    categorySlug: "engine",
    reason:
      "The highest-stakes purchase in any build. Matching the platform, loom and ECU matters more than the headline power figure — a swap that fights the wiring costs more than the engine did.",
  },
  {
    categorySlug: "suspension",
    reason:
      "The part of a build most people underspend on. It is the difference between a car that just looks lowered and one that actually handles.",
  },
  {
    categorySlug: "turbocharger",
    reason:
      "Sizing a turbo wrong ruins an otherwise good build. Match the spool characteristics to how the car is actually driven, not to the peak number.",
  },
  {
    categorySlug: "brakes",
    reason:
      "More power always needs more stopping power to match it. Don't be the build with a 500hp motor and stock brakes.",
  },
];

/**
 * The most recently listed photographed product in each category.
 *
 * Placeholder art is skipped for the same reason the category tiles skip it:
 * a pick whose picture is a category SVG is advertising a gap. Listings with
 * no createdAt sort last rather than being excluded, so a category that has
 * never recorded a date still shows something real.
 */
export function getStaffPicks(): StaffPick[] {
  const all = getAllProducts();

  return PICKS.map(({ categorySlug, reason }) => {
    const candidates = all
      .filter((p) => p.category === categorySlug)
      .filter((p) => {
        const thumb = getProductThumbnail(p);
        return Boolean(thumb) && !thumb.includes("/placeholders/");
      })
      // Highest id wins, which is the most recently added listing here.
      //
      // This sorted on createdAt until it turned out that much of the
      // catalog sets createdAt to Date.now() plus a day, evaluated at module
      // load -- so the value differs between the server render and the
      // browser, and any component selecting on it can choose a different
      // product in each, which is a hydration mismatch React does not repair.
      // Ids ascend as listings are added, so they express the same intent
      // and mean the same thing everywhere.
      .sort((a, b) => b.id - a.id);

    const product = candidates[0];
    return product ? { categorySlug, reason, product } : null;
  }).filter((pick): pick is StaffPick => Boolean(pick));
}
