/* =========================================================
   DRIVORAPARTS — BRANDS (SINGLE SOURCE OF TRUTH)
   ---------------------------------------------------------
   Brands are grouped by category slug. Each brand `slug` is
   the kebab-case form of its `name` so it resolves cleanly
   in /catalog/[category]/[brand] routes.
========================================================= */

import type { Brand } from "./types";

export const brands: Brand[] = [
  // Engine
  { slug: "bmw", name: "BMW", category: "engine" },
  { slug: "toyota", name: "Toyota", category: "engine" },
  { slug: "nissan", name: "Nissan", category: "engine" },
  { slug: "honda", name: "Honda", category: "engine" },
  { slug: "mazda", name: "Mazda", category: "engine" },

  // Engine — Turbo / Performance Systems
  { slug: "garrett", name: "Garrett", category: "engine" },
  { slug: "borgwarner", name: "BorgWarner", category: "engine" },
  { slug: "precision", name: "Precision", category: "engine" },
  { slug: "hks", name: "HKS", category: "engine" },
  { slug: "turbosmart", name: "Turbosmart", category: "engine" },

  // Turbocharger
  { slug: "garrett", name: "Garrett", category: "turbocharger" },
  { slug: "borgwarner", name: "BorgWarner", category: "turbocharger" },
  { slug: "precision", name: "Precision", category: "turbocharger" },
  { slug: "audi", name: "Audi", category: "turbocharger" },
  { slug: "bmw", name: "BMW", category: "turbocharger" },
  { slug: "universal", name: "Universal", category: "turbocharger" },

  // Transmission
  { slug: "zf", name: "ZF", category: "transmission" },
  { slug: "gm", name: "GM", category: "transmission" },
  { slug: "ford", name: "Ford", category: "transmission" },
  { slug: "tremec", name: "Tremec", category: "transmission" },
  { slug: "nissan", name: "Nissan", category: "transmission" },
  { slug: "toyota", name: "Toyota", category: "transmission" },
  { slug: "mercedes-benz", name: "Mercedes-Benz", category: "transmission" },
  { slug: "audi", name: "Audi", category: "transmission" },
  { slug: "universal", name: "Universal", category: "transmission" },

  // Brakes
  { slug: "brembo-gt-kits", name: "Brembo GT Kits", category: "brakes" },
  { slug: "brembo-oem", name: "Brembo OEM", category: "brakes" },
  { slug: "wilwood-big-brake-kits", name: "Wilwood Big Brake Kits", category: "brakes" },
  { slug: "ebc-rotors-pads", name: "EBC Rotors & Pads", category: "brakes" },
  { slug: "ate-oem-kits", name: "ATE OEM Kits", category: "brakes" },

  // Suspension
  { slug: "whiteline", name: "Whiteline", category: "suspension" },
  { slug: "air-lift-performance", name: "Air Lift Performance", category: "suspension" },
  { slug: "bc-racing", name: "BC Racing", category: "suspension" },
  { slug: "bilstein", name: "Bilstein", category: "suspension" },
  { slug: "eibach", name: "Eibach", category: "suspension" },
  { slug: "fortune-auto", name: "Fortune Auto", category: "suspension" },
  { slug: "kw-suspension", name: "KW Suspension", category: "suspension" },
  { slug: "tein", name: "Tein", category: "suspension" },
  { slug: "universal", name: "Universal", category: "suspension" },

  // Aftermarket (vehicle brands)
  { slug: "toyota", name: "Toyota", category: "aftermarket" },
  { slug: "honda", name: "Honda", category: "aftermarket" },
  { slug: "bmw", name: "BMW", category: "aftermarket" },
  { slug: "mercedes-benz", name: "Mercedes-Benz", category: "aftermarket" },
  { slug: "audi", name: "Audi", category: "aftermarket" },
  { slug: "ford", name: "Ford", category: "aftermarket" },
  { slug: "chevrolet", name: "Chevrolet", category: "aftermarket" },
  { slug: "nissan", name: "Nissan", category: "aftermarket" },
  { slug: "lexus", name: "Lexus", category: "aftermarket" },
  { slug: "jeep", name: "Jeep", category: "aftermarket" },
];
