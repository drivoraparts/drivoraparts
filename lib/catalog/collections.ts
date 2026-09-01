import { getAllProducts } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";
import type { Product } from "@/lib/inventory/types";

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

  const byCategory = (categorySlug: string, take = perCollection) =>
    all.filter((p) => p.category === categorySlug).slice(0, take);

  const jdmEngines = all
    .filter(
      (p) =>
        p.category === "engine" &&
        p.platform &&
        JDM_PLATFORM_PREFIXES.some((prefix) => p.platform!.startsWith(prefix))
    )
    .slice(0, perCollection);

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
      products: [
        ...byCategory("brakes", Math.ceil(perCollection / 2)),
        ...byCategory("suspension", Math.floor(perCollection / 2)),
      ],
      photoSlot: "performance",
    },
    {
      slug: "off-road-essentials",
      title: "Off-Road Essentials",
      blurb: "4x4 accessories for builds that leave the pavement.",
      href: routes.category("4x4-accessories"),
      products: byCategory("4x4-accessories"),
      photoSlot: "offroader",
    },
    {
      slug: "truck-builders-choice",
      title: "Truck Builder's Choice",
      blurb: "Beds, shells, and body parts for serious truck projects.",
      href: routes.category("body-parts"),
      products: byCategory("body-parts"),
      photoSlot: "workhorse",
    },
    {
      slug: "premium-jdm",
      title: "Premium JDM Collection",
      blurb: "Legendary Japanese engine platforms, swap-ready.",
      href: routes.category("engine"),
      products: jdmEngines,
      // No JDM photograph exists here. Type carries this one.
    },
  ];

  return collections.filter((collection) => collection.products.length > 0);
}
