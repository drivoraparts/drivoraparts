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
  {
    id: 38,
    name: "BMW S55 (M3/M4) Twin Turbo Engine",
    category: "engine",
    brand: "bmw",
    platform: "bmw-s55",
    price: 6999,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/catalog/engine/bmw/s55/1.webp",
    images: [
      "/catalog/engine/bmw/s55/1.webp",
      "/catalog/engine/bmw/s55/2.webp",
      "/catalog/engine/bmw/s55/3.webp",
      "/catalog/engine/bmw/s55/4.webp",
      "/catalog/engine/bmw/s55/5.webp",
      "/catalog/engine/bmw/s55/6.webp",
      "/catalog/engine/bmw/s55/7.webp",
      "/catalog/engine/bmw/s55/8.webp",
      "/catalog/engine/bmw/s55/9.webp",
      "/catalog/engine/bmw/s55/10.webp",
      "/catalog/engine/bmw/s55/11.webp",
      "/catalog/engine/bmw/s55/12.webp",
      "/catalog/engine/bmw/s55/13.webp",
    ],
    description: `BMW S55 (M3/M4) Twin Turbo Engine

The BMW S55 is a high-performance 3.0L twin-turbo inline-six engine used in the M3 and M4 platforms, known for aggressive power delivery and motorsport engineering.

The BMW S55 engine is a motorsport-derived 3.0L twin-turbo inline-six designed for the BMW M3 and M4 (F80/F82/F83). It delivers aggressive throttle response, high-performance cooling systems, and strong tuning potential. Built as an evolution of the N54/N55 platform, the S55 is widely respected in the performance tuning world for its ability to handle high horsepower builds while maintaining factory-level refinement.

Specifications
• Engine Code: S55
• Configuration: Inline-6
• Aspiration: Twin Turbocharged
• Displacement: 3.0L
• Fuel System: Direct Injection
• Factory Power: 425–503 HP
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: BMW

Highlights
• BMW M Performance Engine
• Motorsport Derived Platform
• Twin Turbo High Output Design
• Strong Aftermarket Support
• Track Proven Reliability

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 39,
    name: "Nissan RB26DETT Skyline GTR Engine",
    category: "engine",
    brand: "nissan",
    platform: "rb26dett",
    price: 8999,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/catalog/engine/japanese-legends/rb26dett/1.webp",
    images: [
      "/catalog/engine/japanese-legends/rb26dett/1.webp",
      "/catalog/engine/japanese-legends/rb26dett/2.webp",
      "/catalog/engine/japanese-legends/rb26dett/3.webp",
      "/catalog/engine/japanese-legends/rb26dett/4.webp",
      "/catalog/engine/japanese-legends/rb26dett/5.webp",
      "/catalog/engine/japanese-legends/rb26dett/6.webp",
      "/catalog/engine/japanese-legends/rb26dett/7.webp",
      "/catalog/engine/japanese-legends/rb26dett/8.webp",
      "/catalog/engine/japanese-legends/rb26dett/9.webp",
      "/catalog/engine/japanese-legends/rb26dett/10.webp",
      "/catalog/engine/japanese-legends/rb26dett/11.webp",
      "/catalog/engine/japanese-legends/rb26dett/12.webp",
      "/catalog/engine/japanese-legends/rb26dett/13.webp",
      "/catalog/engine/japanese-legends/rb26dett/14.webp",
      "/catalog/engine/japanese-legends/rb26dett/15.webp",
      "/catalog/engine/japanese-legends/rb26dett/16.webp",
      "/catalog/engine/japanese-legends/rb26dett/17.webp",
      "/catalog/engine/japanese-legends/rb26dett/18.webp",
      "/catalog/engine/japanese-legends/rb26dett/19.webp",
    ],
    description: `Nissan RB26DETT Skyline GTR Engine

The legendary Nissan RB26DETT is the iconic Skyline GT-R engine, famous for its twin turbo performance, durability, and tuning dominance.

The Nissan RB26DETT engine is one of the most iconic Japanese performance engines ever created. Originally powering the Skyline GT-R (R32, R33, R34), it features a twin-turbo inline-six layout built for high-performance and racing durability. Known globally for its tuning potential and strength under boost, the RB26DETT remains a top choice for performance builds and engine swaps.

Specifications
• Engine Code: RB26DETT
• Configuration: Inline-6
• Aspiration: Twin Turbocharged
• Fuel System: Electronic Fuel Injection
• Factory Power: 276–320 HP
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Nissan

Highlights
• Skyline GT-R Legendary Engine
• Twin Turbo Performance Platform
• Extreme Tuning Potential
• Motorsport Heritage
• Iron Block Durability

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 40,
    name: "BMW S58 (M Performance Engine)",
    category: "engine",
    brand: "bmw",
    platform: "bmw-s58",
    price: 7999,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/catalog/engine/bmw/s58/1.avif",
    images: [
      "/catalog/engine/bmw/s58/1.avif",
      "/catalog/engine/bmw/s58/2.jpeg",
    ],
    description: `BMW S58 (M Performance Engine)

The BMW S58 is a high-performance twin-turbo inline-six engine powering the latest BMW M3 and M4 models, known for extreme performance and track capability.

The BMW S58 engine is the latest evolution of BMW's M Performance inline-six platform. Built for the G80 M3 and G82 M4, it delivers exceptional horsepower, torque, and track-ready durability. Featuring advanced twin-turbo technology, upgraded cooling systems, and reinforced internal components, the S58 is designed for high-performance driving and motorsport applications.

Specifications
• Engine Code: S58
• Configuration: Inline-6
• Aspiration: Twin Turbocharged
• Displacement: 3.0L
• Fuel System: Direct Injection
• Factory Power: 473–503 HP
• Cooling: High-Performance Liquid Cooling
• Fuel Type: Premium Gasoline
• Manufacturer: BMW

Highlights
• Latest BMW M Performance Engine
• Extreme Track Capability
• Twin Turbo High Output System
• Strong Motorsport Engineering
• High Reliability Under Load

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 41,
    name: "Nissan SR20DET Turbo Engine",
    category: "engine",
    brand: "nissan",
    platform: "sr20det",
    price: 4499,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/catalog/engine/japanese-legends/sr20det/1.jpg",
    images: [
      "/catalog/engine/japanese-legends/sr20det/1.jpg",
      "/catalog/engine/japanese-legends/sr20det/2.jpg",
      "/catalog/engine/japanese-legends/sr20det/3.jpg",
      "/catalog/engine/japanese-legends/sr20det/4.jpg",
      "/catalog/engine/japanese-legends/sr20det/5.jpg",
      "/catalog/engine/japanese-legends/sr20det/6.jpg",
      "/catalog/engine/japanese-legends/sr20det/7.jpg",
      "/catalog/engine/japanese-legends/sr20det/8.jpg",
      "/catalog/engine/japanese-legends/sr20det/9.jpg",
    ],
    description: `Nissan SR20DET Turbo Engine

The Nissan SR20DET is a legendary 2.0L turbocharged inline-four engine widely used in drift, racing, and performance builds due to its tuning potential.

The Nissan SR20DET is one of the most iconic Japanese turbo engines ever produced. Known for its lightweight design, strong aftermarket support, and high tuning capability, it has become a favorite in drifting, motorsports, and performance builds worldwide. Its turbocharged inline-four configuration delivers responsive power and excellent modification potential.

Specifications
• Engine Code: SR20DET
• Configuration: Inline-4
• Aspiration: Turbocharged
• Displacement: 2.0L
• Fuel System: Electronic Fuel Injection
• Factory Power: 200–250 HP
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Nissan

Highlights
• Legendary Drift Engine
• Lightweight Performance Platform
• Massive Aftermarket Support
• Strong Turbo Response
• Motorsport Proven Reliability

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 42,
    name: "Honda K20 Performance Engine",
    category: "engine",
    brand: "honda",
    platform: "honda-k20",
    price: 4299,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/catalog/engine/japanese-legends/k20/1.jpg",
    images: [
      "/catalog/engine/japanese-legends/k20/1.jpg",
      "/catalog/engine/japanese-legends/k20/2.webp",
    ],
    description: `Honda K20 Performance Engine

The Honda K20 is one of the most respected naturally aspirated performance engines ever produced, known for its high-revving VTEC powerband and exceptional reliability.

The Honda K20 engine has become a legend in the performance world due to its lightweight design, impressive power output, and enormous aftermarket support. Found in many Honda performance vehicles, the K20 is renowned for delivering responsive power, high RPM capability, and long-term reliability. Whether for a swap project, restoration, or track build, the K20 remains one of the most desirable Honda engines available.

Specifications
• Engine Code: K20
• Configuration: Inline-4
• Aspiration: Naturally Aspirated
• Displacement: 2.0L
• Fuel System: Electronic Fuel Injection
• Factory Power: 197–220 HP
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Honda

Highlights
• Legendary VTEC Performance
• High-Revving Powerband
• Lightweight Design
• Massive Aftermarket Support
• Excellent Reliability

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 43,
    name: "Honda K24 Performance Engine",
    category: "engine",
    brand: "honda",
    platform: "honda-k24",
    price: 4799,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/catalog/engine/japanese-legends/k24/1.jpg",
    images: [
      "/catalog/engine/japanese-legends/k24/1.jpg",
      "/catalog/engine/japanese-legends/k24/2.jpg",
      "/catalog/engine/japanese-legends/k24/3.jpg",
      "/catalog/engine/japanese-legends/k24/4.jpg",
      "/catalog/engine/japanese-legends/k24/5.jpg",
      "/catalog/engine/japanese-legends/k24/6.jpg",
      "/catalog/engine/japanese-legends/k24/7.jpg",
      "/catalog/engine/japanese-legends/k24/8.jpg",
    ],
    description: `Honda K24 Performance Engine

The Honda K24 combines strong low-end torque with Honda's proven reliability, making it one of the most popular performance swap engines available.

The Honda K24 is widely recognized as one of Honda's best performance engine platforms. Offering increased displacement over the K20, the K24 delivers excellent torque, strong reliability, and tremendous tuning potential. Popular in street, track, and engine swap communities worldwide, it remains a top choice for performance enthusiasts.

Specifications
• Engine Code: K24
• Configuration: Inline-4
• Aspiration: Naturally Aspirated
• Displacement: 2.4L
• Fuel System: Electronic Fuel Injection
• Factory Power: 190–205 HP
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Honda

Highlights
• Strong Low-End Torque
• Excellent Swap Platform
• Proven Honda Reliability
• Large Aftermarket Ecosystem
• High Performance Potential

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  ...aftermarketProducts,
];
