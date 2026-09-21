import { categories, getAllProducts } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";
import { getMarket, marketScope, type MarketKey } from "@/lib/catalog/markets";
import { compareByMerchandising } from "@/lib/catalog/merchandising";

/* =========================================================
   DRIVORAPARTS — CATALOG SECTIONS
   ---------------------------------------------------------
   A catalog page is rows, not one endless grid: the systems
   that scope actually buys, each a horizontal row of real
   listings with a way through to the rest.

   A SCOPE IS A MARKET, OR THE WHOLE CATALOGUE
   The four market pages were the only pages built this way.
   /catalog/all now uses the same builder with no market
   filter applied -- the same gate, the same claiming, the
   same order. Widening the scope was the whole change; a
   second implementation for the front page would have been
   free to drift from this one, and eventually would have.

   A SECTION EXISTS ONLY WHERE THE STOCK DOES
   Every row below is gated on MIN_SECTION_LISTINGS in the
   scope being shown. Nothing is padded to make a page look
   full and nothing is invented to fill a gap, so the shape
   of each market is the shape of the catalogue:

     - Australia has no Winches row. Six listings in the
       whole catalogue are winches and none of them names an
       Australian vehicle; what a "winches" rule would
       actually collect is winch-ready bull bars, which is
       not the same thing.
     - Nowhere has a Towing row. The catalogue holds no tow
       bars, hitches or tow mirrors at all.
     - Nowhere has a Performance or Replacement Parts row.
       Those are marketing words, not part types, and any
       rule for them would be taxonomy I made up.

   TWO KINDS OF SECTION
   Some are the catalogue's own categories. Others are part
   types the category system does not model -- fuel system,
   cooling, snorkels -- matched on the product name only.
   Never on fitment or description: a Ram fuel filter names
   its own job, while an unrelated part whose fitment text
   happens to mention fuel does not.

   NO LISTING APPEARS TWICE ON A PAGE
   The specific rows claim their listings before the broad
   ones, so Fuel System takes the injectors and the Engine
   row keeps the long blocks and heads. Each row is ordered
   by the same merchandising rank the grid uses, and "View
   all" opens the section in full, deduplication aside.
========================================================= */

/** A row with fewer than this reads as a mistake rather than a section. */
export const MIN_SECTION_LISTINGS = 3;

/** How many cards a row carries before "View all" takes over. */
export const SECTION_ROW_SIZE = 12;

/** Rows per market page, so a page stays a page. */
const MAX_SECTIONS = 10;

type SectionDefinition = {
  key: string;
  label: string;
  /** One honest line about what the row holds. Optional. */
  blurb?: string;
  /** A catalogue category, or name patterns for a part type it does not model. */
  category?: string;
  patterns?: RegExp[];
  /**
   * Specific rows claim their listings first, so a broad row never repeats
   * what a precise one already showed.
   */
  specificity: 1 | 2;
};

const SECTIONS: SectionDefinition[] = [
  // ---- part types the category system does not model ----
  {
    key: "fuel-system",
    label: "Fuel System",
    blurb: "Injectors, injection pumps, lift pumps, rails and tanks.",
    patterns: [
      /\b(injector|injection pump|fuel pump|lift pump|fuel rail|fuel filter|fuel tank|fuel line|fuel pressure)\b/i,
      /\b(cp3|cp4|vp44|p7100)\b/i,
    ],
    specificity: 1,
  },
  {
    key: "cooling",
    label: "Cooling",
    blurb: "Radiators, intercoolers, water pumps and oil coolers.",
    patterns: [
      /\b(radiator|intercooler|charge ?air|coolant|water pump|fan clutch|oil cooler|thermostat)\b/i,
    ],
    specificity: 1,
  },
  {
    key: "exhaust",
    label: "Exhaust",
    blurb: "Manifolds, up-pipes, downpipes and exhaust systems.",
    patterns: [/\b(exhaust|downpipe|muffler|header|up.?pipe|turbo.?back)\b/i],
    specificity: 1,
  },
  {
    key: "steering",
    label: "Steering",
    blurb: "Steering boxes, stabilisers, track bars and linkage.",
    patterns: [
      /\b(steering (box|gear|stabili[sz]er|damper|pump)|tie rod|drag link|pitman|idler arm|track bar)\b/i,
    ],
    specificity: 1,
  },
  {
    key: "lift-kits",
    label: "Lift Kits",
    blurb: "Complete lift and levelling kits, and coilover systems.",
    patterns: [/\b(lift kit|level(l)?ing kit|suspension (kit|system)|coilover)\b/i],
    specificity: 1,
  },
  {
    key: "bull-bars",
    label: "Bull Bars",
    blurb: "Bull bars, nudge bars and grille guards.",
    patterns: [/\b(bull ?bar|nudge bar|grille guard)\b/i],
    specificity: 1,
  },
  {
    key: "snorkels",
    label: "Snorkels",
    patterns: [/\bsnorkel\b/i],
    specificity: 1,
  },
  {
    key: "roof-racks",
    label: "Roof Racks",
    patterns: [
      /\b(roof rack|roof platform|platform rack|pioneer platform|base rack|slimsport|load bar)\b/i,
    ],
    specificity: 1,
  },
  {
    key: "recovery",
    label: "Recovery",
    patterns: [
      /\b(recovery point|recovery board|snatch (block|strap)|bow shackle|soft shackle|traction board|maxtrax|tow strap)\b/i,
    ],
    specificity: 1,
  },
  {
    key: "diff-lockers",
    label: "Diffs & Lockers",
    patterns: [/\b(air locker|differential (cover|locker)|\blocker\b|limited slip)\b/i],
    specificity: 1,
  },
  {
    key: "underbody",
    label: "Underbody Protection",
    patterns: [/\b(bash plate|skid plate|underbody|sump guard|diff(erential)? guard)\b/i],
    specificity: 1,
  },
  // ---- the catalogue's own categories ----
  ...categories.map(
    (category): SectionDefinition => ({
      key: category.slug,
      label: category.name,
      category: category.slug,
      specificity: 2,
    })
  ),
];

const BY_KEY = new Map(SECTIONS.map((section) => [section.key, section]));

/**
 * What a set of rows can be built over.
 *
 * A market, or the whole catalogue. "all" is not a fifth market and holds no
 * products of its own -- it is the absence of a market filter, which is
 * exactly what marketScope() already returns null for. One builder, one set
 * of rules, two kinds of scope.
 */
export type SectionScope = MarketKey | "all";

/**
 * The rows each scope offers, in the order they are shown.
 *
 * Ordered by what that scope buys, not by how many listings it has: the
 * counts decide whether a row appears at all, never where it sits.
 */
const SECTION_ORDER: Record<SectionScope, string[]> = {
  /*
   * The whole catalogue, read as systems.
   *
   * Deliberately not Worldwide's order, though both scopes hold the same
   * 4,044 listings. Worldwide is a market plate and leads with the
   * catalogue's own categories. This is the marketplace's front door, and it
   * leads with the way a build is actually assembled -- engine, then what
   * feeds it, then what moves the power, then what controls it -- which
   * brings forward the four part types the category system does not model at
   * all. Fuel System (326), Cooling (123), Exhaust (118) and Steering (77)
   * are 644 listings that no category row can surface, because the catalogue
   * files them under engine, suspension and the rest.
   *
   * MAX_SECTIONS caps what is rendered; the tail is here so that a row
   * failing the minimum is replaced by the next real one rather than leaving
   * the page a row short.
   */
  all: [
    "engine",
    "turbocharger",
    "fuel-system",
    "transmission",
    "suspension",
    "brakes",
    "cooling",
    "exhaust",
    "steering",
    "lift-kits",
    "electronics",
    "wheels-tires",
    "lighting",
    "4x4-accessories",
    "interior",
    "bumper",
    "body-parts",
    "canopy",
  ],
  usa: [
    "engine",
    "turbocharger",
    "fuel-system",
    "transmission",
    "suspension",
    "lift-kits",
    "brakes",
    "cooling",
    "exhaust",
    "steering",
    "electronics",
    "diff-lockers",
    "bumper",
    "body-parts",
    "4x4-accessories",
  ],
  australia: [
    "suspension",
    "lift-kits",
    "bull-bars",
    "canopy",
    "snorkels",
    "4x4-accessories",
    "roof-racks",
    "lighting",
    "recovery",
    "diff-lockers",
    "wheels-tires",
    "bumper",
  ],
  uk: [
    "suspension",
    "lift-kits",
    "4x4-accessories",
    "wheels-tires",
    "bull-bars",
    "canopy",
    "snorkels",
    "engine",
    "roof-racks",
    "lighting",
    "transmission",
    "bumper",
  ],
  worldwide: [
    "engine",
    "suspension",
    "transmission",
    "turbocharger",
    "brakes",
    "wheels-tires",
    "4x4-accessories",
    "electronics",
    "lighting",
    "interior",
    "bumper",
    "canopy",
    "body-parts",
    "aftermarket",
  ],
};

/** Matched on the product name alone -- see the note at the top of the file. */
function matchesSection(product: Product, section: SectionDefinition): boolean {
  if (section.category) return product.category === section.category;
  return Boolean(section.patterns?.some((pattern) => pattern.test(product.name)));
}

export function getSection(key: string | undefined) {
  return key ? BY_KEY.get(key) : undefined;
}

/** Everything in a section, market scope aside. Used by the catalog query. */
export function sectionMatcher(key: string): ((product: Product) => boolean) | null {
  const section = BY_KEY.get(key);
  if (!section) return null;
  return (product) => matchesSection(product, section);
}

export type CatalogSection = {
  key: string;
  label: string;
  blurb?: string;
  /** Listings shown in the row, already in merchandised order. */
  products: Product[];
  /** Everything the section holds in this scope, before deduplication. */
  total: number;
};

const cache = new Map<string, CatalogSection[]>();

/**
 * The rows to render for a scope, optionally narrowed to one of its vehicles.
 *
 * Sections are filled in specificity order so no listing appears twice, then
 * returned in the scope's display order. A section that cannot reach
 * MIN_SECTION_LISTINGS after that is dropped rather than shown thin.
 *
 * This was getMarketSections(MarketKey, vehicle?) and is otherwise unchanged:
 * the gate, the specificity claiming, the deduplication and the merchandised
 * ordering are all the same code doing the same thing. Only the scope widened,
 * so /catalog/all could stop being the one page in the catalogue that had no
 * rows rather than gaining a second implementation that would drift from this
 * one.
 */
export function getCatalogSections(
  scope: SectionScope,
  vehicleKey?: string
): CatalogSection[] {
  const cacheKey = `${scope}|${vehicleKey ?? ""}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // A market key has to name a real market; "all" names no market at all,
  // and marketScope() already returns null for that -- which is precisely
  // "do not narrow the catalogue".
  if (scope !== "all" && !getMarket(scope)) return [];

  const productScope =
    scope === "all" ? null : marketScope(scope, vehicleKey);
  const inScope = getAllProducts()
    .filter((product) => !productScope || productScope.has(product.id))
    .sort(compareByMerchandising);

  const order = SECTION_ORDER[scope] ?? [];
  const claimOrder = [...order].sort((a, b) => {
    const left = BY_KEY.get(a)?.specificity ?? 2;
    const right = BY_KEY.get(b)?.specificity ?? 2;
    return left - right;
  });

  const claimed = new Set<number>();
  const built = new Map<string, CatalogSection>();

  for (const key of claimOrder) {
    const section = BY_KEY.get(key);
    if (!section) continue;

    const all = inScope.filter((product) => matchesSection(product, section));
    const fresh = all.filter((product) => !claimed.has(product.id));
    if (fresh.length < MIN_SECTION_LISTINGS) continue;

    for (const product of fresh.slice(0, SECTION_ROW_SIZE)) claimed.add(product.id);

    built.set(key, {
      key,
      label: section.label,
      blurb: section.blurb,
      products: fresh.slice(0, SECTION_ROW_SIZE),
      total: all.length,
    });
  }

  const result = order
    .map((key) => built.get(key))
    .filter((section): section is CatalogSection => Boolean(section))
    .slice(0, MAX_SECTIONS);

  cache.set(cacheKey, result);
  return result;
}
