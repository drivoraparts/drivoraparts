import { getAllProducts } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";
import type { Product } from "@/lib/inventory/types";

export type EditorialCollection = {
  slug: string;
  title: string;
  blurb: string;
  href: string;
  products: Product[];
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

  const byCategory = (categorySlug: string) =>
    all.filter((p) => p.category === categorySlug).slice(0, perCollection);

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
      title: "Track Day Collection",
      blurb: "Braking and suspension hardware built for repeated hard stops.",
      href: routes.category("brakes"),
      products: byCategory("brakes"),
    },
    {
      slug: "off-road-essentials",
      title: "Off-Road Essentials",
      blurb: "4x4 accessories for builds that leave the pavement.",
      href: routes.category("4x4-accessories"),
      products: byCategory("4x4-accessories"),
    },
    {
      slug: "truck-builders-choice",
      title: "Truck Builder's Choice",
      blurb: "Beds, shells, and body parts for serious truck projects.",
      href: routes.category("body-parts"),
      products: byCategory("body-parts"),
    },
    {
      slug: "premium-jdm",
      title: "Premium JDM Collection",
      blurb: "Legendary Japanese engine platforms, swap-ready.",
      href: routes.category("engine"),
      products: jdmEngines,
    },
  ];

  return collections.filter((collection) => collection.products.length > 0);
}
