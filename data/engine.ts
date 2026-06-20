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
      { name: "Toyota 2JZ-GTE" },
      { name: "Toyota 1JZ-GTE" },
      { name: "Toyota 1UZ-FE V8" },
      { name: "Nissan RB26DETT (Skyline GTR)" },
      { name: "Nissan SR20DET" },
      { name: "Honda K20A / K24" },
      { name: "Honda B18C Type R" },
      { name: "Mazda 13B Rotary" },
    ],
  },
  {
    slug: "bmw-engines",
    title: "BMW Engines",
    platforms: [
      { name: "BMW N54 Twin Turbo" },
      { name: "BMW N55 Turbo Engine" },
      { name: "BMW B58 TwinPower Turbo", slug: "bmw-b58-twinpower" },
      { name: "BMW S55" },
      { name: "BMW S58" },
      { name: "BMW M57 Diesel" },
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
