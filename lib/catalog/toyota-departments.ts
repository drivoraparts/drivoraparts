import { getAllProducts, isVerifiedToyotaGenuine, routes } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";
import { isHeldListing } from "@/lib/inventory/held";

/* =========================================================
   TOYOTA DEPARTMENTS
   ---------------------------------------------------------
   The storefront's shopping departments, each a view over
   the catalog's existing categories -- nothing is moved or
   recategorized, so category URLs, feeds and the admin are
   unchanged. A department appears only when it has public
   listings, so a department never opens onto an empty page.

   "Toyota Genuine Parts" counts only listings verified in
   lib/inventory/data/toyota-genuine.json. While that list is
   empty the department does not exist.

   Engines and transmissions are not split into complete
   units versus components: the catalog records no field that
   says which a listing is, and guessing from titles would
   misfile parts. They are one department each until it does.
========================================================= */

export type ToyotaDepartment = {
  key: string;
  name: string;
  description: string;
  href: string;
  count: number;
};

type DepartmentRule = Omit<ToyotaDepartment, "href" | "count"> & {
  categories?: string[];
  match?: (product: Product) => boolean;
};

const RULES: DepartmentRule[] = [
  {
    key: "genuine",
    name: "Toyota Genuine Parts",
    description: "Verified Genuine Toyota parts, with Toyota part numbers.",
    match: (product) => isVerifiedToyotaGenuine(product) && !isHeldListing(product),
  },
  {
    key: "engines",
    name: "Toyota Engines",
    description: "Engines, intakes and engine components for Toyota models.",
    categories: ["engine"],
  },
  {
    key: "transmissions",
    name: "Toyota Transmissions",
    description: "Transmissions, clutches and drivetrain parts.",
    categories: ["transmission"],
  },
  {
    key: "suspension",
    name: "Suspension & Steering",
    description: "Lift kits, shocks, springs, control arms and steering.",
    categories: ["suspension"],
  },
  {
    key: "body",
    name: "Body Parts",
    description: "Bumpers, body panels and bed canopies.",
    categories: ["bumper", "body-parts", "canopy"],
  },
  {
    key: "electrical",
    name: "Electrical Components",
    description: "Headlights, lighting and electronics.",
    categories: ["lighting", "electronics"],
  },
  {
    key: "performance",
    name: "Performance Parts",
    description: "Wheels, brakes, turbochargers and performance upgrades.",
    categories: ["wheels-tires", "brakes", "turbocharger", "aftermarket"],
  },
  {
    key: "accessories",
    name: "Toyota Accessories",
    description: "Recovery gear, racks, snorkels and interior accessories.",
    categories: ["4x4-accessories", "interior"],
  },
];

function hrefFor(rule: DepartmentRule): string {
  if (rule.key === "genuine") return routes.genuine;
  const cats = rule.categories ?? [];
  return cats.length === 1
    ? routes.category(cats[0])
    : `${routes.all}?category=${cats.join(",")}`;
}

/** Departments with at least one public listing, in storefront order. */
export function getToyotaDepartments(): ToyotaDepartment[] {
  const products = getAllProducts();
  return RULES.map((rule) => {
    const matches =
      rule.match ?? ((p: Product) => (rule.categories ?? []).includes(p.category));
    return {
      key: rule.key,
      name: rule.name,
      description: rule.description,
      href: hrefFor(rule),
      count: products.filter(matches).length,
    };
  }).filter((department) => department.count > 0);
}

/** Public engine and transmission listings, newest first. */
export function getEngineAndTransmissionProducts(limit = 12): Product[] {
  return getAllProducts()
    .filter((p) => p.category === "engine" || p.category === "transmission")
    .slice(0, limit);
}

/**
 * Public listings verified as Toyota Genuine Parts and available to buy --
 * held listings (out of stock, details being confirmed) are left out. This is
 * the single rule for the Genuine section, its header link, its homepage tile
 * and its sitemap entry, so none of them can point at an empty page.
 */
export function getVerifiedGenuineProducts(limit = 12): Product[] {
  return getAllProducts()
    .filter((p) => isVerifiedToyotaGenuine(p) && !isHeldListing(p))
    .slice(0, limit);
}

/** Whether the Toyota Genuine section has anything to show. */
export function hasGenuineSection(): boolean {
  return getVerifiedGenuineProducts(1).length > 0;
}
