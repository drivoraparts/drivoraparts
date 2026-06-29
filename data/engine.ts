/* =========================================================
   DRIVORAPARTS — ENGINE SYSTEM (SYSTEM B, SPECIAL CASE)
   ---------------------------------------------------------
   Engine NEVER uses the brand-based structure.
   Full hierarchy:  Engine -> Groups -> Platforms -> Products

   COLOR: unified red/white brand system. Groups differ in
   STRUCTURE/DEPTH only — never in color.
========================================================= */

import { slugify } from "./store";

export type EnginePlatform = {
  name: string;
  /** Optional URL slug when slugify(name) does not match product.platform */
  slug?: string;
};

export type EngineGroup = {
  slug: string;
  title: string;
  platforms: EnginePlatform[];
};

export const engineTree: EngineGroup[] = [
  {
    slug: "japanese-legends",
    title: "Japanese Legends",
    platforms: [
      { name: "Toyota 2JZ-GTE", slug: "toyota-2jz-gte-supra" },
      { name: "Toyota 1JZ-GTE", slug: "toyota-1jz-gte" },
      { name: "Toyota 1UZ-FE V8", slug: "toyota-1uz-fe-v8" },
      { name: "Nissan RB26DETT (Skyline GTR)", slug: "rb26dett" },
      { name: "Nissan SR20DET", slug: "sr20det" },
      { name: "Honda K20 Performance Engine", slug: "honda-k20" },
      { name: "Honda K24 Performance Engine", slug: "honda-k24" },
      { name: "Honda B18C Type R", slug: "honda-b18c-type-r" },
      { name: "Mazda 13B Rotary" },
    ],
  },
  {
    slug: "bmw-engines",
    title: "BMW Engines",
    platforms: [
      { name: "BMW N54 Twin Turbo", slug: "bmw-n54-twin-turbo" },
      { name: "BMW N55 Turbo Engine", slug: "bmw-n55" },
      { name: "BMW B58 TwinPower Turbo", slug: "bmw-b58-twinpower" },
      { name: "BMW S55", slug: "bmw-s55" },
      { name: "BMW S58", slug: "bmw-s58" },
      { name: "BMW M57 Diesel", slug: "bmw-m57" },
      { name: "BMW N63 V8" },
    ],
  },
  {
    slug: "american-v8",
    title: "American V8 / Swap Engines",
    platforms: [
      { name: "LS3" },
      { name: "LS7" },
      { name: "LT1 / LT4" },
      { name: "Ford Coyote 5.0" },
      { name: "Dodge Hellcat 6.2" },
      { name: "GM LS / LSA Drivetrains", slug: "gm-ls-drivetrains" },
    ],
  },
  {
    slug: "gm-gen-v-swap",
    title: "GM Gen V Swap Engines",
    platforms: [
      { name: "GM L83 5.3", slug: "gm-l83" },
      { name: "GM L84 5.3", slug: "gm-l84" },
      { name: "GM L86 6.2", slug: "gm-l86" },
      { name: "GM LV3 4.3", slug: "gm-lv3" },
      { name: "GM Duramax 6.6", slug: "gm-duramax-6-6" },
      { name: "GM Gen V Packages", slug: "gm-gen-v-packages" },
      { name: "GM LT Performance Packages", slug: "gm-lt-packages" },
    ],
  },
  {
    slug: "ford-swap-packages",
    title: "Ford Swap Packages",
    platforms: [
      { name: "Ford Gen 2 Coyote", slug: "ford-coyote-gen2" },
      { name: "Ford Gen 3 Coyote Drivetrain", slug: "ford-coyote-gen3-drivetrain" },
      { name: "Ford 3.5L EcoBoost", slug: "ford-ecoboost-3-5" },
      { name: "Ford Powerstroke 6.7", slug: "ford-powerstroke-6-7" },
      { name: "Ford Coyote Performance Packages", slug: "ford-coyote-packages" },
    ],
  },
  {
    slug: "euro-performance",
    title: "Euro Performance Engines",
    platforms: [
      { name: "Mercedes M113" },
      { name: "Mercedes M157 AMG" },
      { name: "Audi 2.0 TFSI EA888" },
      { name: "Audi 4.0 TFSI V8" },
      { name: "VW VR6" },
    ],
  },
  {
    slug: "turbo-performance",
    title: "Turbo / Performance Systems",
    platforms: [
      { name: "GTX3076R Turbo Kit" },
      { name: "GTX3582R Kit" },
      { name: "BorgWarner EFR" },
      { name: "Precision 6266" },
      { name: "Complete Turbo Kit" },
      { name: "Hybrid Turbo Kits" },
      { name: "Intercoolers" },
      { name: "Blow-off Valves" },
      { name: "Wastegates" },
      { name: "Intakes" },
      { name: "Exhaust Systems" },
    ],
  },
];

export function getPlatformSlug(platform: EnginePlatform): string {
  return platform.slug ?? slugify(platform.name);
}

/** Resolve a platform (and its parent group) by URL slug. */
export function getEnginePlatform(
  platformSlug: string
): { platform: EnginePlatform; group: EngineGroup } | undefined {
  for (const group of engineTree) {
    const platform = group.platforms.find(
      (p) => getPlatformSlug(p) === platformSlug
    );
    if (platform) return { platform, group };
  }
  return undefined;
}
