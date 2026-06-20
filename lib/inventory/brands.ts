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

  // Turbocharger
  { slug: "garrett", name: "Garrett", category: "turbocharger" },
  { slug: "borgwarner", name: "BorgWarner", category: "turbocharger" },
  { slug: "precision", name: "Precision", category: "turbocharger" },

  // Brakes
  { slug: "brembo-gt-kits", name: "Brembo GT Kits", category: "brakes" },
  { slug: "wilwood-big-brake-kits", name: "Wilwood Big Brake Kits", category: "brakes" },
  { slug: "ebc-rotors-pads", name: "EBC Rotors & Pads", category: "brakes" },
  { slug: "ate-oem-kits", name: "ATE OEM Kits", category: "brakes" },

  // Aftermarket
  { slug: "toyota", name: "Toyota", category: "aftermarket" },
  { slug: "denso", name: "Denso", category: "aftermarket" },
  { slug: "bosch", name: "Bosch", category: "aftermarket" },
  { slug: "acdelco", name: "ACDelco", category: "aftermarket" },
];
