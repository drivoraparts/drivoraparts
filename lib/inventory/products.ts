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
  ...aftermarketProducts,
];
