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
    id: 3,
    name: "Toyota OEM Alternator",
    category: "aftermarket",
    brand: "toyota",
    price: 189,
    stock: true,
    condition: "New",
    location: "USA Warehouse",
    createdAt: 1718841600000,
    description:
      "Genuine-spec Toyota alternator for reliable charging across daily and performance builds.",
  },
  {
    id: 4,
    name: "Toyota Remanufactured Starter",
    category: "aftermarket",
    brand: "toyota",
    price: 145,
    stock: true,
    condition: "Remanufactured",
    location: "USA Warehouse",
    createdAt: 1719446400000,
    description:
      "Remanufactured Toyota starter motor tested for consistent crank performance.",
  },
  {
    id: 5,
    name: "Denso High-Output Alternator",
    category: "aftermarket",
    brand: "denso",
    price: 220,
    stock: true,
    condition: "New",
    location: "USA Warehouse",
    createdAt: 1720051200000,
    description:
      "Denso high-output alternator built for upgraded electrical loads and track use.",
  },
  {
    id: 6,
    name: "Bosch Fuel Pump Assembly",
    category: "aftermarket",
    brand: "bosch",
    price: 95,
    stock: false,
    condition: "New",
    location: "UK Warehouse",
    createdAt: 1720656000000,
    description:
      "Bosch in-tank fuel pump assembly for dependable fuel delivery under load.",
  },
  {
    id: 7,
    name: "ACDelco Professional Alternator",
    category: "aftermarket",
    brand: "acdelco",
    price: 175,
    stock: true,
    condition: "New",
    location: "USA Warehouse",
    createdAt: 1721260800000,
    description:
      "ACDelco professional-grade alternator for OEM-fit replacement applications.",
  },
];
