import { categories, getAllProducts } from "@/lib/inventory";
import { getVehiclePlatform } from "@/data/vehicles";
import {
  applicationMatchText,
  fitmentMatchText,
  matchesFitmentPatterns,
} from "@/lib/vehicles/parts";

/* =========================================================
   DRIVORAPARTS — MARKETS
   ---------------------------------------------------------
   USA, Australia, UK and Worldwide are ways INTO the
   catalog, not separate catalogs. Each one is a filter over
   the same products /catalog/all lists. Nothing is copied,
   nothing is stored per market, and a product appears in
   more than one market when its fitment puts it there.

   HOW A PRODUCT GETS INTO A MARKET
   Only by naming one of that market's vehicles in its own
   name or fitment text. That is the rule the /vehicles hubs
   use, and for the utes that have a hub it is the same
   patterns. Nothing is inferred from where a brand is based,
   which warehouse a part ships from (the `location` field
   answers that, and is never read here), or a vehicle simply
   being popular somewhere.

   So universal parts (a winch, a compressor, a light bar)
   name no vehicle and belong to no regional market. They are
   in Worldwide, which is the whole catalog, and the regional
   pages say so instead of stretching to claim them.

   WHAT A MARKET OFFERS
   A vehicle is offered only where the catalog genuinely has
   parts for it (MIN_VEHICLE_LISTINGS). The UK list names Land
   Rover because that is where a UK 4x4 buyer looks first,
   but the catalog holds no Land Rover parts today, so those
   entries stay hidden. They appear by themselves the day real
   listings arrive, and not before.

   Server-only in practice: this reaches the whole product
   array and the vehicles dataset. Client components get
   plain props from the pages that call it.
========================================================= */

export type MarketKey = "usa" | "australia" | "uk" | "worldwide";

export type MarketVehicle = {
  /** The ?vehicle= value. It ends up in bookmarked URLs, so keep it stable. */
  key: string;
  /** Printed lighter than the model, so a row of chips reads by model. */
  make?: string;
  /** Must make sense on its own: compact lists print the model without the make. */
  model: string;
  /** Matched against name and fitment text, never the description. */
  include: RegExp[];
  exclude?: RegExp[];
  /** /vehicles/[slug], where the platform has its own fitment hub. */
  hub?: string;
};

export type MarketVehicleGroup = {
  label: string;
  vehicles: MarketVehicle[];
};

export type Market = {
  key: MarketKey;
  /** Position among the four, printed on the market plates. */
  index: string;
  name: string;
  tagline: string;
  summary: string;
  /** Empty for Worldwide, which is the whole catalog. */
  groups: MarketVehicleGroup[];
  /**
   * Existing category slugs, most relevant first. This orders the one
   * category system the site already has; it is not a second one.
   */
  categoryOrder: string[];
  seoTitle: string;
  seoDescription: string;
};

/**
 * Below this, a vehicle is left to search rather than offered as an entry
 * point. A chip that opens onto one or two listings reads as a dead end and
 * advertises the gap more than the stock.
 */
export const MIN_VEHICLE_LISTINGS = 3;

/**
 * A vehicle that already has a /vehicles hub takes that hub's patterns, so
 * the market and the hub cannot drift into two opinions about what fits.
 * A hub that has been renamed or removed yields a vehicle that matches
 * nothing, and it is quietly withheld rather than taking the catalog down.
 */
function fromHub(
  key: string,
  slug: string,
  make: string,
  model: string,
  extraExclude: RegExp[] = []
): MarketVehicle {
  const platform = getVehiclePlatform(slug);
  return {
    key,
    make,
    model,
    include: platform?.include ?? [],
    exclude: [...(platform?.exclude ?? []), ...extraExclude],
    hub: platform ? slug : undefined,
  };
}

/**
 * Rangers that are not the Ranger sold in Australia or the UK. Until 2011 the
 * US "Ford Ranger" was an unrelated compact pickup, and the catalog lists its
 * parts as, say, "1998–2011 Ford Ranger". The global T6 Ranger they share a
 * name with is a different truck.
 */
const US_COMPACT_RANGER =
  /\b(?:19[89]\d|200\d)\s*[–-]\s*(?:19[89]\d|200\d|201[01])\s+ford\s+ranger\b/i;

/**
 * Ford also named its 4.6, 5.4 and 6.8 petrol engines "Triton". The catalog
 * has none today; this keeps a future Super Duty listing from turning up
 * under the Mitsubishi.
 */
const FORD_TRITON_ENGINE =
  /\b(?:4\.6|5\.4|6\.8)\s*l?\b[^•]{0,15}\btriton\b|\btriton\s+v-?(?:8|10)\b/i;

/** "Ram Air" is an intake, not a truck. */
const RAM_AIR = /\bram\s*-?\s*air\b/i;

/**
 * A listing that says which market it is for is taken at its word. "(US
 * market)" keeps an ARB recovery point out of the Australian and UK Ranger
 * lists even though it names a Ranger. Only explicit statements count.
 */
const MARKET_STATEMENTS: { market: MarketKey; pattern: RegExp }[] = [
  { market: "usa", pattern: /\(\s*US[\s-]market\s*\)/i },
  { market: "australia", pattern: /\(\s*AUS?\s*\)/i },
];

const LANDCRUISER_70 = getVehiclePlatform("toyota-landcruiser-70-series");

export const MARKETS: Market[] = [
  {
    key: "usa",
    index: "01",
    name: "USA",
    tagline: "Trucks · Diesel · Performance",
    summary:
      "F-150, Super Duty, Silverado, Sierra and Ram trucks, the Power Stroke, Cummins, Duramax and LS engines inside them, and the muscle era: Camaro, Mustang, Chevelle, Firebird and more.",
    groups: [
      {
        label: "Trucks",
        vehicles: [
          { key: "f-150", make: "Ford", model: "F-150", include: [/\bf-?150\b/i] },
          {
            key: "super-duty",
            make: "Ford",
            model: "F-250 / F-350",
            include: [/\bf-?(?:250|350)\b/i, /\bsuper\s?duty\b/i],
          },
          {
            key: "silverado",
            make: "Chevrolet",
            model: "Silverado / GMC Sierra",
            include: [/\bsilverado\b/i, /\bsierra\b/i],
            exclude: [/\bford\s+sierra\b/i],
          },
          {
            // No separate make: "Ram 1500" is the name, and "1500" alone
            // would mean nothing where the model is printed without it.
            key: "ram-1500",
            model: "Ram 1500",
            include: [/\b(?:ram|dodge)\b[^•]{0,25}\b1500\b/i],
            exclude: [RAM_AIR, /\bpromaster\b/i, /\bsprinter\b/i],
          },
          {
            key: "ram-hd",
            model: "Ram 2500 / 3500",
            include: [/\b(?:ram|dodge)\b[^•]{0,25}\b(?:2500|3500)\b/i],
            exclude: [RAM_AIR, /\bpromaster\b/i, /\bsprinter\b/i],
          },
        ],
      },
      {
        label: "Engines",
        vehicles: [
          { key: "power-stroke", make: "Ford", model: "Power Stroke", include: [/\bpower\s?stroke\b/i] },
          { key: "cummins", model: "Cummins", include: [/\bcummins\b/i] },
          { key: "duramax", make: "GM", model: "Duramax", include: [/\bduramax\b/i] },
          {
            key: "ls-lt",
            make: "GM",
            model: "LS / LT",
            // Engine codes only. A bare "LS" is also a trim level and a
            // Lexus, and "LT" is a light-truck tyre size, so neither counts
            // without a code or the word that makes it an engine.
            include: [
              /\b(?:ls[1-7x]|lsa|lt[1-5]|l8[3-7t]|l9[2-9]|lq[49]|lm7|ly[56])\b/i,
              /\bls\s+(?:swaps?|engines?|motors?|v8s?|conversions?|based)\b/i,
              /\bgm\s+ls\b/i,
            ],
          },
        ],
      },
      {
        /*
         * MUSCLE & CLASSIC
         *
         * These platforms were in the catalogue all along and reachable by
         * nobody. 440 listings name one of them, and for several the only
         * place that is recorded is the manufacturer's structured application
         * table -- the Nova has no prose fitment mentioning it at all, and 69
         * of the 74 Skylark listings, 66 of the 80 Cutlass and 60 of the 90
         * GTO are structured-only. Before applicationMatchText() those were
         * invisible to every market page.
         *
         * Every entry below clears MIN_VEHICLE_LISTINGS by at least tenfold,
         * so nothing here is a chip opening onto a near-empty page. The gate
         * still applies: a platform that falls below three listings withdraws
         * itself, and none was added that the catalogue could not already
         * support.
         *
         * Nameplates are grouped only where the parts genuinely interchange
         * -- the GM A-bodies with their siblings, the C10 with the K5 Blazer
         * -- never to pad a count to clear the gate.
         */
        label: "Muscle & Classic",
        vehicles: [
          { key: "camaro", make: "Chevrolet", model: "Camaro", include: [/\bcamaro\b/i] },
          { key: "mustang", make: "Ford", model: "Mustang", include: [/\bmustang\b/i] },
          {
            key: "chevelle",
            make: "Chevrolet",
            model: "Chevelle / El Camino",
            include: [
              /\bchevelle\b/i,
              /\bel\s?camino\b/i,
              /\bmalibu\b/i,
              /\bmonte\s?carlo\b/i,
            ],
          },
          {
            key: "firebird",
            make: "Pontiac",
            model: "Firebird / Trans Am",
            include: [/\bfirebird\b/i, /\btrans\s?am\b/i],
          },
          {
            key: "gto",
            make: "Pontiac",
            model: "GTO / LeMans",
            // "GTO" alone is also a Mitsubishi and a Ferrari, so the make has
            // to be present for it to count.
            include: [
              /\bpontiac\s+gto\b/i,
              /\bgto\s+judge\b/i,
              /\blemans\b/i,
              /\bpontiac\s+tempest\b/i,
            ],
          },
          {
            key: "cutlass",
            make: "Oldsmobile",
            model: "Cutlass / 442",
            include: [/\bcutlass\b/i, /\boldsmobile\s+442\b/i],
          },
          {
            key: "skylark",
            make: "Buick",
            model: "Skylark / GS",
            include: [/\bskylark\b/i, /\bbuick\s+gran\s?sport\b/i],
          },
          {
            key: "nova",
            make: "Chevrolet",
            model: "Nova",
            // A bare "nova" is a supernova, a brand name and a font. The make
            // or the trim has to say it is the car.
            include: [/\bchev(?:rolet|y)\s+nova\b/i, /\bnova\s+ss\b/i],
          },
          { key: "corvette", make: "Chevrolet", model: "Corvette", include: [/\bcorvette\b/i] },
          {
            key: "impala",
            make: "Chevrolet",
            model: "Impala / Caprice",
            include: [/\bimpala\b/i, /\bcaprice\b/i, /\bbel\s?air\b/i],
          },
          {
            key: "c10",
            make: "Chevrolet",
            model: "C10 / K5 Blazer",
            // "C10" is also a battery size and a capacitor code, so it is
            // only the truck when the make or the body style says so.
            include: [
              /\bchev(?:rolet|y)\s+c-?10\b/i,
              /\bc-?10\s+(?:pickup|truck|suburban)\b/i,
              /\bk5\s+blazer\b/i,
            ],
          },
          {
            key: "charger",
            make: "Dodge",
            model: "Charger / Challenger",
            include: [
              /\bdodge\b[^•]{0,20}\b(?:charger|challenger|dart|coronet|super\s?bee)\b/i,
            ],
          },
        ],
      },
    ],
    categoryOrder: [
      "suspension",
      "engine",
      "turbocharger",
      "transmission",
      "brakes",
      "electronics",
      "bumper",
      "body-parts",
      "4x4-accessories",
      "lighting",
      "wheels-tires",
      "canopy",
      "interior",
      "aftermarket",
    ],
    seoTitle: "USA Truck, Diesel, Muscle & Performance Parts",
    seoDescription:
      "Parts for the Ford F-150 and Super Duty, Chevrolet Silverado, GMC Sierra and Ram, for Power Stroke, Cummins, Duramax and LS engines, and for the Camaro, Mustang, Chevelle, Firebird and Cutlass, each matched to the vehicle by its fitment.",
  },
  {
    key: "australia",
    index: "02",
    name: "Australia",
    tagline: "4WD · Utes · Touring",
    summary:
      "LandCruisers, Prados and Patrols, and the utes that do the work: HiLux, Ranger, D-Max, Triton and more.",
    groups: [
      {
        label: "4WDs",
        vehicles: [
          {
            key: "landcruiser",
            make: "Toyota",
            model: "LandCruiser",
            // The 70 Series hub's own patterns, plus every other
            // LandCruiser. The Prado has its own entry.
            include: [/\bland\s?cruiser\b/i, ...(LANDCRUISER_70?.include ?? [])],
            exclude: [/\bprado\b/i],
          },
          { key: "prado", make: "Toyota", model: "Prado", include: [/\bprado\b/i] },
          { key: "patrol", make: "Nissan", model: "Patrol", include: [/\bpatrol\b/i] },
        ],
      },
      {
        label: "Utes",
        vehicles: [
          fromHub("ranger", "ford-ranger-4x4", "Ford", "Ranger", [US_COMPACT_RANGER]),
          fromHub("hilux", "toyota-hilux-4x4", "Toyota", "HiLux"),
          fromHub("d-max", "isuzu-d-max-4x4", "Isuzu", "D-Max"),
          fromHub("triton", "mitsubishi-triton-4x4", "Mitsubishi", "Triton", [FORD_TRITON_ENGINE]),
          fromHub("bt-50", "mazda-bt-50-4x4", "Mazda", "BT-50"),
          fromHub("navara", "nissan-navara-4x4", "Nissan", "Navara"),
          fromHub("amarok", "volkswagen-amarok-4x4", "Volkswagen", "Amarok"),
        ],
      },
    ],
    categoryOrder: [
      "suspension",
      "bumper",
      "4x4-accessories",
      "canopy",
      "lighting",
      "wheels-tires",
      "engine",
      "transmission",
      "turbocharger",
      "brakes",
      "electronics",
      "body-parts",
      "interior",
      "aftermarket",
    ],
    seoTitle: "4WD, Ute & Touring Parts for Australia",
    seoDescription:
      "Parts for the Toyota LandCruiser, Prado and HiLux, Nissan Patrol, Ford Ranger, Isuzu D-Max and Mitsubishi Triton: bull bars, suspension, canopies and 4x4 accessories, each matched to the vehicle by its fitment.",
  },
  {
    key: "uk",
    index: "03",
    name: "UK",
    tagline: "4x4 · Performance · European",
    summary:
      "Hilux, Land Cruiser, Patrol, Navara and Ranger 4x4s, and European performance for BMW, Mercedes-Benz and Audi.",
    groups: [
      {
        label: "4x4s",
        vehicles: [
          {
            key: "defender",
            make: "Land Rover",
            model: "Defender",
            // "Defender" alone is also a canopy and a Michelin tyre.
            include: [
              /\bland\s?rover\b[^•]{0,20}\bdefender\b/i,
              /\bdefender\s+(?:90|110|130)\b/i,
            ],
          },
          {
            key: "range-rover",
            make: "Land Rover",
            model: "Range Rover",
            include: [/\brange\s?rover\b/i],
          },
          {
            key: "discovery",
            make: "Land Rover",
            model: "Discovery",
            include: [
              /\bland\s?rover\b[^•]{0,20}\bdiscovery\b/i,
              /\bdiscovery\s+(?:[1-5]|sport)\b/i,
            ],
          },
          fromHub("hilux", "toyota-hilux-4x4", "Toyota", "Hilux"),
          {
            key: "land-cruiser",
            make: "Toyota",
            model: "Land Cruiser",
            // Sold in the UK as the Land Cruiser, so the Prado is included.
            include: [
              /\bland\s?cruiser\b/i,
              /\bprado\b/i,
              ...(LANDCRUISER_70?.include ?? []),
            ],
          },
          { key: "patrol", make: "Nissan", model: "Patrol", include: [/\bpatrol\b/i] },
          fromHub("navara", "nissan-navara-4x4", "Nissan", "Navara"),
          fromHub("ranger", "ford-ranger-4x4", "Ford", "Ranger", [US_COMPACT_RANGER]),
          fromHub("amarok", "volkswagen-amarok-4x4", "Volkswagen", "Amarok"),
        ],
      },
      {
        label: "European",
        vehicles: [
          { key: "bmw", model: "BMW", include: [/\bbmw\b/i] },
          { key: "mercedes-benz", model: "Mercedes-Benz", include: [/\bmercedes\b/i] },
          { key: "audi", model: "Audi", include: [/\baudi\b/i] },
        ],
      },
    ],
    categoryOrder: [
      "suspension",
      "4x4-accessories",
      "brakes",
      "turbocharger",
      "engine",
      "transmission",
      "lighting",
      "wheels-tires",
      "body-parts",
      "bumper",
      "canopy",
      "electronics",
      "interior",
      "aftermarket",
    ],
    seoTitle: "4x4 & European Performance Parts for the UK",
    seoDescription:
      "Parts for the Toyota Hilux and Land Cruiser, Nissan Patrol and Navara and Ford Ranger, and European performance parts for BMW, Mercedes-Benz and Audi, each matched to the vehicle by its fitment.",
  },
  {
    key: "worldwide",
    index: "04",
    name: "Worldwide",
    tagline: "Parts · Performance · Builds",
    summary:
      "Every listing in the catalog, organised by system: engines to lighting, for builds anywhere we ship.",
    groups: [],
    categoryOrder: [
      "engine",
      "transmission",
      "turbocharger",
      "suspension",
      "brakes",
      "electronics",
      "lighting",
      "wheels-tires",
      "4x4-accessories",
      "aftermarket",
      "body-parts",
      "bumper",
      "canopy",
      "interior",
    ],
    seoTitle: "Engines, Turbos, Suspension & More, Shipped Worldwide",
    seoDescription:
      "The complete DrivoraParts catalog by system: engines, transmissions, turbochargers, suspension, brakes, electronics, lighting, wheels and 4x4 accessories, shipped worldwide.",
  },
];

export function getMarket(key: string | undefined): Market | undefined {
  return key ? MARKETS.find((market) => market.key === key) : undefined;
}

function marketVehicles(market: Market): MarketVehicle[] {
  return market.groups.flatMap((group) => group.vehicles);
}

function statedMarket(text: string): MarketKey | null {
  return MARKET_STATEMENTS.find(({ pattern }) => pattern.test(text))?.market ?? null;
}

/* ---------- Scopes ---------- */

type MarketScopeIndex = {
  all: Set<number>;
  byVehicle: Map<string, Set<number>>;
};

// The catalog is a bundled array that cannot change within an isolate, so
// each regional market is matched once, on first use, and only if asked for.
const scopeCache = new Map<MarketKey, MarketScopeIndex>();

function scopeIndex(market: Market): MarketScopeIndex {
  const cached = scopeCache.get(market.key);
  if (cached) return cached;

  const vehicles = marketVehicles(market);
  const index: MarketScopeIndex = {
    all: new Set(),
    byVehicle: new Map(vehicles.map((vehicle) => [vehicle.key, new Set<number>()])),
  };

  for (const product of getAllProducts()) {
    const text = fitmentMatchText(product);
    const stated = statedMarket(text);
    if (stated && stated !== market.key) continue;

    // Two sources of evidence, the same patterns over both. The prose comes
    // first because it is what 83% of the catalogue records; the
    // manufacturer's structured application table is checked when the prose
    // does not settle it. This is additive by construction -- a listing that
    // matched before still matches, because the first test is unchanged.
    const applications = applicationMatchText(product);

    for (const vehicle of vehicles) {
      const matched =
        matchesFitmentPatterns(text, vehicle.include, vehicle.exclude) ||
        (applications.length > 0 &&
          matchesFitmentPatterns(applications, vehicle.include, vehicle.exclude));

      if (matched) {
        index.byVehicle.get(vehicle.key)?.add(product.id);
        index.all.add(product.id);
      }
    }
  }

  scopeCache.set(market.key, index);
  return index;
}

/**
 * The product ids a market view is limited to, or null for no limit.
 *
 * Null for Worldwide (it IS the whole catalog) and for any key that is not a
 * market, so a mistyped ?market= widens to everything rather than showing an
 * empty page. An unknown vehicle falls back to the whole market for the same
 * reason.
 */
export function marketScope(
  marketKey?: string,
  vehicleKey?: string
): Set<number> | null {
  const market = getMarket(marketKey);
  if (!market || market.groups.length === 0) return null;

  const index = scopeIndex(market);
  return (vehicleKey && index.byVehicle.get(vehicleKey)) || index.all;
}

/* ---------- What a market page shows ---------- */

export type MarketVehicleCount = { vehicle: MarketVehicle; count: number };

export type MarketOverview = {
  market: Market;
  /** Listings in the market, or in the selected vehicle when there is one. */
  total: number;
  /** Listings across the whole market, whatever is selected. */
  marketTotal: number;
  /** The selected vehicle, only if it is one this market actually offers. */
  vehicle?: MarketVehicle;
  /** Groups with the vehicles that clear MIN_VEHICLE_LISTINGS. Empty groups dropped. */
  groups: { label: string; vehicles: MarketVehicleCount[] }[];
  /** Categories with listings in the current scope, in the market's order. */
  categories: { slug: string; name: string; count: number }[];
};

function orderedCategories(market: Market) {
  const rank = new Map(market.categoryOrder.map((slug, i) => [slug, i]));
  // Anything added to categories.ts later still appears, after the ones
  // this market ranks.
  return [...categories].sort(
    (a, b) => (rank.get(a.slug) ?? Infinity) - (rank.get(b.slug) ?? Infinity)
  );
}

export function getMarketOverview(
  market: Market,
  vehicleKey?: string
): MarketOverview {
  const all = getAllProducts();

  if (market.groups.length === 0) {
    const counts = new Map<string, number>();
    for (const product of all) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return {
      market,
      total: all.length,
      marketTotal: all.length,
      groups: [],
      categories: orderedCategories(market)
        .map((c) => ({ slug: c.slug, name: c.name, count: counts.get(c.slug) ?? 0 }))
        .filter((c) => c.count > 0),
    };
  }

  const index = scopeIndex(market);

  const groups = market.groups
    .map((group) => ({
      label: group.label,
      vehicles: group.vehicles
        .map((vehicle) => ({
          vehicle,
          count: index.byVehicle.get(vehicle.key)?.size ?? 0,
        }))
        .filter(({ count }) => count >= MIN_VEHICLE_LISTINGS),
    }))
    .filter((group) => group.vehicles.length > 0);

  const vehicle = groups
    .flatMap((group) => group.vehicles)
    .find(({ vehicle }) => vehicle.key === vehicleKey)?.vehicle;

  const scope = (vehicle && index.byVehicle.get(vehicle.key)) || index.all;
  const counts = new Map<string, number>();
  for (const product of all) {
    if (!scope.has(product.id)) continue;
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }

  return {
    market,
    total: scope.size,
    marketTotal: index.all.size,
    vehicle,
    groups,
    categories: orderedCategories(market)
      .map((c) => ({ slug: c.slug, name: c.name, count: counts.get(c.slug) ?? 0 }))
      .filter((c) => c.count > 0),
  };
}

/** "Ford F-150", "Cummins", "BMW": make and model as one line. */
export function vehicleLabel(vehicle: MarketVehicle): string {
  return vehicle.make ? `${vehicle.make} ${vehicle.model}` : vehicle.model;
}
