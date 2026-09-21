import { getAllProducts } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";
import type { Product } from "@/lib/inventory/types";
import {
  canLead,
  compareByMerchandising,
  spreadBrands,
} from "@/lib/catalog/merchandising";
import { MIN_SECTION_LISTINGS } from "@/lib/catalog/sections";

/* =========================================================
   DRIVORAPARTS — EDITORIAL COLLECTIONS
   ---------------------------------------------------------
   HOW THESE USED TO BE CHOSEN, AND WHY IT HAD TO CHANGE
   Every collection here was `filter(category).slice(0, 6)`
   over getAllProducts(). That is not a selection: it is the
   first six listings of a category in whatever order the
   inventory arrays happened to concatenate, presented under
   headings that claim someone chose them. "Truck Builder's
   Choice" was the first six body-parts listings, and it
   would have stayed the same six as stock changed.

   HOW THEY ARE CHOSEN NOW
   The order below is the site's existing merchandising
   hierarchy, applied to a candidate pool rather than to the
   whole catalogue. Nothing new was invented to rank them:

     1  CURATED_IDS          lead, because someone said so
     2  verified applications the manufacturer's own fitment
                             table, not a sentence someone
                             wrote -- see fitmentApplications
     3  recorded demand      views + cart adds
     4  completeness         fitment, part number, real
                             description, market membership
     5  brand spreading      no brand owns a six-card rail
     6  catalogue order      stable last resort

   Steps 1, 3, 4 and 6 are merchandisingRank() exactly as the
   grid uses it. Step 2 is applied above it and step 5 after.

   WHAT A COLLECTION IS STILL NOT ALLOWED TO DO
   Pad. A collection that cannot field MIN_SECTION_LISTINGS
   genuinely qualifying products is not rendered at all --
   the same rule the market rows follow. Nothing is added to
   reach six, and no collection is balanced against another.
========================================================= */

/**
 * The quality floor for appearing in a collection.
 *
 * canLead() is the catalogue's existing test: a customer has to be able to
 * tell what the part fits, or read a description written for it. A listing
 * failing both can still be found, filtered to and bought -- it just cannot
 * be one of six listings presented as a recommendation.
 */
function qualifies(product: Product): boolean {
  return canLead(product);
}

/** Does the manufacturer's own application table cover this listing? */
function hasVerifiedApplications(product: Product): boolean {
  return (product.fitmentApplications?.length ?? 0) > 0;
}

/**
 * Truck body parts, by what the part is.
 *
 * The `body-parts` category holds both truck sheet metal and muscle-car
 * chassis bracing, and ranking the category alone filled "Truck Builder's
 * Choice" with F-body K-members and A-body frame repair kits -- well-
 * documented listings, correctly ranked, and not what the heading or the
 * blurb says the collection is. A collection whose contents argue with its
 * own title is worse than one that is merely ordered badly.
 *
 * Matched on the product name only, for the reason lib/catalog/sections.ts
 * gives for its own part-type rows: the name states what a part IS, while
 * fitment and description mention other things in passing.
 */
const TRUCK_BODY =
  /\b(beds?|bedsides?|bed liners?|shells?|canop(?:y|ies)|tonneaus?|tailgates?|fenders?|flares?|hoods?|bonnets?|grilles?|cabs?|trays?)\b/i;
/*
 * Running boards, side steps, rockers and quarter panels are deliberately not
 * in that list. They are body parts on anything with doors, and including
 * them put a Volkswagen Caddy Maxi -- a panel van -- fourth in a collection
 * called Truck Builder's Choice. A bed, a tonneau, a tailgate or a cab says
 * "truck" on its own; a side step does not.
 */

/**
 * Rank a candidate pool and take the best of it.
 *
 * `spreadBrands` runs with a run limit of 2 rather than the catalogue's 4:
 * four of six cards from one brand is a supplier dump, not a collection.
 */
function select(candidates: Product[], take: number): Product[] {
  const ranked = candidates.filter(qualifies).sort((a, b) => {
    // Step 2. Verified applications lead, because "fits these 40 vehicles,
    // per the manufacturer" is a stronger statement than a fitment sentence.
    const verified =
      Number(hasVerifiedApplications(b)) - Number(hasVerifiedApplications(a));
    if (verified !== 0) return verified;

    // Steps 1, 3, 4 and 6, in one call: the global merchandised position.
    return compareByMerchandising(a, b);
  });

  // Step 5, over a pool wide enough for the swap to have somewhere to go.
  return spreadBrands(ranked.slice(0, take * 4), 2).slice(0, take);
}

export type EditorialCollection = {
  slug: string;
  title: string;
  blurb: string;
  href: string;
  products: Product[];
  /**
   * A photography slot from the homepage manifest whose subject genuinely is
   * this collection -- the off-roader for off-road, the workhorse truck for
   * truck builds, the mechanical close-up for track hardware. Left undefined
   * where no honest match exists, and the rail then leads with type instead
   * of borrowing a picture of something else. There is no JDM photograph in
   * this project, so the JDM collection has none.
   */
  photoSlot?: string;
};

const JDM_PLATFORM_PREFIXES = [
  "toyota-",
  "nissan-",
  "mazda-",
  "honda-",
  "subaru-",
  "mitsubishi-",
];

/** Real, currently-in-stock products grouped into evergreen editorial collections. */
export function getEditorialCollections(perCollection = 6): EditorialCollection[] {
  const all = getAllProducts();

  const inCategory = (categorySlug: string) =>
    all.filter((p) => p.category === categorySlug);

  const collections: EditorialCollection[] = [
    {
      slug: "track-day",
      // The blurb promised braking *and* suspension while the rail held only
      // brakes. Both are what a track build actually needs, so the collection
      // now carries both rather than the sentence being trimmed to match a
      // narrower list.
      title: "Track Day Collection",
      blurb: "Braking and suspension hardware built for repeated hard stops.",
      href: routes.category("brakes"),
      /*
       * Both systems, each ranked on its own, rather than one pooled ranking.
       *
       * Pooling them is the obvious simplification and it is wrong here: the
       * suspension listings are far better documented than the brake ones, so
       * a single ranked pool returned six suspension parts and no brakes at
       * all -- under a blurb whose first word is "Braking". The quota is what
       * keeps the collection matching its own sentence.
       */
      products: [
        ...select(inCategory("brakes"), Math.ceil(perCollection / 2)),
        ...select(inCategory("suspension"), Math.floor(perCollection / 2)),
      ],
      photoSlot: "performance",
    },
    {
      slug: "off-road-essentials",
      title: "Off-Road Essentials",
      blurb: "4x4 accessories for builds that leave the pavement.",
      href: routes.category("4x4-accessories"),
      products: select(inCategory("4x4-accessories"), perCollection),
      photoSlot: "offroader",
    },
    {
      slug: "truck-builders-choice",
      title: "Truck Builder's Choice",
      blurb: "Beds, shells, and body parts for serious truck projects.",
      href: routes.category("body-parts"),
      products: select(
        inCategory("body-parts").filter((p) => TRUCK_BODY.test(p.name)),
        perCollection
      ),
      photoSlot: "workhorse",
    },
    {
      slug: "premium-jdm",
      title: "Premium JDM Collection",
      blurb: "Legendary Japanese engine platforms, swap-ready.",
      href: routes.category("engine"),
      /*
       * `platform` is recorded on 71 listings in the whole catalogue, so this
       * pool is small by nature and is left that way. The alternative -- a
       * rule guessing Japanese origin from a brand or a product name -- would
       * be a taxonomy invented to fill a rail, and an engine is not JDM
       * because its title reads that way. If the qualifying pool ever falls
       * below the minimum, the collection withdraws itself.
       */
      products: select(
        all.filter(
          (p) =>
            p.category === "engine" &&
            p.platform &&
            JDM_PLATFORM_PREFIXES.some((prefix) => p.platform!.startsWith(prefix))
        ),
        perCollection
      ),
      // No JDM photograph exists here. Type carries this one.
    },
  ];

  // The market rows' rule, applied here: a row too thin to be a row is not
  // shown at all. It used to be `length > 0`, which would render a
  // "collection" of one.
  return collections.filter(
    (collection) => collection.products.length >= MIN_SECTION_LISTINGS
  );
}
