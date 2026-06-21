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
    price: 5999,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/catalog/engine/bmw/n54/1.jpeg",
    images: [
      "/catalog/engine/bmw/n54/1.jpeg",
      "/catalog/engine/bmw/n54/2.webp",
      "/catalog/engine/bmw/n54/3.webp",
    ],
    description: `BMW N54 Twin Turbo Engine

The BMW N54 Twin Turbo is one of BMW's most legendary turbocharged inline-six engines, renowned for its exceptional tuning potential, twin-turbo performance, and strong aftermarket support.

The BMW N54 Twin Turbo engine delivers an ideal balance of power, reliability, and tuning capability. Featuring a factory twin-turbocharged configuration, direct fuel injection, and a robust inline-six design, the N54 has become a favorite among enthusiasts seeking substantial horsepower gains. Whether for a replacement engine, restoration project, or high-performance build, the N54 remains one of BMW's most sought-after powerplants.

Specifications
• Engine Code: N54
• Configuration: Inline-6
• Aspiration: Twin Turbocharged
• Fuel System: Direct Injection
• Factory Power: 300-335 HP
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: BMW

Highlights
• Genuine BMW Performance Engine
• Twin Turbocharged Power Delivery
• Massive Aftermarket Support
• Proven High Horsepower Capability
• Enthusiast Favorite Platform

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 2,
    name: "Garrett GTX3076R Turbocharger",
    category: "turbocharger",
    brand: "garrett",
    price: 850,
    stock: true,
    condition: "brand-new",
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
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/catalog/engine/bmw/b58/1.jpg",
    images: [
      "/catalog/engine/bmw/b58/1.jpg",
      "/catalog/engine/bmw/b58/2.jpg",
      "/catalog/engine/bmw/b58/3.jpg",
      "/catalog/engine/bmw/b58/4.jpg",
      "/catalog/engine/bmw/b58/5.jpg",
      "/catalog/engine/bmw/b58/6.jpg",
      "/catalog/engine/bmw/b58/7.jpg",
      "/catalog/engine/bmw/b58/8.jpg",
      "/catalog/engine/bmw/b58/9.jpg",
      "/catalog/engine/bmw/b58/10.jpg",
    ],
    description: `BMW B58 TwinPower Turbo 3.0-Liter Inline-Six Engine

The BMW B58 is a 3.0-liter turbocharged inline-six engine developed as part of BMW's advanced modular engine platform. Designed for exceptional reliability, efficiency, and performance, the B58 incorporates a closed-deck aluminum block, integrated intercooling system, direct fuel injection, and BMW TwinPower Turbo technology.

Recognized throughout the automotive industry for its durability and tuning potential, the B58 powers a wide range of modern BMW performance vehicles and remains one of the most respected turbocharged inline-six engines available. Its proven architecture makes it suitable for OEM replacement, restoration projects, professional workshops, and high-performance applications.

Key Features
• 3.0L Inline-Six Configuration
• BMW TwinPower Turbo System
• Direct Fuel Injection
• Closed-Deck Engine Block
• OEM Reliability Standards
• Strong Aftermarket Support
• High Performance Capability
• Suitable For Replacement And Performance Builds`,
  },
  {
    id: 34,
    name: "Toyota 2JZ-GTE (Supra)",
    category: "engine",
    brand: "toyota",
    platform: "toyota-2jz-gte-supra",
    price: 8499,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/catalog/engine/japanese-legends/2jz-gte/1.jpg",
    images: [
      "/catalog/engine/japanese-legends/2jz-gte/1.jpg",
      "/catalog/engine/japanese-legends/2jz-gte/2.jpg",
      "/catalog/engine/japanese-legends/2jz-gte/3.jpg",
    ],
    description: `Toyota 2JZ-GTE (Supra)

The legendary Toyota 2JZ-GTE is widely regarded as one of the strongest and most tunable performance engines ever produced.

Built to legendary standards, the Toyota 2JZ-GTE features an iron block construction, factory twin turbochargers, and exceptional durability. Known globally through the Toyota Supra platform, this engine has become the benchmark for high-horsepower builds. From street performance to motorsports applications, the 2JZ-GTE continues to dominate the performance world.

Specifications
• Engine Code: 2JZ-GTE
• Configuration: Inline-6
• Aspiration: Twin Turbocharged
• Fuel System: Electronic Fuel Injection
• Factory Power: 276-320 HP
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Toyota

Highlights
• Legendary Supra Engine
• Twin Turbocharged Performance
• Iron Block Construction
• Massive Horsepower Potential
• Worldwide Tuning Support

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 35,
    name: "Toyota 1JZ-GTE",
    category: "engine",
    brand: "toyota",
    platform: "toyota-1jz-gte",
    price: 6499,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/catalog/engine/japanese-legends/1jz-gte/1.jpg",
    images: [
      "/catalog/engine/japanese-legends/1jz-gte/1.jpg",
      "/catalog/engine/japanese-legends/1jz-gte/2.jpg",
    ],
    description: `Toyota 1JZ-GTE

The Toyota 1JZ-GTE is a legendary Japanese performance engine known for its smooth power delivery, reliability, and tuning capabilities.

The 1JZ-GTE combines Toyota engineering excellence with proven turbocharged performance. Built with a durable inline-six architecture and a strong aftermarket ecosystem, it remains one of the most respected JDM engines ever produced. Perfect for performance enthusiasts, restorations, and custom builds.

Specifications
• Engine Code: 1JZ-GTE
• Configuration: Inline-6
• Aspiration: Turbocharged
• Fuel System: Electronic Fuel Injection
• Factory Power: 276-280 HP
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Toyota

Highlights
• Legendary JDM Powerplant
• Smooth Inline-Six Performance
• Proven Reliability
• Excellent Tuning Potential
• Motorsport Heritage

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 36,
    name: "Toyota 1UZ-FE V8 Engine",
    category: "engine",
    brand: "toyota",
    platform: "toyota-1uz-fe-v8",
    price: 4999,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/catalog/engine/japanese-legends/1uz-fe/1.jpeg",
    images: [
      "/catalog/engine/japanese-legends/1uz-fe/1.jpeg",
      "/catalog/engine/japanese-legends/1uz-fe/2.jpeg",
      "/catalog/engine/japanese-legends/1uz-fe/3.jpeg",
    ],
    description: `Toyota 1UZ-FE V8 Engine

The Toyota 1UZ-FE V8 is a legendary luxury performance engine known for extreme reliability, smooth V8 power delivery, and long-lasting durability.

The Toyota 1UZ-FE V8 engine is one of Toyota's most durable and refined V8 powerplants ever produced. Originally designed for Lexus flagship models, it combines smooth operation with strong performance capability. Built with an aluminum block, forged internals, and precision engineering, the 1UZ-FE is widely respected for its ability to handle high mileage and performance tuning applications. Ideal for swaps, restorations, and performance builds.

Specifications
• Engine Code: 1UZ-FE
• Configuration: V8
• Aspiration: Naturally Aspirated
• Fuel System: Electronic Fuel Injection
• Factory Power: ~260 HP
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Toyota

Highlights
• Ultra Reliable V8 Platform
• Smooth Luxury Performance Engine
• Strong Swap Candidate
• Long-Term Durability
• Toyota Engineering Excellence

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 37,
    name: "BMW N55 Turbo Engine",
    category: "engine",
    brand: "bmw",
    platform: "bmw-n55",
    price: 5299,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/catalog/engine/bmw/n55/1.jpeg",
    images: [
      "/catalog/engine/bmw/n55/1.jpeg",
      "/catalog/engine/bmw/n55/2.webp",
      "/catalog/engine/bmw/n55/3.jpeg",
    ],
    description: `BMW N55 Turbo Engine

The BMW N55 Turbo Engine is a refined single-turbo inline-six engine offering smooth power delivery, efficiency, and modern BMW performance engineering.

The BMW N55 Turbo Engine is the successor to the N54, featuring a single twin-scroll turbocharger design for improved efficiency and responsiveness. It delivers smooth power delivery, reduced lag, and strong tuning potential. Widely used across BMW's performance lineup, the N55 is known for reliability improvements over its predecessor while maintaining excellent aftermarket support.

Specifications
• Engine Code: N55
• Configuration: Inline-6
• Aspiration: Single Twin-Scroll Turbo
• Fuel System: Direct Injection
• Factory Power: 300-335 HP
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: BMW

Highlights
• Improved N54 Successor
• Twin-Scroll Turbo Technology
• Smooth Power Delivery
• Strong Reliability Upgrade
• Modern BMW Engineering

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  ...aftermarketProducts,
];
