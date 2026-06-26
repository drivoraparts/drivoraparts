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
import { applyPublicPrices } from "./pricing";

const productCatalog: Product[] = [
  {
    id: 1,
    name: "BMW N54 Twin Turbo Engine",
    category: "engine",
    brand: "bmw",
    platform: "bmw-n54-twin-turbo",
    price: 5999,
    stock: true,
    condition: "brand-new",
    rating: 4.8,
    reviewCount: 97,
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/bmw/n54/1.jpeg",
    images: [
      "/product-media/engine/bmw/n54/1.jpeg",
      "/product-media/engine/bmw/n54/2.webp",
      "/product-media/engine/bmw/n54/3.webp",
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
    image: "/product-media/turbocharger/garrett-gtx3076r-gen-ii/1.jpg",
    thumbnail: "/product-media/turbocharger/garrett-gtx3076r-gen-ii/1.jpg",
    images: [
      "/product-media/turbocharger/garrett-gtx3076r-gen-ii/1.jpg",
      "/product-media/turbocharger/garrett-gtx3076r-gen-ii/2.jpg",
      "/product-media/turbocharger/garrett-gtx3076r-gen-ii/3.jpg",
      "/product-media/turbocharger/garrett-gtx3076r-gen-ii/4.jpg",
      "/product-media/turbocharger/garrett-gtx3076r-gen-ii/5.jpg",
    ],
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
    thumbnail: "/product-media/engine/bmw/b58/1.jpg",
    images: [
      "/product-media/engine/bmw/b58/1.jpg",
      "/product-media/engine/bmw/b58/2.jpg",
      "/product-media/engine/bmw/b58/3.jpg",
      "/product-media/engine/bmw/b58/4.jpg",
      "/product-media/engine/bmw/b58/5.jpg",
      "/product-media/engine/bmw/b58/6.jpg",
      "/product-media/engine/bmw/b58/7.jpg",
      "/product-media/engine/bmw/b58/8.jpg",
      "/product-media/engine/bmw/b58/9.jpg",
      "/product-media/engine/bmw/b58/10.jpg",
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
    rating: 4.9,
    reviewCount: 143,
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/japanese-legends/2jz-gte/1.jpg",
    images: [
      "/product-media/engine/japanese-legends/2jz-gte/1.jpg",
      "/product-media/engine/japanese-legends/2jz-gte/2.jpg",
      "/product-media/engine/japanese-legends/2jz-gte/3.jpg",
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
    thumbnail: "/product-media/engine/japanese-legends/1jz-gte/1.jpg",
    images: [
      "/product-media/engine/japanese-legends/1jz-gte/1.jpg",
      "/product-media/engine/japanese-legends/1jz-gte/2.jpg",
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
    thumbnail: "/product-media/engine/japanese-legends/1uz-fe/1.jpeg",
    images: [
      "/product-media/engine/japanese-legends/1uz-fe/1.jpeg",
      "/product-media/engine/japanese-legends/1uz-fe/2.jpeg",
      "/product-media/engine/japanese-legends/1uz-fe/3.jpeg",
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
    thumbnail: "/product-media/engine/bmw/n55/1.jpeg",
    images: [
      "/product-media/engine/bmw/n55/1.jpeg",
      "/product-media/engine/bmw/n55/2.webp",
      "/product-media/engine/bmw/n55/3.jpeg",
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
    thumbnail: "/product-media/engine/bmw/s55/1.webp",
    images: [
      "/product-media/engine/bmw/s55/1.webp",
      "/product-media/engine/bmw/s55/2.webp",
      "/product-media/engine/bmw/s55/3.webp",
      "/product-media/engine/bmw/s55/4.webp",
      "/product-media/engine/bmw/s55/5.webp",
      "/product-media/engine/bmw/s55/6.webp",
      "/product-media/engine/bmw/s55/7.webp",
      "/product-media/engine/bmw/s55/8.webp",
      "/product-media/engine/bmw/s55/9.webp",
      "/product-media/engine/bmw/s55/10.webp",
      "/product-media/engine/bmw/s55/11.webp",
      "/product-media/engine/bmw/s55/12.webp",
      "/product-media/engine/bmw/s55/13.webp",
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
    rating: 4.9,
    reviewCount: 121,
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/japanese-legends/rb26dett/1.webp",
    images: [
      "/product-media/engine/japanese-legends/rb26dett/1.webp",
      "/product-media/engine/japanese-legends/rb26dett/2.webp",
      "/product-media/engine/japanese-legends/rb26dett/3.webp",
      "/product-media/engine/japanese-legends/rb26dett/4.webp",
      "/product-media/engine/japanese-legends/rb26dett/5.webp",
      "/product-media/engine/japanese-legends/rb26dett/6.webp",
      "/product-media/engine/japanese-legends/rb26dett/7.webp",
      "/product-media/engine/japanese-legends/rb26dett/8.webp",
      "/product-media/engine/japanese-legends/rb26dett/9.webp",
      "/product-media/engine/japanese-legends/rb26dett/10.webp",
      "/product-media/engine/japanese-legends/rb26dett/11.webp",
      "/product-media/engine/japanese-legends/rb26dett/12.webp",
      "/product-media/engine/japanese-legends/rb26dett/13.webp",
      "/product-media/engine/japanese-legends/rb26dett/14.webp",
      "/product-media/engine/japanese-legends/rb26dett/15.webp",
      "/product-media/engine/japanese-legends/rb26dett/16.webp",
      "/product-media/engine/japanese-legends/rb26dett/17.webp",
      "/product-media/engine/japanese-legends/rb26dett/18.webp",
      "/product-media/engine/japanese-legends/rb26dett/19.webp",
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
    rating: 4.9,
    reviewCount: 86,
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/bmw/s58/1.avif",
    images: [
      "/product-media/engine/bmw/s58/1.avif",
      "/product-media/engine/bmw/s58/2.jpeg",
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
    thumbnail: "/product-media/engine/japanese-legends/sr20det/1.jpg",
    images: [
      "/product-media/engine/japanese-legends/sr20det/1.jpg",
      "/product-media/engine/japanese-legends/sr20det/2.jpg",
      "/product-media/engine/japanese-legends/sr20det/3.jpg",
      "/product-media/engine/japanese-legends/sr20det/4.jpg",
      "/product-media/engine/japanese-legends/sr20det/5.jpg",
      "/product-media/engine/japanese-legends/sr20det/6.jpg",
      "/product-media/engine/japanese-legends/sr20det/7.jpg",
      "/product-media/engine/japanese-legends/sr20det/8.jpg",
      "/product-media/engine/japanese-legends/sr20det/9.jpg",
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
    rating: 4.8,
    reviewCount: 74,
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/japanese-legends/k20/1.jpg",
    images: [
      "/product-media/engine/japanese-legends/k20/1.jpg",
      "/product-media/engine/japanese-legends/k20/2.webp",
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
    rating: 4.8,
    reviewCount: 68,
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/japanese-legends/k24/1.jpg",
    images: [
      "/product-media/engine/japanese-legends/k24/1.jpg",
      "/product-media/engine/japanese-legends/k24/2.jpg",
      "/product-media/engine/japanese-legends/k24/3.jpg",
      "/product-media/engine/japanese-legends/k24/4.jpg",
      "/product-media/engine/japanese-legends/k24/5.jpg",
      "/product-media/engine/japanese-legends/k24/6.jpg",
      "/product-media/engine/japanese-legends/k24/7.jpg",
      "/product-media/engine/japanese-legends/k24/8.jpg",
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
  {
    id: 44,
    name: "BMW M57 Diesel Inline-6 Engine",
    category: "engine",
    brand: "bmw",
    platform: "bmw-m57",
    price: 4799,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/bmw/m57/1.jpg",
    images: [
      "/product-media/engine/bmw/m57/1.jpg",
      "/product-media/engine/bmw/m57/2.jpg",
      "/product-media/engine/bmw/m57/3.jpg",
      "/product-media/engine/bmw/m57/4.jpg",
    ],
    description: `BMW M57 Diesel Inline-6 Engine

The BMW M57 is a legendary diesel inline-six engine known for extreme torque, durability, and long-distance reliability.

The BMW M57 engine is one of the most reliable diesel inline-six engines ever produced. It is known for its massive torque output, long lifespan, and strong tuning capability. Used across multiple BMW platforms, it is respected for both performance diesel builds and long-distance efficiency applications.

Specifications
• Engine Code: M57
• Configuration: Inline-6
• Aspiration: Turbocharged Diesel
• Displacement: 3.0L
• Fuel System: Common Rail Diesel Injection
• Factory Power: 181–286 HP (variant dependent)
• Torque: 390–580 Nm
• Cooling: Liquid Cooled
• Fuel Type: Diesel
• Manufacturer: BMW

Highlights
• Extreme Torque Output
• Legendary Diesel Reliability
• High Mileage Durability
• Strong Tuning Potential
• Commercial Grade Engine Design

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 45,
    name: "Honda B18C Type R Engine",
    category: "engine",
    brand: "honda",
    platform: "honda-b18c-type-r",
    price: 5199,
    stock: true,
    condition: "brand-new",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/japanese-legends/b18c-type-r/1.jpg",
    images: [
      "/product-media/engine/japanese-legends/b18c-type-r/1.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/2.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/3.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/4.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/5.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/6.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/7.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/8.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/9.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/10.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/11.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/12.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/13.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/14.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/15.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/16.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/17.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/18.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/19.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/20.jpg",
      "/product-media/engine/japanese-legends/b18c-type-r/21.jpg",
    ],
    description: `Honda B18C Type R Engine

The Honda B18C Type R is a high-revving VTEC performance engine known for its lightweight design and legendary Type R racing heritage.

The Honda B18C Type R engine is one of the most iconic performance engines in Honda's history. Found in the Integra Type R, it delivers exceptional high-RPM power, razor-sharp throttle response, and lightweight construction. It is widely respected in motorsport and tuning communities for its balance of reliability and extreme performance capability.

Specifications
• Engine Code: B18C
• Configuration: Inline-4
• Aspiration: Naturally Aspirated VTEC
• Displacement: 1.8L
• Fuel System: Electronic Fuel Injection
• Factory Power: 197–200 HP
• RPM Range: High-revving performance setup
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Honda

Highlights
• Legendary Type R Engine
• High-RPM VTEC Performance
• Lightweight Racing Platform
• Strong Aftermarket Support
• Motorsport Proven Reliability

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 46,
    name: "Mazda 13B Rotary Engine (Twin Rotor)",
    category: "engine",
    brand: "mazda",
    platform: "mazda-13b-rotary",
    price: 5599,
    stock: true,
    condition: "brand-new",
    horsepower: "280 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    rating: 4.8,
    reviewCount: 76,
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/japanese-legends/mazda-13b-rotary/1.webp",
    images: [
      "/product-media/engine/japanese-legends/mazda-13b-rotary/1.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/2.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/3.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/4.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/5.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/6.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/7.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/8.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/9.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/10.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/11.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/12.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/13.webp",
      "/product-media/engine/japanese-legends/mazda-13b-rotary/14.webp",
    ],
    description: `Mazda 13B Rotary Engine (Twin Rotor)

Legendary twin-rotor rotary engine known for high RPM performance, lightweight design, and RX-7 motorsport heritage.

The Mazda 13B Rotary engine is one of the most iconic rotary powerplants ever built. Its unique Wankel twin-rotor design delivers smooth high-revving performance and an exceptional power-to-weight ratio. Widely used in RX-7 platforms, it remains a top choice for drift builds and motorsport enthusiasts.

Specifications
• Engine Code: 13B
• Configuration: Twin-Rotor Rotary
• Displacement Equivalent: 1.3L
• Aspiration: Naturally Aspirated / Turbo variants
• Factory Power: 280 HP
• Fuel System: Electronic Fuel Injection
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Mazda

Highlights
• Legendary Rotary Technology
• Extremely High RPM Capability
• Lightweight Performance Engine
• Motorsports Icon (RX-7 Heritage)
• Unique Engineering Design

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 47,
    name: "Dodge Hellcat 6.2L Supercharged HEMI V8",
    category: "engine",
    brand: "dodge",
    platform: "dodge-hellcat-6-2",
    price: 14999,
    stock: true,
    condition: "brand-new",
    horsepower: "717 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/american-v8/dodge-hellcat-6-2/1.jpg",
    images: ["/product-media/engine/american-v8/dodge-hellcat-6-2/1.jpg"],
    description: `Dodge Hellcat 6.2L Supercharged HEMI V8

Factory-supercharged 6.2L HEMI V8 delivering extreme horsepower and legendary American muscle performance.

The Dodge Hellcat 6.2L Supercharged HEMI V8 is one of the most powerful production V8 engines ever built. Featuring forged internals, a factory supercharger, and massive power potential, it has become a favorite for muscle car restorations, custom builds, drag racing, and high-performance swaps.

Specifications
• Engine Code: Hellcat HEMI
• Configuration: V8
• Displacement: 6.2L
• Aspiration: Supercharged
• Factory Power: 717 HP
• Fuel System: Electronic Fuel Injection
• Fuel Type: Premium Gasoline
• Manufacturer: Dodge

Highlights
• Factory Supercharged HEMI Platform
• Extreme Horsepower Output
• Forged Internal Components
• Legendary American Muscle Performance
• Ideal for Restorations and Swaps

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 48,
    name: "Ford Coyote 5.0L V8 Engine",
    category: "engine",
    brand: "ford",
    platform: "ford-coyote-5-0",
    price: 8499,
    stock: true,
    condition: "brand-new",
    horsepower: "460 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/american-v8/ford-coyote-5-0/1.jpg",
    images: [
      "/product-media/engine/american-v8/ford-coyote-5-0/1.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/2.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/3.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/4.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/5.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/6.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/7.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/8.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/9.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/10.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/11.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/12.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/13.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/14.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/15.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/16.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/17.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/18.jpg",
      "/product-media/engine/american-v8/ford-coyote-5-0/19.jpg",
    ],
    description: `Ford Coyote 5.0L V8 Engine

Modern DOHC V8 delivering excellent reliability, power, and swap versatility.

The Ford Coyote 5.0L V8 is one of the most popular modern V8 platforms available. Known for its high-revving capability, reliability, and strong aftermarket support, the Coyote has become a leading choice for performance swaps and custom builds.

Specifications
• Engine Code: Coyote
• Configuration: V8
• Displacement: 5.0L
• Aspiration: Naturally Aspirated
• Factory Power: 460 HP
• Fuel System: Electronic Fuel Injection
• Fuel Type: Premium Gasoline
• Manufacturer: Ford

Highlights
• Modern DOHC V8 Architecture
• High-Revving Performance
• Strong Swap Compatibility
• Extensive Aftermarket Support
• Proven Reliability

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 49,
    name: "Chevrolet LS3 V8 Engine",
    category: "engine",
    brand: "chevrolet",
    platform: "ls3",
    price: 7999,
    stock: true,
    condition: "brand-new",
    horsepower: "430 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/american-v8/ls3/1.jpg",
    images: [
      "/product-media/engine/american-v8/ls3/1.jpg",
      "/product-media/engine/american-v8/ls3/2.jpg",
      "/product-media/engine/american-v8/ls3/3.jpg",
      "/product-media/engine/american-v8/ls3/4.jpg",
      "/product-media/engine/american-v8/ls3/5.jpg",
      "/product-media/engine/american-v8/ls3/6.jpg",
    ],
    description: `Chevrolet LS3 V8 Engine

Legendary LS-series V8 with unmatched swap compatibility and aftermarket support.

The Chevrolet LS3 has earned its reputation as one of the greatest swap engines ever produced. Its compact design, strong power output, reliability, and extensive aftermarket ecosystem make it ideal for street, track, and custom projects.

Specifications
• Engine Code: LS3
• Configuration: V8
• Displacement: 6.2L
• Aspiration: Naturally Aspirated
• Factory Power: 430 HP
• Fuel System: Electronic Fuel Injection
• Fuel Type: Premium Gasoline
• Manufacturer: Chevrolet

Highlights
• Legendary LS Swap Platform
• Compact Lightweight Design
• Massive Aftermarket Ecosystem
• Proven Street and Track Reliability
• Ideal for Custom Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 50,
    name: "Chevrolet LS7 V8 Engine",
    category: "engine",
    brand: "chevrolet",
    platform: "ls7",
    price: 12499,
    stock: true,
    condition: "brand-new",
    horsepower: "505 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/american-v8/ls7/1.jpg",
    images: [
      "/product-media/engine/american-v8/ls7/1.jpg",
      "/product-media/engine/american-v8/ls7/2.jpg",
      "/product-media/engine/american-v8/ls7/3.jpg",
      "/product-media/engine/american-v8/ls7/4.jpg",
      "/product-media/engine/american-v8/ls7/5.jpg",
      "/product-media/engine/american-v8/ls7/6.jpg",
      "/product-media/engine/american-v8/ls7/7.jpg",
      "/product-media/engine/american-v8/ls7/8.jpg",
      "/product-media/engine/american-v8/ls7/9.jpg",
      "/product-media/engine/american-v8/ls7/10.jpg",
    ],
    description: `Chevrolet LS7 V8 Engine

High-performance 7.0L Corvette Z06 V8 with race-inspired engineering.

The LS7 is Chevrolet's iconic naturally aspirated performance V8. Originally developed for the Corvette Z06, it features lightweight internals, exceptional airflow, and massive displacement for outstanding performance.

Specifications
• Engine Code: LS7
• Configuration: V8
• Displacement: 7.0L
• Aspiration: Naturally Aspirated
• Factory Power: 505 HP
• Fuel System: Electronic Fuel Injection
• Fuel Type: Premium Gasoline
• Manufacturer: Chevrolet

Highlights
• Corvette Z06 Performance Heritage
• Race-Inspired Engineering
• Large Displacement NA Power
• Lightweight Internal Components
• Exceptional Airflow Design

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 51,
    name: "Chevrolet LT1 Corvette V8 Engine",
    category: "engine",
    brand: "chevrolet",
    platform: "lt1-lt4",
    price: 9499,
    stock: true,
    condition: "brand-new",
    horsepower: "455 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/american-v8/lt1/1.jpg",
    images: [
      "/product-media/engine/american-v8/lt1/1.jpg",
      "/product-media/engine/american-v8/lt1/2.jpg",
      "/product-media/engine/american-v8/lt1/3.jpg",
      "/product-media/engine/american-v8/lt1/4.jpg",
      "/product-media/engine/american-v8/lt1/5.jpg",
    ],
    description: `Chevrolet LT1 Corvette V8 Engine

Modern direct-injected Corvette V8 offering strong power and efficiency.

The LT1 is Chevrolet's next-generation small-block V8 platform. Featuring direct injection and modern engine management technology, it combines strong performance with everyday reliability.

Specifications
• Engine Code: LT1
• Configuration: V8
• Displacement: 6.2L
• Aspiration: Naturally Aspirated
• Factory Power: 455 HP
• Fuel System: Direct Injection
• Fuel Type: Premium Gasoline
• Manufacturer: Chevrolet

Highlights
• Modern Direct Injection Platform
• Corvette Performance Engineering
• Strong Power and Efficiency
• Advanced Engine Management
• Reliable Daily and Track Use

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 52,
    name: "Chevrolet LT4 Supercharged Corvette V8",
    category: "engine",
    brand: "chevrolet",
    platform: "lt1-lt4",
    price: 15999,
    stock: true,
    condition: "brand-new",
    horsepower: "650 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/american-v8/lt4/1.jpg",
    images: [
      "/product-media/engine/american-v8/lt4/1.jpg",
      "/product-media/engine/american-v8/lt4/2.jpg",
      "/product-media/engine/american-v8/lt4/3.jpg",
      "/product-media/engine/american-v8/lt4/4.jpg",
      "/product-media/engine/american-v8/lt4/5.jpg",
      "/product-media/engine/american-v8/lt4/6.jpg",
      "/product-media/engine/american-v8/lt4/7.jpg",
      "/product-media/engine/american-v8/lt4/8.jpg",
      "/product-media/engine/american-v8/lt4/9.jpg",
      "/product-media/engine/american-v8/lt4/10.jpg",
      "/product-media/engine/american-v8/lt4/11.jpg",
      "/product-media/engine/american-v8/lt4/12.jpg",
      "/product-media/engine/american-v8/lt4/13.jpg",
      "/product-media/engine/american-v8/lt4/14.jpg",
    ],
    description: `Chevrolet LT4 Supercharged Corvette V8

Factory-supercharged Corvette V8 engineered for track-level performance.

The LT4 combines direct injection, advanced cooling systems, and factory supercharging to produce incredible horsepower and torque. It is one of the most sought-after modern V8 engines for premium performance builds.

Specifications
• Engine Code: LT4
• Configuration: Supercharged V8
• Displacement: 6.2L
• Aspiration: Supercharged
• Factory Power: 650 HP
• Fuel System: Direct Injection
• Fuel Type: Premium Gasoline
• Manufacturer: Chevrolet

Highlights
• Factory Supercharged Corvette Platform
• Track-Level Performance Engineering
• Advanced Cooling Systems
• Direct Injection Technology
• Premium Performance Build Candidate

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 53,
    name: "BMW N63 V8 Twin Turbo Engine",
    category: "engine",
    brand: "bmw",
    platform: "bmw-n63-v8",
    price: 6999,
    stock: true,
    condition: "brand-new",
    horsepower: "523 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    rating: 4.8,
    reviewCount: 64,
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/bmw/n63/1.webp",
    images: [
      "/product-media/engine/bmw/n63/1.webp",
      "/product-media/engine/bmw/n63/2.jpg",
    ],
    description: `BMW N63 V8 Twin Turbo Engine

High-performance twin-turbo V8 engine used in BMW luxury and performance models, delivering strong torque and premium driving dynamics.

The BMW N63 is a twin-turbocharged V8 engine designed for high-end BMW performance and luxury models. It combines strong torque delivery, advanced engineering, and smooth power output. It is widely used in BMW 5, 7, and X series performance variants.

Specifications
• Engine Code: N63
• Configuration: V8
• Aspiration: Twin Turbocharged
• Displacement: 4.4L
• Factory Power: 523 HP
• Fuel System: Direct Injection
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: BMW

Highlights
• Twin-Turbo V8 Performance
• Premium BMW Engineering
• Strong Torque Delivery
• Luxury and Performance Platform
• Ideal for Replacement and Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 54,
    name: "Audi 2.0 TFSI EA888 Turbo Engine",
    category: "engine",
    brand: "audi",
    platform: "audi-2-0-tfsi-ea888",
    price: 3999,
    stock: true,
    condition: "brand-new",
    horsepower: "220 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/1.jpg",
    images: [
      "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/1.jpg",
      "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/2.jpg",
      "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/3.jpg",
      "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/4.jpg",
      "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/5.jpg",
      "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/6.jpg",
    ],
    description: `Audi 2.0 TFSI EA888 Turbo Engine

Modern turbocharged 2.0L Audi EA888 engine known for efficiency, tuning potential, and reliability.

The Audi EA888 2.0 TFSI engine is one of the most widely used modern turbocharged engines in the Volkswagen Group. Known for strong tuning capability, efficiency, and balance between performance and reliability, it is a popular choice for swaps and upgrades.

Specifications
• Engine Code: EA888
• Configuration: Inline-4
• Displacement: 2.0L
• Aspiration: Turbocharged
• Factory Power: 220 HP
• Fuel System: Direct Injection
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Audi

Highlights
• Modern VW Group Turbo Platform
• Strong Tuning Potential
• Efficient Performance Design
• Wide Aftermarket Support
• Ideal for Swap and Upgrade Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 55,
    name: "Audi 4.0 TFSI V8 Biturbo Engine",
    category: "engine",
    brand: "audi",
    platform: "audi-4-0-tfsi-v8",
    price: 11999,
    stock: true,
    condition: "brand-new",
    horsepower: "600 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/1.jpg",
    images: [
      "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/1.jpg",
      "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/2.jpg",
      "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/3.jpg",
      "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/4.jpg",
      "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/5.jpg",
      "/product-media/engine/euro-performance/audi-2-0-tfsi-ea888/6.jpg",
    ],
    description: `Audi 4.0 TFSI V8 Biturbo Engine

High-performance twin-turbo V8 used in Audi RS models delivering extreme luxury performance.

The Audi 4.0 TFSI V8 Biturbo engine powers Audi RS performance models and delivers massive horsepower with refined German engineering. It is known for strong torque delivery and advanced turbo technology.

Specifications
• Engine Code: 4.0 TFSI
• Configuration: V8
• Displacement: 4.0L
• Aspiration: Twin Turbocharged
• Factory Power: 600 HP
• Fuel System: Direct Injection
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Audi

Highlights
• Audi RS Performance Platform
• Twin-Turbo V8 Engineering
• Extreme Horsepower Output
• Refined German Performance
• Premium Luxury Build Candidate

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 56,
    name: "Mercedes-Benz M113 V8 Engine",
    category: "engine",
    brand: "mercedes-benz",
    platform: "mercedes-m113",
    price: 6499,
    stock: true,
    condition: "brand-new",
    horsepower: "302 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/euro-performance/mercedes-m113/1.jpg",
    images: [
      "/product-media/engine/euro-performance/mercedes-m113/1.jpg",
      "/product-media/engine/euro-performance/mercedes-m113/2.jpg",
      "/product-media/engine/euro-performance/mercedes-m113/3.jpg",
      "/product-media/engine/euro-performance/mercedes-m113/4.jpg",
      "/product-media/engine/euro-performance/mercedes-m113/5.jpg",
      "/product-media/engine/euro-performance/mercedes-m113/6.jpg",
      "/product-media/engine/euro-performance/mercedes-m113/7.jpg",
      "/product-media/engine/euro-performance/mercedes-m113/8.jpg",
      "/product-media/engine/euro-performance/mercedes-m113/9.jpg",
    ],
    description: `Mercedes-Benz M113 V8 Engine

Legendary naturally aspirated Mercedes V8 known for reliability and long-term durability.

The Mercedes M113 V8 is a highly respected naturally aspirated engine known for durability, smooth power delivery, and strong aftermarket support in performance and luxury applications.

Specifications
• Engine Code: M113
• Configuration: V8
• Aspiration: Naturally Aspirated
• Displacement: 5.0L
• Factory Power: 302 HP
• Fuel System: Electronic Fuel Injection
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Mercedes-Benz

Highlights
• Legendary Mercedes V8 Reliability
• Smooth Naturally Aspirated Power
• Long-Term Durability
• Strong Aftermarket Support
• Luxury and Performance Applications

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 57,
    name: "Mercedes-AMG M157 Biturbo V8 Engine",
    category: "engine",
    brand: "mercedes-amg",
    platform: "mercedes-m157-amg",
    price: 12999,
    stock: true,
    condition: "brand-new",
    horsepower: "577 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/euro-performance/mercedes-m157-amg/1.jpg",
    images: [
      "/product-media/engine/euro-performance/mercedes-m157-amg/1.jpg",
      "/product-media/engine/euro-performance/mercedes-m157-amg/2.jpg",
      "/product-media/engine/euro-performance/mercedes-m157-amg/3.jpg",
      "/product-media/engine/euro-performance/mercedes-m157-amg/4.jpg",
      "/product-media/engine/euro-performance/mercedes-m157-amg/5.jpg",
      "/product-media/engine/euro-performance/mercedes-m157-amg/6.jpg",
    ],
    description: `Mercedes-AMG M157 Biturbo V8 Engine

High-performance AMG twin-turbo V8 engine delivering extreme horsepower and torque.

The Mercedes M157 AMG Biturbo V8 is engineered for high-performance AMG models. It delivers massive power output, advanced turbocharging, and aggressive acceleration performance.

Specifications
• Engine Code: M157
• Configuration: V8
• Displacement: 5.5L
• Aspiration: Twin Turbocharged
• Factory Power: 577 HP
• Fuel System: Direct Injection
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Mercedes-AMG

Highlights
• AMG Twin-Turbo V8 Platform
• Extreme Horsepower and Torque
• Advanced Turbo Technology
• Track-Capable Performance
• Premium German Engineering

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 58,
    name: "Volkswagen VR6 Engine",
    category: "engine",
    brand: "volkswagen",
    platform: "vw-vr6",
    price: 4999,
    stock: true,
    condition: "brand-new",
    horsepower: "280 HP",
    mileage: "0 Miles",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/euro-performance/vw-vr6/1.jpg",
    images: ["/product-media/engine/euro-performance/vw-vr6/1.jpg"],
    description: `Volkswagen VR6 Engine

Unique narrow-angle VR6 engine known for smooth power delivery and compact design.

The Volkswagen VR6 engine is a unique engineering design combining V6 smoothness with inline packaging efficiency. It is widely used in VW performance platforms and known for its distinctive sound and strong tuning potential.

Specifications
• Engine Code: VR6
• Configuration: VR6 Narrow-Angle
• Displacement: 3.6L
• Aspiration: Naturally Aspirated
• Factory Power: 280 HP
• Fuel System: Electronic Fuel Injection
• Cooling: Liquid Cooled
• Fuel Type: Premium Gasoline
• Manufacturer: Volkswagen

Highlights
• Unique VR6 Engineering Design
• Compact V6 Packaging
• Smooth Power Delivery
• Distinctive Engine Character
• Strong Tuning Potential

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 59,
    name: "HKS Blow-off Valves",
    category: "engine",
    brand: "hks",
    platform: "blow-off-valves",
    price: 320,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/hks-blow-off-valves/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/hks-blow-off-valves/1.jpg",
      "/product-media/engine/turbo-performance/hks-blow-off-valves/2.jpg",
      "/product-media/engine/turbo-performance/hks-blow-off-valves/3.jpg",
    ],
    description: `HKS Blow-off Valves

Performance blow-off valve engineered for turbocharged applications, delivering precise pressure relief and the signature HKS release sound.

The HKS Blow-off Valve is a precision-engineered pressure relief valve designed to protect turbocharged engines from compressor surge during throttle lift-off. Built from billet aluminum with a hardened internal piston, it delivers consistent valve response, improved turbo longevity, and the unmistakable HKS sound. Suitable for a wide range of turbocharged platforms as a direct upgrade or universal installation.

Specifications
• Part Type: Blow-off Valve (Vent-to-Atmosphere)
• Construction: Billet Aluminum Body
• Piston: Hardened Anodized Internal Piston
• Spring: Adjustable Pressure Spring
• Mounting: Flange / Universal Weld-on
• Compatibility: Universal Turbocharged Applications
• Manufacturer: HKS

Highlights
• Precise Compressor Surge Protection
• Billet Aluminum Construction
• Adjustable Spring Pressure
• Signature HKS Release Sound
• Improves Turbo Longevity

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 60,
    name: "Turbosmart Blow-off Valves",
    category: "engine",
    brand: "turbosmart",
    platform: "blow-off-valves",
    price: 280,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/turbosmart-blow-off-valves/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/turbosmart-blow-off-valves/1.jpg",
      "/product-media/engine/turbo-performance/turbosmart-blow-off-valves/2.jpg",
    ],
    description: `Turbosmart Blow-off Valves

Race-proven Turbosmart blow-off valve offering reliable boost venting and fast valve response.

Turbosmart Blow-off Valves are globally trusted in motorsport and street performance for their fast actuation, reliable sealing, and durable construction. Featuring a precision diaphragm and adjustable spring preload, the valve vents excess boost pressure smoothly while protecting the turbocharger and intake system. Ideal for high-boost builds and a popular direct upgrade across turbocharged platforms.

Specifications
• Part Type: Blow-off Valve (Adjustable)
• Construction: Anodized Aluminum Body
• Actuation: Precision Diaphragm Design
• Spring: Adjustable Preload
• Mounting: Flange / Universal
• Compatibility: Universal Turbocharged Applications
• Manufacturer: Turbosmart

Highlights
• Fast Valve Response
• Motorsport-Proven Reliability
• Adjustable Spring Preload
• Durable Anodized Construction
• Protects Turbo and Intake System

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 61,
    name: "BorgWarner EFR Series",
    category: "engine",
    brand: "borgwarner",
    platform: "borgwarner-efr",
    price: 2199,
    stock: true,
    condition: "brand-new",
    horsepower: "Up to 550 HP",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/borgwarner-efr-series/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/borgwarner-efr-series/1.jpg",
      "/product-media/engine/turbo-performance/borgwarner-efr-series/2.jpg",
      "/product-media/engine/turbo-performance/borgwarner-efr-series/3.jpg",
    ],
    description: `BorgWarner EFR Series

Advanced BorgWarner EFR turbocharger combining Gamma-Ti turbine technology with rapid spool and high-flow performance.

The BorgWarner EFR (Engineered For Racing) Series represents one of the most advanced turbocharger platforms available, featuring a lightweight Gamma-Ti turbine wheel, dual-row ceramic ball bearing cartridge, and integrated boost control provisions. Engineered for fast spool and consistent high-rpm flow, the EFR series delivers exceptional response and reliability for serious performance and motorsport builds.

Specifications
• Part Type: Ball Bearing Turbocharger
• Turbine Wheel: Gamma-Ti Lightweight Alloy
• Bearing: Dual-Row Ceramic Ball Bearing
• Boost Control: Integrated Provisions
• Power Capability: Up to 550 HP
• Compatibility: Universal Performance Applications
• Manufacturer: BorgWarner

Highlights
• Gamma-Ti Turbine Technology
• Rapid Spool Response
• Ceramic Ball Bearing Cartridge
• Motorsport Engineered Reliability
• High-Flow Performance Design

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 62,
    name: "Complete Turbo Kit (New)",
    category: "engine",
    brand: "garrett",
    platform: "complete-turbo-kit",
    price: 3499,
    stock: true,
    condition: "brand-new",
    horsepower: "+250 HP",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/complete-turbo-kit/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/complete-turbo-kit/1.jpg",
      "/product-media/engine/turbo-performance/complete-turbo-kit/2.jpg",
      "/product-media/engine/turbo-performance/complete-turbo-kit/3.jpg",
      "/product-media/engine/turbo-performance/complete-turbo-kit/4.jpg",
      "/product-media/engine/turbo-performance/complete-turbo-kit/5.jpg",
      "/product-media/engine/turbo-performance/complete-turbo-kit/6.jpg",
      "/product-media/engine/turbo-performance/complete-turbo-kit/7.jpg",
      "/product-media/engine/turbo-performance/complete-turbo-kit/8.jpg",
      "/product-media/engine/turbo-performance/complete-turbo-kit/9.jpg",
      "/product-media/engine/turbo-performance/complete-turbo-kit/10.jpg",
    ],
    description: `Complete Turbo Kit (New)

Complete bolt-on turbocharger kit with all components required for a reliable forced-induction upgrade.

This Complete Turbo Kit includes everything needed for a clean forced-induction installation, including the turbocharger, manifold, intercooler, piping, wastegate, blow-off valve, and supporting hardware. Engineered as a matched system for consistent boost delivery and reliable power gains, it is ideal for enthusiasts seeking a comprehensive performance upgrade in a single package.

Specifications
• Kit Type: Complete Bolt-on Turbo System
• Includes: Turbocharger, Manifold, Intercooler, Piping
• Boost Control: Wastegate + Blow-off Valve Included
• Power Gain: +250 HP (application dependent)
• Hardware: Full Gaskets and Mounting Hardware
• Compatibility: Application-Specific Fitment
• Manufacturer: Garrett

Highlights
• Complete All-in-One Turbo Solution
• Matched Components for Reliable Boost
• Significant Power Gains
• Includes Wastegate and Blow-off Valve
• Comprehensive Installation Hardware

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 63,
    name: "Exhaust Systems Catback",
    category: "engine",
    brand: "hks",
    platform: "exhaust-systems",
    price: 899,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/exhaust-catback/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/exhaust-catback/1.jpg",
      "/product-media/engine/turbo-performance/exhaust-catback/2.jpg",
      "/product-media/engine/turbo-performance/exhaust-catback/3.jpg",
      "/product-media/engine/turbo-performance/exhaust-catback/4.jpg",
    ],
    description: `Exhaust Systems Catback

High-flow catback exhaust system engineered for improved flow, weight savings, and an aggressive performance tone.

This Catback Exhaust System replaces the factory exhaust from the catalytic converter back, using mandrel-bent stainless steel tubing for improved exhaust flow and reduced weight. Designed to enhance throttle response, free up power, and deliver an aggressive yet refined tone, it bolts on as a direct-fit performance upgrade with all necessary hardware.

Specifications
• Part Type: Catback Exhaust System
• Material: T304 Stainless Steel
• Tubing: Mandrel-Bent High-Flow Design
• Tip: Polished Stainless Tip
• Fitment: Direct Bolt-on
• Compatibility: Application-Specific Fitment
• Manufacturer: HKS

Highlights
• Mandrel-Bent High-Flow Tubing
• T304 Stainless Construction
• Improved Throttle Response
• Aggressive Performance Tone
• Direct Bolt-on Installation

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 64,
    name: "Exhaust Systems Downpipe",
    category: "engine",
    brand: "hks",
    platform: "exhaust-systems",
    price: 549,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/exhaust-downpipe/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/exhaust-downpipe/1.jpg",
      "/product-media/engine/turbo-performance/exhaust-downpipe/2.jpg",
      "/product-media/engine/turbo-performance/exhaust-downpipe/3.jpg",
      "/product-media/engine/turbo-performance/exhaust-downpipe/4.jpg",
      "/product-media/engine/turbo-performance/exhaust-downpipe/5.jpg",
      "/product-media/engine/turbo-performance/exhaust-downpipe/6.jpg",
    ],
    description: `Exhaust Systems Downpipe

High-flow downpipe designed to reduce backpressure and unlock turbocharged performance.

This performance Downpipe replaces the restrictive factory unit with a high-flow design that reduces exhaust backpressure and improves turbo spool and power delivery. Constructed from stainless steel with precision flanges for a leak-free fit, it is a popular foundational upgrade for turbocharged performance builds.

Specifications
• Part Type: Performance Downpipe
• Material: T304 Stainless Steel
• Design: High-Flow / Reduced Backpressure
• Flanges: Precision CNC Flanges
• Fitment: Direct Bolt-on
• Compatibility: Turbocharged Application-Specific Fitment
• Manufacturer: HKS

Highlights
• Reduced Exhaust Backpressure
• Improved Turbo Spool
• Stainless Steel Construction
• Precision Leak-Free Flanges
• Foundational Turbo Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 65,
    name: "Garrett GTX3076R Turbo Kit",
    category: "engine",
    brand: "garrett",
    platform: "gtx3076r-turbo-kit",
    price: 2499,
    stock: true,
    condition: "brand-new",
    horsepower: "Up to 650 HP",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/garrett-gtx3076r-turbo-kit/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/garrett-gtx3076r-turbo-kit/1.jpg",
      "/product-media/engine/turbo-performance/garrett-gtx3076r-turbo-kit/2.jpg",
      "/product-media/engine/turbo-performance/garrett-gtx3076r-turbo-kit/3.jpg",
      "/product-media/engine/turbo-performance/garrett-gtx3076r-turbo-kit/4.jpg",
      "/product-media/engine/turbo-performance/garrett-gtx3076r-turbo-kit/5.jpg",
      "/product-media/engine/turbo-performance/garrett-gtx3076r-turbo-kit/6.jpg",
    ],
    description: `Garrett GTX3076R Turbo Kit

Garrett GTX3076R turbocharger kit delivering proven high-flow performance and strong mid-range response.

The Garrett GTX3076R is one of the most popular performance turbochargers available, featuring a forged fully-machined billet compressor wheel and dual ball bearing cartridge for fast spool and high-rpm flow. Supplied as a performance kit, it balances rapid response with strong top-end power, making it ideal for street and track builds targeting up to 650 horsepower.

Specifications
• Part Type: Ball Bearing Turbocharger Kit
• Compressor Wheel: Forged Billet
• Bearing: Dual Ball Bearing Cartridge
• Power Capability: Up to 650 HP
• Housing: Multiple Turbine A/R Options
• Compatibility: Universal Performance Applications
• Manufacturer: Garrett

Highlights
• Forged Billet Compressor Wheel
• Dual Ball Bearing Cartridge
• Fast Spool and High-Flow
• Proven Garrett GTX Performance
• Ideal for Street and Track

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 66,
    name: "Garrett GTX3582R Kit",
    category: "engine",
    brand: "garrett",
    platform: "gtx3582r-kit",
    price: 2899,
    stock: true,
    condition: "brand-new",
    horsepower: "Up to 770 HP",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/garrett-gtx3582r-kit/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/garrett-gtx3582r-kit/1.jpg",
      "/product-media/engine/turbo-performance/garrett-gtx3582r-kit/2.jpg",
    ],
    description: `Garrett GTX3582R Kit

Garrett GTX3582R turbocharger kit built for high-horsepower performance with strong top-end flow.

The Garrett GTX3582R is a larger-frame performance turbocharger designed for builds targeting higher horsepower while maintaining usable response. Featuring a forged billet compressor wheel and dual ball bearing cartridge, it delivers excellent high-rpm airflow and proven reliability. Supplied as a complete kit, it supports power targets up to 770 horsepower for serious street and track applications.

Specifications
• Part Type: Ball Bearing Turbocharger Kit
• Compressor Wheel: Forged Billet
• Bearing: Dual Ball Bearing Cartridge
• Power Capability: Up to 770 HP
• Housing: Multiple Turbine A/R Options
• Compatibility: Universal Performance Applications
• Manufacturer: Garrett

Highlights
• Forged Billet Compressor Wheel
• High-Horsepower Capability
• Strong Top-End Airflow
• Proven Garrett GTX Reliability
• Ideal for Big-Power Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 67,
    name: "Hybrid Turbo Audi Kits",
    category: "engine",
    brand: "garrett",
    platform: "hybrid-turbo-kits",
    price: 1899,
    stock: true,
    condition: "brand-new",
    horsepower: "+150 HP",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/hybrid-turbo-audi-kits/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/hybrid-turbo-audi-kits/1.jpg",
    ],
    description: `Hybrid Turbo Audi Kits

Hybrid turbocharger upgrade kit for Audi platforms, increasing flow capacity while retaining factory fitment.

Hybrid Turbo Audi Kits upgrade the factory turbocharger with uprated billet compressor and turbine components to increase flow and power while retaining OEM-style fitment and reliability. Engineered as a direct replacement for popular Audi turbocharged platforms, these hybrid units deliver strong mid-range gains and improved response without major fabrication.

Specifications
• Part Type: Hybrid Turbocharger Upgrade
• Compressor Wheel: Uprated Billet
• Fitment: OEM-Style Direct Replacement
• Power Gain: +150 HP (application dependent)
• Platform: Audi Turbocharged Engines
• Compatibility: Audi 2.0 TFSI / Performance Platforms
• Manufacturer: Garrett

Highlights
• Uprated Billet Compressor
• Retains Factory Fitment
• Strong Mid-Range Gains
• Improved Throttle Response
• Direct Replacement Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 68,
    name: "Hybrid Turbo BMW",
    category: "engine",
    brand: "garrett",
    platform: "hybrid-turbo-kits",
    price: 1999,
    stock: true,
    condition: "brand-new",
    horsepower: "+180 HP",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/hybrid-turbo-bmw/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/hybrid-turbo-bmw/1.jpg",
      "/product-media/engine/turbo-performance/hybrid-turbo-bmw/2.jpg",
      "/product-media/engine/turbo-performance/hybrid-turbo-bmw/3.jpg",
      "/product-media/engine/turbo-performance/hybrid-turbo-bmw/4.jpg",
      "/product-media/engine/turbo-performance/hybrid-turbo-bmw/5.jpg",
      "/product-media/engine/turbo-performance/hybrid-turbo-bmw/6.jpg",
      "/product-media/engine/turbo-performance/hybrid-turbo-bmw/7.jpg",
    ],
    description: `Hybrid Turbo BMW

Hybrid turbocharger upgrade for BMW turbocharged platforms, increasing power while retaining factory-style fitment.

The Hybrid Turbo BMW upgrade replaces the factory turbocharger internals with uprated billet components to increase airflow and power output while maintaining OEM-style fitment and reliability. Engineered for popular BMW turbocharged inline-six platforms, it delivers strong mid-range and top-end gains with a clean direct-replacement installation.

Specifications
• Part Type: Hybrid Turbocharger Upgrade
• Compressor Wheel: Uprated Billet
• Fitment: OEM-Style Direct Replacement
• Power Gain: +180 HP (application dependent)
• Platform: BMW Turbocharged Engines
• Compatibility: BMW N54 / N55 Turbocharged Platforms
• Manufacturer: Garrett

Highlights
• Uprated Billet Compressor
• Retains Factory Fitment
• Strong Mid-Range and Top-End Gains
• Improved Throttle Response
• Direct Replacement Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 69,
    name: "Intake Systems",
    category: "engine",
    brand: "hks",
    platform: "intakes",
    price: 349,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/intake-systems/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/intake-systems/1.jpg",
    ],
    description: `Intake Systems

High-flow cold air intake system designed to improve airflow, throttle response, and induction sound.

This Intake System replaces the restrictive factory airbox with a high-flow filter and mandrel-formed intake tube to increase airflow and improve throttle response. Designed for a direct-fit installation, it enhances induction sound and complements both turbocharged and naturally aspirated performance builds.

Specifications
• Part Type: High-Flow Cold Air Intake
• Filter: Reusable High-Flow Element
• Tube: Mandrel-Formed Intake Pipe
• Fitment: Direct Bolt-on
• Compatibility: Application-Specific Fitment
• Manufacturer: HKS

Highlights
• Increased Airflow
• Improved Throttle Response
• Reusable High-Flow Filter
• Enhanced Induction Sound
• Direct Bolt-on Installation

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 70,
    name: "Intercoolers (Front Mount Kits)",
    category: "engine",
    brand: "garrett",
    platform: "intercoolers",
    price: 749,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/intercoolers-front-mount-kits/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/intercoolers-front-mount-kits/1.jpg",
      "/product-media/engine/turbo-performance/intercoolers-front-mount-kits/2.jpg",
      "/product-media/engine/turbo-performance/intercoolers-front-mount-kits/3.jpg",
      "/product-media/engine/turbo-performance/intercoolers-front-mount-kits/4.jpg",
      "/product-media/engine/turbo-performance/intercoolers-front-mount-kits/5.jpg",
      "/product-media/engine/turbo-performance/intercoolers-front-mount-kits/6.jpg",
    ],
    description: `Intercoolers (Front Mount Kits)

Front-mount intercooler kit engineered to reduce intake temperatures and sustain consistent boost performance.

This Front Mount Intercooler (FMIC) Kit upgrades the factory cooling system with a high-capacity bar-and-plate core and mandrel-bent piping to reduce intake air temperatures and prevent heat soak under sustained boost. Engineered for efficient cooling and minimal pressure drop, it is a core upgrade for reliable turbocharged power.

Specifications
• Part Type: Front Mount Intercooler Kit
• Core: Bar-and-Plate High-Capacity
• Piping: Mandrel-Bent Aluminum
• Couplers: Silicone Couplers + Clamps Included
• Benefit: Reduced Intake Temperatures
• Compatibility: Application-Specific Fitment
• Manufacturer: Garrett

Highlights
• High-Capacity Bar-and-Plate Core
• Reduced Intake Air Temperatures
• Prevents Heat Soak Under Boost
• Complete Piping and Coupler Kit
• Sustains Consistent Boost

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 71,
    name: "Precision 6266 Turbo",
    category: "engine",
    brand: "precision",
    platform: "precision-6266",
    price: 1649,
    stock: true,
    condition: "brand-new",
    horsepower: "Up to 735 HP",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/precision-6266-turbo/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/precision-6266-turbo/1.jpg",
      "/product-media/engine/turbo-performance/precision-6266-turbo/2.jpg",
      "/product-media/engine/turbo-performance/precision-6266-turbo/3.jpg",
    ],
    description: `Precision 6266 Turbo

Precision 6266 dual ball bearing turbocharger offering a proven balance of spool and high-horsepower capability.

The Precision 6266 (PT6266) is a highly popular performance turbocharger known for its versatile balance of quick spool and strong top-end power. Featuring a CEA billet compressor wheel and available in journal or dual ball bearing configurations, the 6266 supports up to 735 horsepower and is a favorite for street and competition builds.

Specifications
• Part Type: Performance Turbocharger
• Compressor Wheel: CEA Billet
• Bearing: Dual Ball Bearing Option
• Power Capability: Up to 735 HP
• Sizing: 62mm Inducer / 66mm Exducer
• Compatibility: Universal Performance Applications
• Manufacturer: Precision

Highlights
• CEA Billet Compressor Wheel
• Balanced Spool and Top-End
• Up to 735 HP Capability
• Proven Street and Race Turbo
• Versatile Fitment Options

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 72,
    name: "External Wastegates",
    category: "engine",
    brand: "turbosmart",
    platform: "wastegates",
    price: 389,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/external-wastegates/1.webp",
    images: [
      "/product-media/engine/turbo-performance/external-wastegates/1.webp",
      "/product-media/engine/turbo-performance/external-wastegates/2.webp",
    ],
    description: `External Wastegates

Precision external wastegate providing accurate boost control for high-performance turbocharged systems.

This External Wastegate delivers precise boost control by diverting exhaust gas away from the turbine for stable, repeatable boost pressure. Constructed from billet and stainless components with interchangeable springs, it is engineered for high-boost applications where accurate control and consistency are critical.

Specifications
• Part Type: External Wastegate
• Construction: Billet Aluminum + Stainless Valve
• Springs: Interchangeable Pressure Springs
• Sizing: 38mm / 44mm Options
• Cooling: Water-Cooled Provisions
• Compatibility: Universal Turbocharged Applications
• Manufacturer: Turbosmart

Highlights
• Precise External Boost Control
• Billet and Stainless Construction
• Interchangeable Pressure Springs
• Stable Repeatable Boost
• Ideal for High-Boost Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 73,
    name: "Internal Wastegates",
    category: "engine",
    brand: "turbosmart",
    platform: "wastegates",
    price: 299,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/engine/turbo-performance/internal-wastegates/1.jpg",
    images: [
      "/product-media/engine/turbo-performance/internal-wastegates/1.jpg",
      "/product-media/engine/turbo-performance/internal-wastegates/2.jpg",
      "/product-media/engine/turbo-performance/internal-wastegates/3.jpg",
      "/product-media/engine/turbo-performance/internal-wastegates/4.jpg",
      "/product-media/engine/turbo-performance/internal-wastegates/5.jpg",
      "/product-media/engine/turbo-performance/internal-wastegates/6.jpg",
      "/product-media/engine/turbo-performance/internal-wastegates/7.jpg",
    ],
    description: `Internal Wastegates

Internal wastegate actuator engineered for reliable factory-style boost control and consistent response.

This Internal Wastegate actuator provides reliable boost control for turbochargers using an integrated wastegate port. Featuring a durable diaphragm and adjustable actuator rod, it delivers consistent actuation and stable boost pressure while retaining a compact factory-style installation.

Specifications
• Part Type: Internal Wastegate Actuator
• Construction: Billet Housing + Durable Diaphragm
• Rod: Adjustable Actuator Rod
• Pressure: Multiple Spring Ratings
• Mounting: Compact Factory-Style
• Compatibility: Internal-Gate Turbochargers
• Manufacturer: Turbosmart

Highlights
• Reliable Boost Control
• Adjustable Actuator Rod
• Consistent Actuation
• Compact Factory-Style Fit
• Durable Diaphragm Design

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 74,
    name: "ATE OEM Euro Brake Kit",
    category: "brakes",
    brand: "ate-oem-kits",
    price: 640,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/brakes/ate-oem-euro-kit/1.jpg",
    images: [
      "/product-media/brakes/ate-oem-euro-kit/1.jpg",
      "/product-media/brakes/ate-oem-euro-kit/2.jpg",
      "/product-media/brakes/ate-oem-euro-kit/3.jpg",
    ],
    description: `ATE OEM Euro Brake Kit

OEM-grade European brake kit engineered for precise pedal feel, consistent stopping power, and direct factory fitment.

The ATE OEM Euro Brake Kit delivers original-equipment braking performance for European platforms, pairing precision-machined rotors with premium friction pads for smooth, fade-resistant stops. Built to factory tolerances for a direct bolt-on fit, it restores confident pedal feel and reliable everyday performance without modification.

Specifications
• Part Type: Complete Brake Kit (Rotors + Pads)
• Rotor Construction: Precision-Machined Vented Discs
• Pad Compound: Low-Dust OEM-Grade Friction
• Fitment: Direct OEM Replacement (European Platforms)
• Hardware: Mounting Hardware Included
• Manufacturer: ATE

Highlights
• Genuine OEM-Grade Braking Feel
• Direct Bolt-On Factory Fitment
• Low-Dust, Fade-Resistant Pads
• Precision-Machined Vented Rotors
• Reliable Everyday Performance

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 75,
    name: "Brembo GT Big Brake Kit",
    category: "brakes",
    brand: "brembo-gt-kits",
    price: 2950,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/brakes/brembo-gt/1.jpg",
    images: [
      "/product-media/brakes/brembo-gt/1.jpg",
      "/product-media/brakes/brembo-gt/2.jpg",
      "/product-media/brakes/brembo-gt/3.jpg",
      "/product-media/brakes/brembo-gt/4.jpg",
      "/product-media/brakes/brembo-gt/5.jpg",
    ],
    description: `Brembo GT Big Brake Kit

High-performance Brembo GT big brake kit delivering motorsport-grade stopping power, fade resistance, and aggressive styling.

The Brembo GT Big Brake Kit is engineered for serious street and track performance, featuring multi-piston monobloc calipers, two-piece floating rotors, and high-performance pads for exceptional heat management and repeatable stopping power. Supplied as a complete bolt-on upgrade with braided lines and mounting brackets, it dramatically improves braking feel while adding the unmistakable Brembo look.

Specifications
• Part Type: Big Brake Kit (BBK)
• Calipers: Multi-Piston Monobloc Aluminum
• Rotors: Two-Piece Floating Drilled/Slotted Discs
• Pad Compound: High-Performance Street/Track
• Lines: Stainless Braided Brake Lines Included
• Manufacturer: Brembo

Highlights
• Motorsport-Grade Stopping Power
• Multi-Piston Monobloc Calipers
• Two-Piece Floating Rotors
• Superior Heat & Fade Management
• Complete Bolt-On Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 76,
    name: "Brembo OEM Brake Kit",
    category: "brakes",
    brand: "brembo-oem",
    price: 720,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/brakes/brembo-oem/1.jpg",
    images: [
      "/product-media/brakes/brembo-oem/1.jpg",
      "/product-media/brakes/brembo-oem/2.jpg",
      "/product-media/brakes/brembo-oem/3.jpg",
    ],
    description: `Brembo OEM Brake Kit

Genuine Brembo OEM-grade brake kit offering factory-matched performance, quiet operation, and direct replacement fitment.

The Brembo OEM Brake Kit provides original-equipment braking quality trusted by leading manufacturers, combining precision-cast rotors with premium low-dust pads for smooth, consistent stopping power. Engineered as a direct replacement, it restores factory braking feel and reliability with the confidence of the Brembo name.

Specifications
• Part Type: Complete Brake Kit (Rotors + Pads)
• Rotor Construction: Precision-Cast Vented Discs
• Pad Compound: Premium Low-Dust Friction
• Fitment: Direct OEM Replacement
• Hardware: Mounting Hardware Included
• Manufacturer: Brembo

Highlights
• Genuine Brembo OEM Quality
• Quiet, Low-Dust Operation
• Direct Replacement Fitment
• Consistent Factory Braking Feel
• Trusted Manufacturer Reliability

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 77,
    name: "EBC Performance Brake Kit",
    category: "brakes",
    brand: "ebc-rotors-pads",
    price: 480,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/brakes/ebc-performance/1.jpg",
    images: [
      "/product-media/brakes/ebc-performance/1.jpg",
      "/product-media/brakes/ebc-performance/2.jpg",
    ],
    description: `EBC Performance Brake Kit

EBC performance brake kit built for stronger bite, reduced fade, and dependable stopping power on street and spirited driving.

The EBC Performance Brake Kit upgrades factory braking with performance-coated rotors and EBC's renowned friction pads for improved bite, lower brake dust, and excellent resistance to fade under repeated hard stops. Designed for a direct fit, it delivers a confident, sporty pedal feel while remaining street-friendly for daily use.

Specifications
• Part Type: Performance Brake Kit (Rotors + Pads)
• Rotor Construction: Performance-Coated Vented Discs
• Pad Compound: EBC High-Friction Performance
• Fitment: Direct Bolt-On Replacement
• Hardware: Mounting Hardware Included
• Manufacturer: EBC

Highlights
• Stronger Initial Bite
• Reduced Brake Fade
• Lower Brake Dust
• Performance-Coated Rotors
• Street-Friendly Daily Use

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 78,
    name: "EBC Brake Rotors & Pads Kit",
    category: "brakes",
    brand: "ebc-rotors-pads",
    price: 520,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/brakes/ebc-rotors-pads/1.webp",
    images: [
      "/product-media/brakes/ebc-rotors-pads/1.webp",
      "/product-media/brakes/ebc-rotors-pads/2.webp",
      "/product-media/brakes/ebc-rotors-pads/3.webp",
    ],
    description: `EBC Brake Rotors & Pads Kit

Matched EBC rotors and pads kit delivering balanced performance, smooth modulation, and long-lasting braking confidence.

The EBC Brake Rotors & Pads Kit pairs precision EBC discs with matched performance pads for optimal bedding, smooth modulation, and consistent stopping power. Engineered as a complete matched set, it improves braking response and durability while keeping dust and noise low for comfortable everyday driving.

Specifications
• Part Type: Matched Rotors & Pads Kit
• Rotor Construction: Precision Vented Discs
• Pad Compound: EBC Performance Friction
• Fitment: Direct Bolt-On Replacement
• Hardware: Mounting Hardware Included
• Manufacturer: EBC

Highlights
• Matched Rotor & Pad Set
• Smooth, Consistent Modulation
• Long-Lasting Braking Confidence
• Low Dust and Noise
• Easy Direct Installation

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 79,
    name: "Wilwood Big Brake Kit",
    category: "brakes",
    brand: "wilwood-big-brake-kits",
    price: 1890,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/brakes/wilwood-big-brake/1.jpg",
    images: [
      "/product-media/brakes/wilwood-big-brake/1.jpg",
      "/product-media/brakes/wilwood-big-brake/2.jpg",
      "/product-media/brakes/wilwood-big-brake/3.jpg",
      "/product-media/brakes/wilwood-big-brake/4.jpg",
      "/product-media/brakes/wilwood-big-brake/5.jpg",
      "/product-media/brakes/wilwood-big-brake/6.jpg",
      "/product-media/brakes/wilwood-big-brake/7.jpg",
      "/product-media/brakes/wilwood-big-brake/8.jpg",
    ],
    description: `Wilwood Big Brake Kit

Wilwood big brake kit engineered for aggressive stopping power, lightweight performance, and serious track capability.

The Wilwood Big Brake Kit delivers race-proven braking performance with forged multi-piston calipers, vented and slotted rotors, and high-temperature pads for exceptional fade resistance under extreme conditions. Lightweight and built as a complete bolt-on system, it provides powerful, repeatable stops for high-performance street and track builds.

Specifications
• Part Type: Big Brake Kit (BBK)
• Calipers: Forged Multi-Piston Aluminum
• Rotors: Vented & Slotted Performance Discs
• Pad Compound: High-Temperature Performance
• Hardware: Brackets & Lines Included
• Manufacturer: Wilwood

Highlights
• Aggressive Race-Proven Stopping Power
• Forged Lightweight Calipers
• Vented & Slotted Rotors
• Superior High-Temp Fade Resistance
• Complete Bolt-On Track Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 80,
    name: "Audi DQ500 DSG Transmission",
    category: "transmission",
    brand: "audi",
    price: 4200,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/audi-dq500-dsg/1.jpg",
    images: [
      "/product-media/transmission/audi-dq500-dsg/1.jpg",
      "/product-media/transmission/audi-dq500-dsg/2.jpg",
      "/product-media/transmission/audi-dq500-dsg/3.jpg",
      "/product-media/transmission/audi-dq500-dsg/4.jpg",
      "/product-media/transmission/audi-dq500-dsg/5.jpg",
      "/product-media/transmission/audi-dq500-dsg/6.jpg",
    ],
    description: `Audi DQ500 DSG Transmission

High-torque 7-speed dual-clutch (DSG) transmission engineered for performance Audi and Volkswagen platforms.

The Audi DQ500 is a 7-speed dual-clutch gearbox built to handle high torque loads, making it the go-to choice for 2.5 TFSI and 2.0 TSI performance builds. Offering lightning-fast shifts, robust internals, and proven reliability under boost, the DQ500 delivers race-bred shifting for both quattro all-wheel-drive and front-wheel-drive applications.

Specifications
• Type: 7-Speed Dual-Clutch (DSG)
• Transmission Code: DQ500 (0BH)
• Layout: Transverse
• Torque Capacity: High-Torque Rated
• Manufacturer: Audi / VAG

Highlights
• Race-Proven Dual-Clutch Shifting
• High Torque Capacity
• Ideal for 2.5 TFSI / 2.0 TSI Builds
• quattro AWD & FWD Compatible
• Robust Performance Internals

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 81,
    name: "BMW ZF 8HP70 Transmission",
    category: "transmission",
    brand: "zf",
    price: 3800,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/bmw-zf-8hp70/1.jpg",
    images: [
      "/product-media/transmission/bmw-zf-8hp70/1.jpg",
      "/product-media/transmission/bmw-zf-8hp70/2.jpg",
      "/product-media/transmission/bmw-zf-8hp70/3.jpg",
      "/product-media/transmission/bmw-zf-8hp70/4.jpg",
      "/product-media/transmission/bmw-zf-8hp70/5.jpg",
    ],
    description: `BMW ZF 8HP70 Transmission

Smooth, fast-shifting ZF 8-speed automatic transmission trusted across BMW and performance swap builds.

The ZF 8HP70 is one of the most refined and capable automatic transmissions ever produced, delivering seamless shifts, excellent efficiency, and strong torque capacity. Found behind countless BMW inline-6 and V8 applications, it is also a favorite for modern swaps thanks to its durability and aftermarket controller support.

Specifications
• Type: 8-Speed Automatic
• Transmission Code: ZF 8HP70
• Layout: Longitudinal
• Torque Capacity: Up to ~700 Nm
• Manufacturer: ZF

Highlights
• Lightning-Fast Automatic Shifts
• Proven BMW Reliability
• Strong Torque Capacity
• Popular Swap Transmission
• Excellent Aftermarket Support

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 82,
    name: "BMW ZF 8HP90 Transmission",
    category: "transmission",
    brand: "zf",
    price: 4500,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/bmw-zf-8hp90/1.jpg",
    images: ["/product-media/transmission/bmw-zf-8hp90/1.jpg"],
    description: `BMW ZF 8HP90 Transmission

High-capacity ZF 8-speed automatic built for high-horsepower BMW M and performance applications.

The ZF 8HP90 is the high-torque evolution of the 8HP family, engineered to handle the power of BMW M and high-output V8 builds. With reinforced internals and rapid, precise shifts, the 8HP90 is the preferred automatic for serious power applications and high-torque swaps demanding strength without sacrificing refinement.

Specifications
• Type: 8-Speed Automatic
• Transmission Code: ZF 8HP90
• Layout: Longitudinal
• Torque Capacity: Up to ~1000 Nm
• Manufacturer: ZF

Highlights
• High Torque Capacity
• Reinforced Performance Internals
• Ideal for BMW M / High-HP Builds
• Fast, Precise Shifting
• Premium Swap-Ready Automatic

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 83,
    name: "Ford 10R80 Transmission",
    category: "transmission",
    brand: "ford",
    price: 3600,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/ford-10r80/1.jpg",
    images: [
      "/product-media/transmission/ford-10r80/1.jpg",
      "/product-media/transmission/ford-10r80/2.jpg",
      "/product-media/transmission/ford-10r80/3.jpg",
      "/product-media/transmission/ford-10r80/4.jpg",
      "/product-media/transmission/ford-10r80/5.jpg",
    ],
    description: `Ford 10R80 Transmission

Modern 10-speed automatic transmission delivering quick shifts and strong torque capacity for Mustang and F-150 builds.

The Ford 10R80 is a 10-speed automatic engineered for performance and towing alike, found behind the 5.0L Coyote Mustang GT and F-150. Offering closely spaced ratios, rapid shifts, and proven strength, the 10R80 is increasingly popular for modern RWD swaps that demand both efficiency and high torque handling.

Specifications
• Type: 10-Speed Automatic
• Transmission Code: 10R80
• Layout: Longitudinal
• Torque Capacity: High-Torque Rated
• Manufacturer: Ford

Highlights
• 10 Closely-Spaced Ratios
• Quick, Smooth Shifting
• Coyote Mustang & F-150 Proven
• Strong Towing & Performance Capacity
• Modern RWD Swap Favorite

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 84,
    name: "GM 4L80E Transmission",
    category: "transmission",
    brand: "gm",
    price: 2400,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/gm-4l80e/1.jpg",
    images: [
      "/product-media/transmission/gm-4l80e/1.jpg",
      "/product-media/transmission/gm-4l80e/2.jpg",
    ],
    description: `GM 4L80E Transmission

Heavy-duty GM 4-speed automatic transmission built for high-torque LS swaps, trucks, and performance builds.

The GM 4L80E is a legendary heavy-duty 4-speed automatic derived from the TH400, known for its bulletproof strength and high torque capacity. Widely used behind LS engines, big-block builds, and trucks, the 4L80E is a proven choice when maximum durability is the priority for RWD applications.

Specifications
• Type: 4-Speed Automatic (Heavy-Duty)
• Transmission Code: 4L80E
• Layout: Longitudinal
• Torque Capacity: High-Torque Rated
• Manufacturer: GM

Highlights
• Bulletproof Heavy-Duty Design
• Ideal for LS & Big-Block Swaps
• Proven Truck & Performance Use
• High Torque Capacity
• Simple, Reliable Electronics

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 85,
    name: "GM 6L80 Transmission",
    category: "transmission",
    brand: "gm",
    price: 2600,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/gm-6l80/1.jpg",
    images: [
      "/product-media/transmission/gm-6l80/1.jpg",
      "/product-media/transmission/gm-6l80/2.jpg",
      "/product-media/transmission/gm-6l80/3.jpg",
      "/product-media/transmission/gm-6l80/4.jpg",
    ],
    description: `GM 6L80 Transmission

Versatile GM 6-speed automatic transmission offering smooth shifts and strong capacity for LS and LT swaps.

The GM 6L80 is a 6-speed automatic that pairs modern shift quality with strong torque capacity, found behind LS and LT engines in Camaro, Silverado, and Corvette platforms. A popular upgrade over older 4-speed units, the 6L80 delivers better efficiency and drivability while remaining swap-friendly for RWD builds.

Specifications
• Type: 6-Speed Automatic
• Transmission Code: 6L80
• Layout: Longitudinal
• Torque Capacity: High-Torque Rated
• Manufacturer: GM

Highlights
• Smooth 6-Speed Shifting
• Ideal for LS / LT Swaps
• Better Efficiency vs. 4-Speed Units
• Strong Torque Capacity
• Widely Supported Aftermarket

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 86,
    name: "Mercedes 722.9 Transmission",
    category: "transmission",
    brand: "mercedes-benz",
    price: 3200,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/mercedes-722-9/1.jpg",
    images: [
      "/product-media/transmission/mercedes-722-9/1.jpg",
      "/product-media/transmission/mercedes-722-9/2.jpg",
      "/product-media/transmission/mercedes-722-9/3.jpg",
      "/product-media/transmission/mercedes-722-9/4.jpg",
    ],
    description: `Mercedes 722.9 Transmission

Refined Mercedes-Benz 7G-Tronic 7-speed automatic transmission delivering smooth, luxurious shifting.

The Mercedes-Benz 722.9 (7G-Tronic) is a 7-speed automatic renowned for its smooth, refined shifts and broad application across the Mercedes lineup. Engineered for comfort and durability, it suits both rear-wheel-drive and 4MATIC all-wheel-drive platforms, making it a dependable replacement or swap option for Mercedes builds.

Specifications
• Type: 7-Speed Automatic (7G-Tronic)
• Transmission Code: 722.9
• Layout: Longitudinal
• Torque Capacity: High-Torque Rated
• Manufacturer: Mercedes-Benz

Highlights
• Smooth 7-Speed Shifting
• Refined Luxury Drivability
• RWD & 4MATIC Compatible
• Proven Mercedes Reliability
• Broad Platform Application

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 87,
    name: "Nissan CD009 6-Speed Transmission",
    category: "transmission",
    brand: "nissan",
    price: 2900,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/nissan-cd009-6-speed/1.jpg",
    images: [
      "/product-media/transmission/nissan-cd009-6-speed/1.jpg",
      "/product-media/transmission/nissan-cd009-6-speed/2.jpg",
      "/product-media/transmission/nissan-cd009-6-speed/3.jpg",
      "/product-media/transmission/nissan-cd009-6-speed/4.jpg",
      "/product-media/transmission/nissan-cd009-6-speed/5.jpg",
      "/product-media/transmission/nissan-cd009-6-speed/6.jpg",
      "/product-media/transmission/nissan-cd009-6-speed/7.jpg",
      "/product-media/transmission/nissan-cd009-6-speed/8.jpg",
      "/product-media/transmission/nissan-cd009-6-speed/9.jpg",
    ],
    description: `Nissan CD009 6-Speed Transmission

Strong, swap-friendly Nissan 6-speed manual transmission popular for high-horsepower builds.

The Nissan CD009 is a 6-speed manual transmission from the 350Z/370Z (VQ) platform, prized for its strength and affordability as a swap gearbox. Commonly adapted behind LS, 2JZ, and other high-torque engines, the CD009 offers durable synchros and a robust case, making it a staple of the performance swap community for RWD builds.

Specifications
• Type: 6-Speed Manual
• Transmission Code: CD009
• Layout: Longitudinal
• Torque Capacity: High-Torque Rated
• Manufacturer: Nissan

Highlights
• Strong, Affordable Swap Gearbox
• Popular Behind LS / 2JZ Builds
• Durable Synchros & Case
• Huge Adapter Support
• Performance Community Favorite

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 88,
    name: "Toyota R154 Transmission",
    category: "transmission",
    brand: "toyota",
    price: 3500,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/toyota-r154/1.jpg",
    images: [
      "/product-media/transmission/toyota-r154/1.jpg",
      "/product-media/transmission/toyota-r154/2.jpg",
      "/product-media/transmission/toyota-r154/3.jpg",
      "/product-media/transmission/toyota-r154/4.jpg",
      "/product-media/transmission/toyota-r154/5.jpg",
      "/product-media/transmission/toyota-r154/6.jpg",
      "/product-media/transmission/toyota-r154/7.jpg",
    ],
    description: `Toyota R154 Transmission

Legendary Toyota 5-speed manual transmission renowned for its strength behind turbocharged inline-6 engines.

The Toyota R154 is a 5-speed manual transmission famous for its durability behind the 1JZ and 2JZ engines in the Supra MK3 and Soarer. Capable of handling substantial torque, the R154 is a favorite for RWD performance and swap builds where a strong, proven manual gearbox is essential.

Specifications
• Type: 5-Speed Manual
• Transmission Code: R154
• Layout: Longitudinal
• Torque Capacity: High-Torque Rated
• Manufacturer: Toyota

Highlights
• Legendary Strength Behind 1JZ / 2JZ
• Proven Supra MK3 Heritage
• Durable Performance Manual
• Popular RWD Swap Gearbox
• Strong Aftermarket Support

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 89,
    name: "Toyota V160 Transmission",
    category: "transmission",
    brand: "toyota",
    price: 5200,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/toyota-v160/1.jpg",
    images: [
      "/product-media/transmission/toyota-v160/1.jpg",
      "/product-media/transmission/toyota-v160/2.jpg",
      "/product-media/transmission/toyota-v160/3.jpg",
      "/product-media/transmission/toyota-v160/4.jpg",
      "/product-media/transmission/toyota-v160/5.jpg",
    ],
    description: `Toyota V160 Transmission

Highly sought-after Getrag-built 6-speed manual transmission from the legendary Toyota Supra MK4.

The Toyota V160 is a Getrag-built 6-speed manual transmission originally fitted to the MK4 Supra, prized for its exceptional strength and precise shift feel. One of the most desirable performance gearboxes ever produced, the V160 reliably handles big power and remains a premium choice for serious 2JZ RWD builds.

Specifications
• Type: 6-Speed Manual (Getrag)
• Transmission Code: V160
• Layout: Longitudinal
• Torque Capacity: Very High
• Manufacturer: Toyota / Getrag

Highlights
• Legendary Supra MK4 Gearbox
• Exceptional Strength & Shift Feel
• Handles Big-Power 2JZ Builds
• Highly Collectible & Sought-After
• Premium Performance Manual

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 90,
    name: "Transmission Cooler Kit",
    category: "transmission",
    brand: "universal",
    price: 320,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/transmission-cooler-kit/1.jpg",
    images: [
      "/product-media/transmission/transmission-cooler-kit/1.jpg",
      "/product-media/transmission/transmission-cooler-kit/2.jpg",
    ],
    description: `Transmission Cooler Kit

Universal external transmission cooler kit that lowers ATF temperatures and extends transmission life.

This Transmission Cooler Kit helps protect automatic transmissions from heat-related wear by lowering fluid temperatures under towing, track, and high-load conditions. Featuring an efficient cooler core and complete mounting hardware, it is a simple, effective upgrade for any build that demands consistent transmission performance and longevity.

Specifications
• Type: External ATF Cooler Kit
• Fitment: Universal
• Core: High-Efficiency Cooler
• Hardware: Mounting & Line Hardware Included
• Manufacturer: Universal

Highlights
• Lowers ATF Temperatures
• Extends Transmission Life
• Ideal for Towing & Track Use
• Universal Bolt-On Fitment
• Complete Mounting Hardware

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 91,
    name: "Transmission Rebuild Kit",
    category: "transmission",
    brand: "universal",
    price: 680,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/transmission-rebuild-kit/1.jpg",
    images: [
      "/product-media/transmission/transmission-rebuild-kit/1.jpg",
      "/product-media/transmission/transmission-rebuild-kit/2.jpg",
    ],
    description: `Transmission Rebuild Kit

Comprehensive transmission rebuild kit with the clutches, seals, gaskets, and filter needed to restore performance.

This Transmission Rebuild Kit provides the essential components to refresh and restore an automatic transmission to like-new operation. Including friction clutches, steels, seals, gaskets, and a filter, it is the foundation of a reliable rebuild for restoring smooth, dependable shifting. Confirm your transmission model at checkout for correct fitment.

Specifications
• Type: Automatic Transmission Rebuild Kit
• Includes: Clutches, Seals, Gaskets, Filter
• Fitment: Application-Specific
• Quality: OE-Grade Components
• Manufacturer: Universal

Highlights
• Complete Overhaul Components
• OE-Grade Friction & Seals
• Restores Smooth Shifting
• Foundation for a Reliable Rebuild
• Cost-Effective Transmission Refresh

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 92,
    name: "Tremec T56 Magnum Transmission",
    category: "transmission",
    brand: "tremec",
    price: 3300,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/tremec-t56-magnum/1.jpg",
    images: ["/product-media/transmission/tremec-t56-magnum/1.jpg"],
    description: `Tremec T56 Magnum Transmission

High-strength Tremec 6-speed manual transmission engineered for high-horsepower performance and swap builds.

The Tremec T56 Magnum is a 6-speed manual transmission built to handle serious power, with a torque capacity rated up to 700 lb-ft. Featuring robust gears and triple-cone synchros, it is the gold standard for RWD performance and swap applications across GM, Ford, and custom builds demanding strength and precise shifting.

Specifications
• Type: 6-Speed Manual
• Transmission Code: T56 Magnum
• Layout: Longitudinal
• Torque Capacity: Up to 700 lb-ft
• Manufacturer: Tremec

Highlights
• Up to 700 lb-ft Capacity
• Triple-Cone Synchros
• Gold Standard Performance Manual
• Ideal for GM / Ford / Custom Swaps
• Precise, Durable Shifting

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 93,
    name: "Tremec TR6060 Transmission",
    category: "transmission",
    brand: "tremec",
    price: 3100,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/tremec-tr6060/1.jpg",
    images: [
      "/product-media/transmission/tremec-tr6060/1.jpg",
      "/product-media/transmission/tremec-tr6060/2.jpg",
      "/product-media/transmission/tremec-tr6060/3.jpg",
      "/product-media/transmission/tremec-tr6060/4.jpg",
      "/product-media/transmission/tremec-tr6060/5.jpg",
      "/product-media/transmission/tremec-tr6060/6.jpg",
      "/product-media/transmission/tremec-tr6060/7.jpg",
      "/product-media/transmission/tremec-tr6060/8.jpg",
      "/product-media/transmission/tremec-tr6060/9.jpg",
      "/product-media/transmission/tremec-tr6060/10.jpg",
      "/product-media/transmission/tremec-tr6060/11.jpg",
      "/product-media/transmission/tremec-tr6060/12.jpg",
    ],
    description: `Tremec TR6060 Transmission

Factory-grade Tremec 6-speed manual transmission found behind modern American performance V8s.

The Tremec TR6060 is a 6-speed manual transmission fitted from the factory to high-performance platforms including the Camaro SS, Mustang GT, Challenger, and Viper. Offering strong torque capacity, refined shift quality, and proven durability, the TR6060 is an excellent choice for RWD performance and swap builds requiring an OEM-grade manual.

Specifications
• Type: 6-Speed Manual
• Transmission Code: TR6060
• Layout: Longitudinal
• Torque Capacity: High-Torque Rated
• Manufacturer: Tremec

Highlights
• Factory-Fitted Performance Manual
• Camaro / Mustang / Challenger Proven
• Strong Torque Capacity
• Refined Shift Quality
• Durable OEM-Grade Build

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 94,
    name: "ZF 8HP Swap Package",
    category: "transmission",
    brand: "zf",
    price: 5400,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/transmission/zf-8hp-swap-package/1.jpg",
    images: [
      "/product-media/transmission/zf-8hp-swap-package/1.jpg",
      "/product-media/transmission/zf-8hp-swap-package/2.jpg",
      "/product-media/transmission/zf-8hp-swap-package/3.jpg",
      "/product-media/transmission/zf-8hp-swap-package/4.jpg",
    ],
    description: `ZF 8HP Swap Package

Complete ZF 8-speed automatic swap package with the transmission and control hardware needed for a modern conversion.

The ZF 8HP Swap Package bundles the renowned ZF 8HP automatic with the standalone control hardware required to run it in a swap build. Combining lightning-fast shifts, broad torque capacity, and plug-and-play control support, this package is the complete solution for upgrading to a modern 8-speed automatic in performance and custom RWD applications.

Specifications
• Type: 8-Speed Automatic Swap Package
• Transmission Code: ZF 8HP
• Layout: Longitudinal
• Includes: Standalone Controller Support
• Manufacturer: ZF

Highlights
• Complete Swap-Ready Package
• Standalone Control Hardware
• Lightning-Fast Automatic Shifts
• Broad Torque Capacity
• Modern 8-Speed Conversion Solution

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 95,
    name: "Audi RS3 Hybrid Turbo",
    category: "turbocharger",
    brand: "audi",
    price: 2199,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/turbocharger/audi-rs3-hybrid-turbo/1.jpg",
    images: [
      "/product-media/turbocharger/audi-rs3-hybrid-turbo/1.jpg",
      "/product-media/turbocharger/audi-rs3-hybrid-turbo/2.jpg",
      "/product-media/turbocharger/audi-rs3-hybrid-turbo/3.jpg",
      "/product-media/turbocharger/audi-rs3-hybrid-turbo/4.jpg",
      "/product-media/turbocharger/audi-rs3-hybrid-turbo/5.jpg",
      "/product-media/turbocharger/audi-rs3-hybrid-turbo/6.jpg",
      "/product-media/turbocharger/audi-rs3-hybrid-turbo/7.jpg",
      "/product-media/turbocharger/audi-rs3-hybrid-turbo/8.jpg",
      "/product-media/turbocharger/audi-rs3-hybrid-turbo/9.jpg",
    ],
    description: `Audi RS3 Hybrid Turbo

High-flow hybrid turbo upgrade for Audi RS3 and TT RS 2.5 TFSI platforms, delivering more power while retaining factory fitment.

The Audi RS3 Hybrid Turbo replaces the factory unit with uprated billet compressor and turbine components to increase airflow and boost capacity on the legendary 2.5 TFSI five-cylinder. Engineered as a direct-fit upgrade, it delivers stronger mid-range and top-end power with OEM-style reliability and a clean bolt-on installation.

Specifications
• Type: Hybrid Turbocharger Upgrade
• Platform: Audi 2.5 TFSI (RS3 / TT RS)
• Compressor Wheel: Uprated Billet
• Fitment: OEM-Style Direct Replacement
• Power Gain: Application Dependent
• Manufacturer: Audi Performance

Highlights
• Uprated Billet Compressor
• Retains Factory Fitment
• Strong Mid-Range Gains
• Ideal for RS3 / TT RS Builds
• Direct Bolt-On Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 96,
    name: "BMW B58 Hybrid Turbo",
    category: "turbocharger",
    brand: "bmw",
    price: 2299,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/turbocharger/bmw-b58-hybrid-turbo/1.jpg",
    images: [
      "/product-media/turbocharger/bmw-b58-hybrid-turbo/1.jpg",
      "/product-media/turbocharger/bmw-b58-hybrid-turbo/2.jpg",
      "/product-media/turbocharger/bmw-b58-hybrid-turbo/3.jpg",
    ],
    description: `BMW B58 Hybrid Turbo

Hybrid turbo upgrade for BMW B58 TwinPower platforms, increasing flow and power while maintaining factory-style fitment.

The BMW B58 Hybrid Turbo upgrades the factory twin-scroll unit with uprated billet internals to support higher boost and horsepower on modern BMW inline-six builds. Designed as a direct replacement, it improves response and top-end flow without major fabrication, making it a popular upgrade for street and track B58 applications.

Specifications
• Type: Hybrid Turbocharger Upgrade
• Platform: BMW B58 TwinPower
• Compressor Wheel: Uprated Billet
• Fitment: OEM-Style Direct Replacement
• Power Gain: Application Dependent
• Manufacturer: BMW Performance

Highlights
• Uprated Billet Internals
• Retains Factory Fitment
• Improved Boost Response
• Strong Top-End Flow
• Direct Replacement Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 97,
    name: "BMW N54 Hybrid Turbo Kit",
    category: "turbocharger",
    brand: "bmw",
    price: 2499,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/turbocharger/bmw-n54-hybrid-turbo-kit/1.jpg",
    images: [
      "/product-media/turbocharger/bmw-n54-hybrid-turbo-kit/1.jpg",
      "/product-media/turbocharger/bmw-n54-hybrid-turbo-kit/2.jpg",
      "/product-media/turbocharger/bmw-n54-hybrid-turbo-kit/3.jpg",
      "/product-media/turbocharger/bmw-n54-hybrid-turbo-kit/4.jpg",
      "/product-media/turbocharger/bmw-n54-hybrid-turbo-kit/5.jpg",
      "/product-media/turbocharger/bmw-n54-hybrid-turbo-kit/6.jpg",
      "/product-media/turbocharger/bmw-n54-hybrid-turbo-kit/7.jpg",
    ],
    description: `BMW N54 Hybrid Turbo Kit

Complete hybrid turbo kit for BMW N54 twin-turbo platforms, delivering increased flow and power with factory-style fitment.

The BMW N54 Hybrid Turbo Kit upgrades both factory turbos with uprated billet compressor and turbine components to support higher boost and horsepower on the legendary N54 inline-six. Supplied as a matched pair with supporting hardware, it is engineered for a clean direct-replacement installation on popular BMW performance platforms.

Specifications
• Type: Hybrid Twin-Turbo Kit
• Platform: BMW N54 Twin-Turbo
• Compressor Wheel: Uprated Billet
• Fitment: OEM-Style Direct Replacement
• Power Gain: Application Dependent
• Manufacturer: BMW Performance

Highlights
• Matched Hybrid Turbo Pair
• Uprated Billet Internals
• Retains Factory Fitment
• Strong Mid-Range and Top-End Gains
• Complete Kit Hardware

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 98,
    name: "BorgWarner EFR 7163",
    category: "turbocharger",
    brand: "borgwarner",
    price: 1899,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/turbocharger/borgwarner-efr-7163/1.jpg",
    images: [
      "/product-media/turbocharger/borgwarner-efr-7163/1.jpg",
      "/product-media/turbocharger/borgwarner-efr-7163/2.jpg",
      "/product-media/turbocharger/borgwarner-efr-7163/3.jpg",
      "/product-media/turbocharger/borgwarner-efr-7163/4.jpg",
      "/product-media/turbocharger/borgwarner-efr-7163/5.jpg",
      "/product-media/turbocharger/borgwarner-efr-7163/6.jpg",
      "/product-media/turbocharger/borgwarner-efr-7163/7.jpg",
      "/product-media/turbocharger/borgwarner-efr-7163/8.jpg",
      "/product-media/turbocharger/borgwarner-efr-7163/9.jpg",
      "/product-media/turbocharger/borgwarner-efr-7163/10.jpg",
    ],
    description: `BorgWarner EFR 7163

Advanced BorgWarner EFR 7163 turbocharger combining Gamma-Ti turbine technology with rapid spool and high-flow performance.

The BorgWarner EFR 7163 is part of the Engineered For Racing series, featuring a lightweight Gamma-Ti turbine wheel, dual-row ceramic ball bearing cartridge, and integrated boost control provisions. Delivering exceptional response and consistent high-rpm flow, the EFR 7163 is ideal for serious street and motorsport builds targeting strong power with fast spool.

Specifications
• Type: EFR Ball Bearing Turbocharger
• Model: EFR 7163
• Turbine: Gamma-Ti Lightweight Wheel
• Bearing: Dual-Row Ceramic Ball Bearing
• Compatibility: Universal Performance Applications
• Manufacturer: BorgWarner

Highlights
• Gamma-Ti Turbine Technology
• Fast Spool and High Flow
• Ceramic Ball Bearing Cartridge
• Integrated Boost Control Provisions
• Proven EFR Performance

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 99,
    name: "BorgWarner EFR 7670",
    category: "turbocharger",
    brand: "borgwarner",
    price: 2499,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/turbocharger/borgwarner-efr-7670/1.jpg",
    images: [
      "/product-media/turbocharger/borgwarner-efr-7670/1.jpg",
      "/product-media/turbocharger/borgwarner-efr-7670/2.jpg",
    ],
    description: `BorgWarner EFR 7670

High-flow BorgWarner EFR 7670 turbocharger built for big-power performance with advanced Gamma-Ti turbine technology.

The BorgWarner EFR 7670 is a larger-frame EFR unit engineered for builds targeting higher horsepower while maintaining the fast spool characteristics the EFR series is known for. Featuring a Gamma-Ti turbine wheel and ceramic ball bearing cartridge, it delivers strong top-end airflow and proven reliability for serious performance applications.

Specifications
• Type: EFR Ball Bearing Turbocharger
• Model: EFR 7670
• Turbine: Gamma-Ti Lightweight Wheel
• Bearing: Dual-Row Ceramic Ball Bearing
• Compatibility: Universal Performance Applications
• Manufacturer: BorgWarner

Highlights
• High-Flow EFR Frame
• Gamma-Ti Turbine Technology
• Strong Top-End Airflow
• Ceramic Ball Bearing Cartridge
• Ideal for Big-Power Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 100,
    name: "Front Mount Intercooler Kit",
    category: "turbocharger",
    brand: "universal",
    price: 749,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/turbocharger/front-mount-intercooler-kit/1.jpg",
    images: [
      "/product-media/turbocharger/front-mount-intercooler-kit/1.jpg",
      "/product-media/turbocharger/front-mount-intercooler-kit/2.jpg",
      "/product-media/turbocharger/front-mount-intercooler-kit/3.jpg",
    ],
    description: `Front Mount Intercooler Kit

Front-mount intercooler kit engineered to reduce intake temperatures and sustain consistent boost performance.

This Front Mount Intercooler (FMIC) Kit upgrades the factory cooling system with a high-capacity bar-and-plate core and mandrel-bent piping to reduce intake air temperatures and prevent heat soak under sustained boost. Engineered for efficient cooling and minimal pressure drop, it is a core upgrade for reliable turbocharged power.

Specifications
• Type: Front Mount Intercooler Kit
• Core: Bar-and-Plate High-Capacity
• Piping: Mandrel-Bent Aluminum
• Couplers: Silicone Couplers + Clamps Included
• Compatibility: Application-Specific Fitment
• Manufacturer: Universal

Highlights
• High-Capacity Bar-and-Plate Core
• Reduced Intake Air Temperatures
• Prevents Heat Soak Under Boost
• Complete Piping and Coupler Kit
• Sustains Consistent Boost

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 101,
    name: "Garrett GTX3076R Gen II",
    category: "turbocharger",
    brand: "garrett",
    price: 1599,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/turbocharger/garrett-gtx3076r-gen-ii/1.jpg",
    images: [
      "/product-media/turbocharger/garrett-gtx3076r-gen-ii/1.jpg",
      "/product-media/turbocharger/garrett-gtx3076r-gen-ii/2.jpg",
      "/product-media/turbocharger/garrett-gtx3076r-gen-ii/3.jpg",
      "/product-media/turbocharger/garrett-gtx3076r-gen-ii/4.jpg",
      "/product-media/turbocharger/garrett-gtx3076r-gen-ii/5.jpg",
    ],
    description: `Garrett GTX3076R Gen II

Garrett GTX3076R Gen II turbocharger delivering proven high-flow performance and strong mid-range response.

The Garrett GTX3076R Gen II features a forged fully-machined billet compressor wheel and dual ball bearing cartridge for fast spool and high-rpm flow. One of the most popular performance turbochargers available, it balances rapid response with strong top-end power, making it ideal for street and track builds targeting up to 650 horsepower.

Specifications
• Type: Ball Bearing Turbocharger (Gen II)
• Model: GTX3076R Gen II
• Compressor Wheel: Forged Billet
• Bearing: Dual Ball Bearing Cartridge
• Power Capability: Up to 650 HP
• Manufacturer: Garrett

Highlights
• Gen II Forged Billet Compressor
• Dual Ball Bearing Cartridge
• Fast Spool and High-Flow
• Proven Garrett GTX Performance
• Ideal for Street and Track

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 102,
    name: "Garrett GTX3582R Gen II",
    category: "turbocharger",
    brand: "garrett",
    price: 1899,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/turbocharger/garrett-gtx3582r-gen-ii/1.jpg",
    images: [
      "/product-media/turbocharger/garrett-gtx3582r-gen-ii/1.jpg",
      "/product-media/turbocharger/garrett-gtx3582r-gen-ii/2.jpg",
      "/product-media/turbocharger/garrett-gtx3582r-gen-ii/3.jpg",
      "/product-media/turbocharger/garrett-gtx3582r-gen-ii/4.jpg",
      "/product-media/turbocharger/garrett-gtx3582r-gen-ii/5.jpg",
      "/product-media/turbocharger/garrett-gtx3582r-gen-ii/6.jpg",
    ],
    description: `Garrett GTX3582R Gen II

Garrett GTX3582R Gen II turbocharger built for high-horsepower performance with strong top-end flow.

The Garrett GTX3582R Gen II is a larger-frame performance turbocharger designed for builds targeting higher horsepower while maintaining usable response. Featuring a forged billet Gen II compressor wheel and dual ball bearing cartridge, it delivers excellent high-rpm airflow and proven reliability for serious street and track applications up to 770 horsepower.

Specifications
• Type: Ball Bearing Turbocharger (Gen II)
• Model: GTX3582R Gen II
• Compressor Wheel: Forged Billet
• Bearing: Dual Ball Bearing Cartridge
• Power Capability: Up to 770 HP
• Manufacturer: Garrett

Highlights
• Gen II Forged Billet Compressor
• High-Horsepower Capability
• Strong Top-End Airflow
• Proven Garrett GTX Reliability
• Ideal for Big-Power Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 103,
    name: "Precision 6266",
    category: "turbocharger",
    brand: "precision",
    price: 1649,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/turbocharger/precision-6266/1.jpg",
    images: ["/product-media/turbocharger/precision-6266/1.jpg"],
    description: `Precision 6266

Precision 6266 dual ball bearing turbocharger offering a proven balance of spool and high-horsepower capability.

The Precision 6266 (PT6266) is a highly popular performance turbocharger known for its versatile balance of quick spool and strong top-end power. Featuring a CEA billet compressor wheel and dual ball bearing configuration, the 6266 supports up to 735 horsepower and is a favorite for street and competition builds.

Specifications
• Type: Performance Turbocharger
• Model: PT6266
• Compressor Wheel: CEA Billet
• Bearing: Dual Ball Bearing
• Power Capability: Up to 735 HP
• Manufacturer: Precision

Highlights
• CEA Billet Compressor Wheel
• Balanced Spool and Top-End
• Up to 735 HP Capability
• Proven Street and Race Turbo
• Versatile Fitment Options

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 104,
    name: "Precision 6466",
    category: "turbocharger",
    brand: "precision",
    price: 1749,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/turbocharger/precision-6466/1.jpg",
    images: ["/product-media/turbocharger/precision-6466/1.jpg"],
    description: `Precision 6466

Precision 6466 performance turbocharger delivering increased flow for high-horsepower street and track builds.

The Precision 6466 (PT6466) steps up from the 6266 with a larger CEA billet compressor wheel for increased airflow and power capability. Featuring dual ball bearing technology, it supports builds targeting up to 800 horsepower while maintaining usable spool characteristics for serious performance applications.

Specifications
• Type: Performance Turbocharger
• Model: PT6466
• Compressor Wheel: CEA Billet
• Bearing: Dual Ball Bearing
• Power Capability: Up to 800 HP
• Manufacturer: Precision

Highlights
• Larger CEA Billet Compressor
• Increased Airflow vs. 6266
• Up to 800 HP Capability
• Dual Ball Bearing Technology
• Ideal for High-Power Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 105,
    name: "Precision 6870",
    category: "turbocharger",
    brand: "precision",
    price: 2299,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/turbocharger/precision-6870/1.jpg",
    images: [
      "/product-media/turbocharger/precision-6870/1.jpg",
      "/product-media/turbocharger/precision-6870/2.jpg",
      "/product-media/turbocharger/precision-6870/3.jpg",
      "/product-media/turbocharger/precision-6870/4.jpg",
      "/product-media/turbocharger/precision-6870/5.jpg",
      "/product-media/turbocharger/precision-6870/6.jpg",
    ],
    description: `Precision 6870

Precision 6870 high-flow turbocharger built for maximum horsepower with proven CEA billet technology.

The Precision 6870 (PT6870) is a larger-frame performance turbocharger designed for builds targeting the highest power levels while maintaining the response Precision turbos are known for. Featuring a CEA billet compressor wheel and dual ball bearing cartridge, it supports up to 900 horsepower for serious street, drag, and competition applications.

Specifications
• Type: High-Flow Performance Turbocharger
• Model: PT6870
• Compressor Wheel: CEA Billet
• Bearing: Dual Ball Bearing
• Power Capability: Up to 900 HP
• Manufacturer: Precision

Highlights
• High-Flow CEA Billet Compressor
• Up to 900 HP Capability
• Dual Ball Bearing Cartridge
• Proven Precision Reliability
• Ideal for Maximum Power Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 106,
    name: "Universal T4 Turbo Kit",
    category: "turbocharger",
    brand: "universal",
    price: 1299,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/turbocharger/universal-t4-turbo-kit/1.jpg",
    images: [
      "/product-media/turbocharger/universal-t4-turbo-kit/1.jpg",
      "/product-media/turbocharger/universal-t4-turbo-kit/2.jpg",
      "/product-media/turbocharger/universal-t4-turbo-kit/3.jpg",
      "/product-media/turbocharger/universal-t4-turbo-kit/4.jpg",
    ],
    description: `Universal T4 Turbo Kit

Complete universal T4 turbo kit with the core components needed for a reliable forced-induction upgrade.

The Universal T4 Turbo Kit includes a T4-flange turbocharger, manifold, downpipe, wastegate, and supporting oil lines and hardware for a comprehensive bolt-on forced-induction upgrade. Engineered as a matched system for consistent boost delivery, it is ideal for enthusiasts building custom or swap applications targeting reliable turbocharged power.

Specifications
• Type: Universal T4 Turbo Kit
• Flange: T4 Turbo Inlet
• Includes: Turbo, Manifold, Downpipe, Wastegate
• Oil Lines: Feed/Drain Lines Included
• Compatibility: Universal Performance Applications
• Manufacturer: Universal

Highlights
• Complete Matched Turbo System
• T4 Flange Compatibility
• Includes Manifold and Downpipe
• Wastegate and Oil Lines Included
• Ideal for Custom Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 107,
    name: "Adjustable Front Control Arm",
    category: "suspension",
    brand: "whiteline",
    price: 420,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/adjustable-front-control-arms/1.jpg",
    images: [
      "/product-media/suspension/adjustable-front-control-arms/1.jpg",
      "/product-media/suspension/adjustable-front-control-arms/2.jpg",
      "/product-media/suspension/adjustable-front-control-arms/3.jpg",
      "/product-media/suspension/adjustable-front-control-arms/4.jpg",
    ],
    description: `Adjustable Front Control Arm

Heavy-duty adjustable front control arms engineered for precise alignment, improved handling, and lowered or performance suspension setups.

These adjustable front control arms restore proper suspension geometry on lowered or modified vehicles, allowing camber and caster correction for sharper turn-in and even tire wear. Built with reinforced bushings and durable hardware, they deliver a direct bolt-on upgrade for street, track, and show builds that demand accurate alignment.

Specifications
• Part Type: Adjustable Front Control Arms
• Adjustment: Camber / Caster Correction
• Construction: Reinforced Steel Arms
• Bushings: Performance Polyurethane / Spherical Options
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Whiteline

Highlights
• Restores Lowered-Vehicle Geometry
• Precise Camber & Caster Adjustment
• Improved Turn-In and Grip
• Durable Reinforced Construction
• Direct Bolt-On Installation

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 108,
    name: "Air Lift Performance 3H Kit",
    category: "suspension",
    brand: "air-lift-performance",
    price: 3499,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/air-lift-performance-3h-kit/1.jpg",
    images: [
      "/product-media/suspension/air-lift-performance-3h-kit/1.jpg",
      "/product-media/suspension/air-lift-performance-3h-kit/2.jpg",
      "/product-media/suspension/air-lift-performance-3h-kit/3.jpg",
      "/product-media/suspension/air-lift-performance-3h-kit/4.jpg",
      "/product-media/suspension/air-lift-performance-3h-kit/5.jpg",
      "/product-media/suspension/air-lift-performance-3h-kit/6.jpg",
      "/product-media/suspension/air-lift-performance-3h-kit/7.jpg",
      "/product-media/suspension/air-lift-performance-3h-kit/8.jpg",
      "/product-media/suspension/air-lift-performance-3h-kit/9.jpg",
      "/product-media/suspension/air-lift-performance-3h-kit/10.jpg",
    ],
    description: `Air Lift Performance 3H Kit

Premium Air Lift 3H air management system with height and pressure control for show-quality stance and daily drivability.

The Air Lift Performance 3H Kit combines dual-path air management with Bluetooth control, allowing independent front and rear height and pressure adjustment from your phone. Engineered for reliability and fast response, it delivers the smooth ride and dramatic stance adjustment air suspension enthusiasts expect on modern performance builds.

Specifications
• Part Type: Air Management System (3H)
• Control: Bluetooth App + Manual Controller
• Valves: Dual-Path Fast-Fill System
• Tank: Application-Matched Air Tank
• Fitment: Universal Air Suspension Setup
• Manufacturer: Air Lift Performance

Highlights
• Bluetooth Height & Pressure Control
• Dual-Path Fast Air Management
• Show-Quality Stance Adjustment
• Smooth Daily Driving Ride
• Complete 3H Management System

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 109,
    name: "Air Lift Performance 3P Kit",
    category: "suspension",
    brand: "air-lift-performance",
    price: 2799,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/air-lift-performance-3p-kit/1.jpg",
    images: [
      "/product-media/suspension/air-lift-performance-3p-kit/1.jpg",
      "/product-media/suspension/air-lift-performance-3p-kit/2.jpg",
      "/product-media/suspension/air-lift-performance-3p-kit/3.jpg",
      "/product-media/suspension/air-lift-performance-3p-kit/4.jpg",
      "/product-media/suspension/air-lift-performance-3p-kit/5.jpg",
      "/product-media/suspension/air-lift-performance-3p-kit/6.jpg",
      "/product-media/suspension/air-lift-performance-3p-kit/7.jpg",
      "/product-media/suspension/air-lift-performance-3p-kit/8.jpg",
    ],
    description: `Air Lift Performance 3P Kit

Air Lift 3P pressure-based management system delivering precise ride height control with a clean, reliable setup.

The Air Lift Performance 3P Kit provides advanced pressure-based air management with digital control for consistent ride height at any load. Ideal for enthusiasts who want dependable stance adjustment without the full 3H feature set, it offers fast fill, smooth ride quality, and straightforward integration with Air Lift struts and bags.

Specifications
• Part Type: Air Management System (3P)
• Control: Digital Pressure-Based Controller
• Valves: Fast-Fill Solenoid System
• Tank: Application-Matched Air Tank
• Fitment: Universal Air Suspension Setup
• Manufacturer: Air Lift Performance

Highlights
• Pressure-Based Height Control
• Fast, Reliable Air Management
• Smooth Ride at Any Height
• Digital Controller Included
• Ideal for Stance & Show Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 110,
    name: "BC Racing BR Series Coilovers",
    category: "suspension",
    brand: "bc-racing",
    price: 1199,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/bc-racing-br-series-coilovers/1.jpg",
    images: [
      "/product-media/suspension/bc-racing-br-series-coilovers/1.jpg",
      "/product-media/suspension/bc-racing-br-series-coilovers/2.jpg",
      "/product-media/suspension/bc-racing-br-series-coilovers/3.jpg",
      "/product-media/suspension/bc-racing-br-series-coilovers/4.jpg",
      "/product-media/suspension/bc-racing-br-series-coilovers/5.jpg",
    ],
    description: `BC Racing BR Series Coilovers

BC Racing BR Series coilover kit offering adjustable damping, ride height control, and strong value for street and track use.

The BC Racing BR Series Coilovers feature monotube shock bodies with 30-click damping adjustment and threaded ride height collars for precise lowering. Built for enthusiasts who want coilover performance without a premium price tag, they deliver improved handling, reduced body roll, and a clean, aggressive stance.

Specifications
• Part Type: Coilover Suspension Kit
• Series: BR (Street / Track)
• Damping: 30-Click Rebound Adjustment
• Ride Height: Threaded Collar Adjustment
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: BC Racing

Highlights
• 30-Click Damping Adjustment
• Threaded Ride Height Control
• Monotube Shock Design
• Improved Handling & Stance
• Strong Street/Track Value

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 111,
    name: "Bilstein B8 Shocks",
    category: "suspension",
    brand: "bilstein",
    price: 799,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/bilstein-b8-shocks/1.jpg",
    images: [
      "/product-media/suspension/bilstein-b8-shocks/1.jpg",
      "/product-media/suspension/bilstein-b8-shocks/2.jpg",
      "/product-media/suspension/bilstein-b8-shocks/3.jpg",
      "/product-media/suspension/bilstein-b8-shocks/4.jpg",
      "/product-media/suspension/bilstein-b8-shocks/5.jpg",
      "/product-media/suspension/bilstein-b8-shocks/6.jpg",
    ],
    description: `Bilstein B8 Shocks

Bilstein B8 performance shocks engineered for sport-tuned damping, improved control, and OEM+ ride quality with lowered springs.

The Bilstein B8 Shocks pair perfectly with performance lowering springs, delivering sport-tuned monotube damping that reduces body roll and improves road holding without a harsh ride. Gas-pressurized and built to Bilstein's exacting standards, they are a trusted upgrade for spirited street driving and weekend track days.

Specifications
• Part Type: Performance Shock Absorbers (B8)
• Design: Monotube Gas-Pressurized
• Tuning: Sport / Performance Damping
• Pairing: Ideal with Lowering Springs
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Bilstein

Highlights
• Sport-Tuned Monotube Damping
• Reduced Body Roll
• OEM+ Ride Quality
• Gas-Pressurized Performance
• Trusted Bilstein Engineering

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 112,
    name: "Bilstein B16 Coilovers",
    category: "suspension",
    brand: "bilstein",
    price: 2199,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/bilstein-b16-coilovers/1.jpg",
    images: [
      "/product-media/suspension/bilstein-b16-coilovers/1.jpg",
      "/product-media/suspension/bilstein-b16-coilovers/2.jpg",
      "/product-media/suspension/bilstein-b16-coilovers/3.jpg",
    ],
    description: `Bilstein B16 Coilovers

Bilstein B16 ride-height adjustable coilovers with independent compression and rebound damping for precision tuning.

The Bilstein B16 Coilovers combine threaded ride height adjustment with independent compression and rebound damping controls for a truly dialed-in setup. Built on Bilstein's monotube technology, they deliver track-capable handling with the refinement expected from a premium German suspension manufacturer.

Specifications
• Part Type: Coilover Suspension Kit (B16)
• Damping: Independent Compression & Rebound
• Ride Height: Threaded Collar Adjustment
• Design: Monotube Gas-Pressurized
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Bilstein

Highlights
• Independent Compression/Rebound Tuning
• Threaded Ride Height Adjustment
• Premium Monotube Technology
• Track-Capable Handling
• German Engineering Quality

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 113,
    name: "Camber Arm Kit",
    category: "suspension",
    brand: "whiteline",
    price: 389,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/camber-arm-kit/1.jpg",
    images: [
      "/product-media/suspension/camber-arm-kit/1.jpg",
      "/product-media/suspension/camber-arm-kit/2.jpg",
      "/product-media/suspension/camber-arm-kit/3.jpg",
      "/product-media/suspension/camber-arm-kit/4.jpg",
      "/product-media/suspension/camber-arm-kit/5.jpg",
      "/product-media/suspension/camber-arm-kit/6.jpg",
    ],
    description: `Camber Arm Kit

Adjustable camber arm kit for precise wheel alignment, improved cornering grip, and even tire wear on lowered vehicles.

The Camber Arm Kit allows fine adjustment of rear (or front, application-dependent) camber to restore alignment on lowered or performance suspension setups. Built with durable hardware and precision bushings, it helps maximize contact patch and handling while protecting tires from excessive inner wear.

Specifications
• Part Type: Adjustable Camber Arms
• Adjustment: Camber Correction
• Construction: Reinforced Steel Arms
• Bushings: Performance-Grade
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Whiteline

Highlights
• Precise Camber Adjustment
• Restores Lowered-Vehicle Alignment
• Improved Cornering Grip
• Even Tire Wear
• Direct Bolt-On Fitment

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 114,
    name: "Complete Air Ride Kit",
    category: "suspension",
    brand: "air-lift-performance",
    price: 3999,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/complete-air-ride-kit/1.jpg",
    images: [
      "/product-media/suspension/complete-air-ride-kit/1.jpg",
      "/product-media/suspension/complete-air-ride-kit/2.jpg",
      "/product-media/suspension/complete-air-ride-kit/3.jpg",
    ],
    description: `Complete Air Ride Kit

Full air ride suspension kit with struts, bags, and management hardware for a complete stance and ride-height solution.

The Complete Air Ride Kit bundles air struts or bags with lines, fittings, and management components for a comprehensive air suspension conversion. Designed for enthusiasts who want a turnkey stance setup, it delivers smooth ride quality, dramatic height adjustment, and show-ready presentation in one package.

Specifications
• Part Type: Complete Air Ride Kit
• Includes: Air Struts/Bags + Lines + Hardware
• Management: Compatible with Air Lift Controllers
• Ride Height: Full Adjustable Range
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Air Lift Performance

Highlights
• Complete Air Suspension Package
• Full Ride Height Adjustment
• Show-Ready Stance Capability
• Smooth Daily Driving Ride
• Turnkey Conversion Solution

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 115,
    name: "Eibach Pro Kit Springs",
    category: "suspension",
    brand: "eibach",
    price: 349,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/eibach-pro-kit-springs/1.jpg",
    images: [
      "/product-media/suspension/eibach-pro-kit-springs/1.jpg",
      "/product-media/suspension/eibach-pro-kit-springs/2.jpg",
      "/product-media/suspension/eibach-pro-kit-springs/3.jpg",
      "/product-media/suspension/eibach-pro-kit-springs/4.jpg",
    ],
    description: `Eibach Pro Kit Springs

Eibach Pro-Kit lowering springs for a lower center of gravity, sharper handling, and clean OEM-style ride quality.

The Eibach Pro Kit Springs deliver a moderate drop with progressive spring rates that improve handling and reduce body roll while maintaining everyday comfort. Engineered from high-tensile steel and tested on road and track, they are one of the most popular lowering upgrades for street performance builds.

Specifications
• Part Type: Lowering Spring Kit (Pro-Kit)
• Drop: Application-Specific Moderate Lowering
• Spring Rate: Progressive Performance
• Material: High-Tensile Steel
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Eibach

Highlights
• Moderate Performance Lowering
• Progressive Spring Rates
• Improved Handling & Stance
• OEM-Style Ride Comfort
• Trusted Eibach Engineering

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 116,
    name: "Fortune Auto 500 Coilovers",
    category: "suspension",
    brand: "fortune-auto",
    price: 1799,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/fortune-auto-500-coilovers/1.jpg",
    images: [
      "/product-media/suspension/fortune-auto-500-coilovers/1.jpg",
      "/product-media/suspension/fortune-auto-500-coilovers/2.jpg",
      "/product-media/suspension/fortune-auto-500-coilovers/3.jpg",
      "/product-media/suspension/fortune-auto-500-coilovers/4.jpg",
      "/product-media/suspension/fortune-auto-500-coilovers/5.jpg",
      "/product-media/suspension/fortune-auto-500-coilovers/6.jpg",
    ],
    description: `Fortune Auto 500 Coilovers

Fortune Auto 500 Series coilovers with customizable spring rates and robust damping for street and track performance.

The Fortune Auto 500 Coilovers feature hand-built shock bodies with adjustable damping and custom spring rate options tailored to your driving style. Known for durability and rebuildability, they deliver precise handling, confident body control, and a setup that can grow with your build from street to track.

Specifications
• Part Type: Coilover Suspension Kit (500 Series)
• Damping: Adjustable Rebound
• Springs: Custom Rate Options Available
• Ride Height: Threaded Collar Adjustment
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Fortune Auto

Highlights
• Custom Spring Rate Options
• Hand-Built Shock Bodies
• Rebuildable & Durable Design
• Street & Track Performance
• Adjustable Damping Control

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 117,
    name: "KW Variant 3 Coilovers",
    category: "suspension",
    brand: "kw-suspension",
    price: 2799,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/kw-variant-3-coilovers/1.jpg",
    images: [
      "/product-media/suspension/kw-variant-3-coilovers/1.jpg",
      "/product-media/suspension/kw-variant-3-coilovers/2.jpg",
      "/product-media/suspension/kw-variant-3-coilovers/3.jpg",
      "/product-media/suspension/kw-variant-3-coilovers/4.jpg",
      "/product-media/suspension/kw-variant-3-coilovers/5.jpg",
      "/product-media/suspension/kw-variant-3-coilovers/6.jpg",
      "/product-media/suspension/kw-variant-3-coilovers/7.jpg",
      "/product-media/suspension/kw-variant-3-coilovers/8.jpg",
      "/product-media/suspension/kw-variant-3-coilovers/9.jpg",
      "/product-media/suspension/kw-variant-3-coilovers/10.jpg",
    ],
    description: `KW Variant 3 Coilovers

KW Variant 3 coilovers with independent compression and rebound adjustment for professional-grade suspension tuning.

The KW Variant 3 Coilovers represent KW's flagship street and track solution, combining stainless steel bodies with independent compression and rebound damping adjustment. TÜV-tested and race-proven, they deliver unmatched tuning flexibility, precise handling, and the build quality expected from a world-leading suspension manufacturer.

Specifications
• Part Type: Coilover Suspension Kit (Variant 3)
• Damping: Independent Compression & Rebound (16-Click)
• Ride Height: Threaded Collar Adjustment
• Body: Stainless Steel Struts
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: KW Suspension

Highlights
• Independent Compression/Rebound Tuning
• TÜV-Tested Quality
• Stainless Steel Strut Bodies
• Race-Proven KW Engineering
• Professional-Grade Suspension Tuning

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 118,
    name: "Suspension Rebuild Kit",
    category: "suspension",
    brand: "universal",
    price: 449,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/suspension-rebuild-kit/1.jpg",
    images: [
      "/product-media/suspension/suspension-rebuild-kit/1.jpg",
      "/product-media/suspension/suspension-rebuild-kit/2.jpg",
      "/product-media/suspension/suspension-rebuild-kit/3.jpg",
      "/product-media/suspension/suspension-rebuild-kit/4.jpg",
    ],
    description: `Suspension Rebuild Kit

Complete suspension rebuild kit with bushings, hardware, and wear components to restore factory-tight handling.

The Suspension Rebuild Kit includes the bushings, mounts, and hardware needed to refresh tired suspension components and eliminate slop. Ideal for high-mileage vehicles or project cars, it restores precise steering response, stable cornering, and the solid feel of a properly maintained chassis.

Specifications
• Part Type: Suspension Rebuild Kit
• Includes: Bushings, Mounts & Hardware
• Application: Chassis Refresh / Restoration
• Compatibility: Application-Specific (Confirm at Checkout)
• Condition: Brand-New Components
• Manufacturer: Universal

Highlights
• Eliminates Suspension Slop
• Restores Precise Handling
• Complete Bushing & Hardware Set
• Ideal for High-Mileage Refresh
• Cost-Effective Chassis Restoration

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 119,
    name: "Tein Flex Z Coilovers",
    category: "suspension",
    brand: "tein",
    price: 1099,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/tein-flex-z-coilovers/1.jpg",
    images: [
      "/product-media/suspension/tein-flex-z-coilovers/1.jpg",
      "/product-media/suspension/tein-flex-z-coilovers/2.jpg",
      "/product-media/suspension/tein-flex-z-coilovers/3.jpg",
      "/product-media/suspension/tein-flex-z-coilovers/4.jpg",
    ],
    description: `Tein Flex Z Coilovers

Tein Flex Z coilovers offering 16-way damping adjustment and ride height control for balanced street performance.

The Tein Flex Z Coilovers feature full-length ride height adjustment with 16-way damping control in a package designed for daily driving and weekend spirited use. Built with zinc-coated bodies and EDFC-compatible options on select applications, they deliver Tein's renowned balance of comfort, handling, and value.

Specifications
• Part Type: Coilover Suspension Kit (Flex Z)
• Damping: 16-Way Rebound Adjustment
• Ride Height: Full-Length Threaded Adjustment
• Body: Zinc-Coated Shock Bodies
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Tein

Highlights
• 16-Way Damping Adjustment
• Full-Length Ride Height Control
• Balanced Street Performance
• Zinc-Coated Durable Bodies
• Tein Quality & Value

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 120,
    name: "Whiteline Sway Bar Kit",
    category: "suspension",
    brand: "whiteline",
    price: 549,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: "/product-media/suspension/whiteline-sway-bar-kit/1.jpg",
    images: [
      "/product-media/suspension/whiteline-sway-bar-kit/1.jpg",
      "/product-media/suspension/whiteline-sway-bar-kit/2.jpg",
      "/product-media/suspension/whiteline-sway-bar-kit/3.jpg",
      "/product-media/suspension/whiteline-sway-bar-kit/4.jpg",
      "/product-media/suspension/whiteline-sway-bar-kit/5.jpg",
    ],
    description: `Whiteline Sway Bar Kit

Whiteline sway bar kit reducing body roll, sharpening turn-in, and improving overall chassis balance.

The Whiteline Sway Bar Kit upgrades factory anti-roll bars with thicker, performance-tuned bars and heavy-duty end links for flatter cornering and faster turn-in response. Engineered as a direct bolt-on handling upgrade, it is one of the most effective modifications for reducing understeer and improving overall chassis balance.

Specifications
• Part Type: Anti-Roll Bar Kit
• Construction: Upgraded Thickness Sway Bars
• End Links: Heavy-Duty Performance Links
• Bushings: Performance Polyurethane
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Whiteline

Highlights
• Reduced Body Roll
• Sharper Turn-In Response
• Improved Chassis Balance
• Heavy-Duty End Links Included
• Effective Bolt-On Handling Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  ...aftermarketProducts,
];

/** Storefront + checkout prices (affordable public list). */
export const products = applyPublicPrices(productCatalog);
