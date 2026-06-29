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

  // Electronics
  { slug: "aem", name: "AEM", category: "electronics" },
  { slug: "cobb", name: "COBB Tuning", category: "electronics" },
  { slug: "haltech", name: "Haltech", category: "electronics" },
  { slug: "hp-tuners", name: "HP Tuners", category: "electronics" },
  { slug: "msd", name: "MSD", category: "electronics" },
  { slug: "universal", name: "Universal", category: "electronics" },

  // Lighting
  { slug: "alpharex", name: "AlphaRex", category: "lighting" },
  { slug: "baja-designs", name: "Baja Designs", category: "lighting" },
  { slug: "diode-dynamics", name: "Diode Dynamics", category: "lighting" },
  { slug: "govee", name: "Govee", category: "lighting" },
  { slug: "morimoto", name: "Morimoto", category: "lighting" },
  { slug: "opt7", name: "OPT7", category: "lighting" },
  { slug: "oracle", name: "Oracle Lighting", category: "lighting" },
  { slug: "osram", name: "Osram", category: "lighting" },
  { slug: "philips", name: "Philips", category: "lighting" },
  { slug: "rigid-industries", name: "Rigid Industries", category: "lighting" },
  { slug: "xk-glow", name: "XK Glow", category: "lighting" },
  { slug: "universal", name: "Universal", category: "lighting" },

  // Body Parts
  { slug: "bmw", name: "BMW", category: "body-parts" },
  { slug: "ford", name: "Ford", category: "body-parts" },
  { slug: "honda", name: "Honda", category: "body-parts" },
  { slug: "nissan", name: "Nissan", category: "body-parts" },
  { slug: "subaru", name: "Subaru", category: "body-parts" },
  { slug: "toyota", name: "Toyota", category: "body-parts" },
  { slug: "universal", name: "Universal", category: "body-parts" },

  // Interior
  { slug: "ford", name: "Ford", category: "interior" },
  { slug: "honda", name: "Honda", category: "interior" },
  { slug: "nissan", name: "Nissan", category: "interior" },
  { slug: "subaru", name: "Subaru", category: "interior" },
  { slug: "toyota", name: "Toyota", category: "interior" },
  { slug: "volkswagen", name: "Volkswagen", category: "interior" },

  // Aftermarket
  { slug: "ford", name: "Ford", category: "aftermarket" },
  { slug: "arb", name: "ARB", category: "aftermarket" },
  { slug: "bilstein", name: "Bilstein", category: "aftermarket" },
  { slug: "leer", name: "Leer", category: "aftermarket" },
  { slug: "snugtop", name: "Snugtop", category: "aftermarket" },
  { slug: "universal", name: "Universal", category: "aftermarket" },
  { slug: "toyota", name: "Toyota", category: "aftermarket" },
  { slug: "honda", name: "Honda", category: "aftermarket" },
  { slug: "bmw", name: "BMW", category: "aftermarket" },
  { slug: "mercedes-benz", name: "Mercedes-Benz", category: "aftermarket" },
  { slug: "audi", name: "Audi", category: "aftermarket" },
  { slug: "chevrolet", name: "Chevrolet", category: "aftermarket" },
  { slug: "nissan", name: "Nissan", category: "aftermarket" },
  { slug: "lexus", name: "Lexus", category: "aftermarket" },
  { slug: "jeep", name: "Jeep", category: "aftermarket" },
];
