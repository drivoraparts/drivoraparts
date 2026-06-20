/* =========================================================
   DRIVORAPARTS — PRODUCTS (SINGLE SOURCE OF TRUTH)
   ---------------------------------------------------------
   All products normalized to canonical slugs:
   - `category` references a categories.ts slug
   - `brand` references a brands.ts slug
   Empty categories simply have no products here; query
   helpers return [] for them (never throw / never break UI).
========================================================= */

import type { Product } from "./types";
import { aftermarketProducts } from "./aftermarket-products";

export const products: Product[] = [
  {
    id: 1,
    name: "BMW N54 Twin Turbo Engine",
    category: "engine",
    brand: "bmw",
    platform: "bmw-n54-twin-turbo",
    price: 3200,
    stock: true,
    condition: "Used - Refurbished",
    location: "USA Warehouse",
    thumbnail: "/engines/engine-1.jpg",
    images: [
      "/engines/engine-1.jpg",
      "/engines/engine-2.jpg",
      "/engines/engine-3.jpg",
    ],
    description:
      "High-performance BMW N54 twin turbo engine fully tested and rebuilt for maximum power output.",
  },
  {
    id: 2,
    name: "Garrett GTX3076R Turbocharger",
    category: "turbocharger",
    brand: "garrett",
    price: 850,
    stock: true,
    condition: "New",
    location: "UK Warehouse",
    thumbnail: "/turbochargers/turbo-1.jpg",
    images: ["/turbochargers/turbo-1.jpg", "/turbochargers/turbo-2.jpg"],
    description:
      "Premium Garrett turbocharger designed for extreme boost performance and reliability.",
  },
  {
    id: 33,
    name: "BMW B58 TwinPower Turbo 3.0-Liter Engine",
    category: "engine",
    brand: "bmw",
    platform: "bmw-b58-twinpower",
    price: 5999,
    stock: true,
    condition: "Used - Tested (OEM Refurbished)",
    location: "USA Warehouse",
    thumbnail: "/engine/bmw/b58/1.jpg",
    images: [
      "/engine/bmw/b58/1.jpg",
      "/engine/bmw/b58/2.jpg",
      "/engine/bmw/b58/3.jpg",
      "/engine/bmw/b58/4.jpg",
      "/engine/bmw/b58/5.jpg",
      "/engine/bmw/b58/6.jpg",
      "/engine/bmw/b58/7.jpg",
      "/engine/bmw/b58/8.jpg",
      "/engine/bmw/b58/9.jpg",
      "/engine/bmw/b58/10.jpg",
    ],
    description:
      "BMW B58 is a 3.0-liter turbocharged inline-six engine from BMW's modular engine family. It delivers a balance of performance, efficiency, and tuning potential and is widely used in modern BMW performance models.",
  },
  ...aftermarketProducts,
];
