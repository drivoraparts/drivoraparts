import type { Product } from "./types";

function media(slug: string, count: number) {
  const files = Array.from(
    { length: count },
    (_, index) => `/product-media/bodyparts/${slug}/${index + 1}.jpg`
  );
  return { thumbnail: files[0], images: files };
}

function bodyPartDescription(
  name: string,
  fitment: string,
  highlights: string[]
): string {
  return `${name}

${name} for ${fitment} with aggressive styling, improved aerodynamics, and show-ready fitment for street and track builds.

This widebody aero package upgrades factory body lines with bolt-on or professional-install panels designed for a clean OEM+ appearance. Built from durable composite materials with precise panel alignment, it delivers the stance and presence enthusiasts expect from a premium body kit.

Specifications
• Part Type: Widebody / Aero Body Kit
• Fitment: ${fitment}
• Material: High-Strength Composite / ABS Panels
• Finish: Primer-Ready / Paint-Match Ready (Kit Dependent)
• Installation: Professional Install Recommended
• Manufacturer: DrivoraParts Sourced OEM+ Supplier

Highlights
${highlights.map((line) => `• ${line}`).join("\n")}

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`;
}

export const bodyPartsProducts: Product[] = [
  {
    id: 150,
    name: "BMW G20 Widebody Aero Kit",
    category: "body-parts",
    brand: "bmw",
    price: 2899,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2019–2025 BMW G20 3 Series Sedan",
    ...media("bmw-g20", 4),
    description: bodyPartDescription(
      "BMW G20 Widebody Aero Kit",
      "2019–2025 BMW G20 3 Series Sedan",
      [
        "Aggressive G20 Widebody Styling",
        "Extended Fenders & Aero Extensions",
        "Track-Inspired Street Presence",
        "Premium Composite Construction",
        "Show-Ready BMW Platform Upgrade",
      ]
    ),
  },
  {
    id: 151,
    name: "BMW G20 3 Series Widebody Aero Kit",
    category: "body-parts",
    brand: "bmw",
    price: 3199,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2019–2025 BMW G20 3 Series (330i / M340i)",
    ...media("bmw-g20-3-series", 7),
    description: bodyPartDescription(
      "BMW G20 3 Series Widebody Aero Kit",
      "2019–2025 BMW G20 3 Series (330i / M340i)",
      [
        "Full G20 3 Series Widebody Package",
        "Enhanced Front & Side Aero Coverage",
        "Wider Stance for Modern BMW Lines",
        "Paint-Ready Composite Panels",
        "Premium Street & Show Build Upgrade",
      ]
    ),
  },
  {
    id: 152,
    name: "Carbon Fiber Hood",
    category: "body-parts",
    brand: "universal",
    price: 1899,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "Application-Specific (Confirm Vehicle at Checkout)",
    ...media("carbon-fiber-hood", 3),
    description: bodyPartDescription(
      "Carbon Fiber Hood",
      "Application-Specific Performance Vehicles",
      [
        "Lightweight Carbon Fiber Construction",
        "UV-Clearcoat Show Finish",
        "Reduced Front-End Mass",
        "Aggressive Vent & Scoop Styling",
        "Ideal for Turbo & Track Builds",
      ]
    ),
  },
  {
    id: 153,
    name: "Ford F-150 Off-Road Body Kit",
    category: "body-parts",
    brand: "ford",
    price: 2499,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2015–2026 Ford F-150",
    ...media("ford-f-150", 5),
    description: bodyPartDescription(
      "Ford F-150 Off-Road Body Kit",
      "2015–2026 Ford F-150",
      [
        "Rugged Off-Road Exterior Styling",
        "Enhanced Fender & Bumper Coverage",
        "Truck-Ready Composite Durability",
        "Lift & Tire-Friendly Proportions",
        "Built for Overland & Trail Builds",
      ]
    ),
  },
  {
    id: 154,
    name: "Ford Mustang S550 Widebody Kit",
    category: "body-parts",
    brand: "ford",
    price: 2799,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2015–2023 Ford Mustang S550",
    ...media("ford-mustang-s550", 5),
    description: bodyPartDescription(
      "Ford Mustang S550 Widebody Kit",
      "2015–2023 Ford Mustang S550",
      [
        "S550 Mustang Widebody Transformation",
        "Extended Quarter & Side Skirt Panels",
        "Track-Inspired American Muscle Styling",
        "Supports Wider Wheel & Tire Setups",
        "Show-Ready Mustang Platform Upgrade",
      ]
    ),
  },
  {
    id: 155,
    name: "Ford Ranger Off-Road Body Kit",
    category: "body-parts",
    brand: "ford",
    price: 2199,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2019–2026 Ford Ranger",
    ...media("ford-ranger", 4),
    description: bodyPartDescription(
      "Ford Ranger Off-Road Body Kit",
      "2019–2026 Ford Ranger",
      [
        "Mid-Size Truck Off-Road Styling",
        "Reinforced Composite Exterior Panels",
        "Trail & Overland Build Ready",
        "Clean OEM+ Ranger Fitment",
        "Durable All-Weather Construction",
      ]
    ),
  },
  {
    id: 156,
    name: "Honda Civic FK8 Widebody Aero Kit",
    category: "body-parts",
    brand: "honda",
    price: 2299,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2016–2021 Honda Civic FK8 Platform",
    ...media("honda-civic-fk8", 3),
    description: bodyPartDescription(
      "Honda Civic FK8 Widebody Aero Kit",
      "2016–2021 Honda Civic FK8 Platform",
      [
        "FK8 Civic Widebody Styling",
        "Extended Fender & Side Aero Coverage",
        "Supports Aggressive Wheel Fitment",
        "Track-Day Street Build Ready",
        "Premium Honda Platform Upgrade",
      ]
    ),
  },
  {
    id: 157,
    name: "Honda Civic FK8 Type R Widebody Aero Kit",
    category: "body-parts",
    brand: "honda",
    price: 2599,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2017–2021 Honda Civic Type R (FK8)",
    ...media("honda-civic-fk8-type-r", 3),
    description: bodyPartDescription(
      "Honda Civic FK8 Type R Widebody Aero Kit",
      "2017–2021 Honda Civic Type R (FK8)",
      [
        "Type R Specific Widebody Package",
        "Enhanced FK8 Aero & Fender Lines",
        "Built for High-Grip Track Setups",
        "Show & Time Attack Ready Styling",
        "OEM+ Type R Exterior Upgrade",
      ]
    ),
  },
  {
    id: 158,
    name: "Nissan 370Z Widebody Aero Kit",
    category: "body-parts",
    brand: "nissan",
    price: 2399,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2009–2020 Nissan 370Z (Z34)",
    ...media("nissan-370z", 2),
    description: bodyPartDescription(
      "Nissan 370Z Widebody Aero Kit",
      "2009–2020 Nissan 370Z (Z34)",
      [
        "370Z Widebody Transformation",
        "Extended Rear & Side Aero Panels",
        "Supports Wider Staggered Wheel Setups",
        "JDM-Inspired Z-Car Styling",
        "Track & Show Build Ready",
      ]
    ),
  },
  {
    id: 159,
    name: "Subaru WRX STI Widebody Aero Kit",
    category: "body-parts",
    brand: "subaru",
    price: 2699,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2015–2021 Subaru WRX STI (VA)",
    ...media("subaru-wrx-sti", 7),
    description: bodyPartDescription(
      "Subaru WRX STI Widebody Aero Kit",
      "2015–2021 Subaru WRX STI (VA)",
      [
        "WRX STI Widebody Rally Styling",
        "Extended Fender & Side Skirt Coverage",
        "Built for AWD Performance Builds",
        "Supports Wide Wheel & Tire Packages",
        "Premium STI Platform Exterior Upgrade",
      ]
    ),
  },
  {
    id: 160,
    name: "Toyota GR Supra A90 Widebody Aero Kit",
    category: "body-parts",
    brand: "toyota",
    price: 2899,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2019–2026 Toyota GR Supra A90",
    ...media("toyota-gr-supra-a90", 2),
    description: bodyPartDescription(
      "Toyota GR Supra A90 Widebody Aero Kit",
      "2019–2026 Toyota GR Supra A90",
      [
        "A90 Supra Widebody Styling",
        "Aggressive Front & Side Aero Extensions",
        "Built for B58 Performance Builds",
        "Supports Wide Tire & Wheel Setups",
        "Show-Ready GR Supra Transformation",
      ]
    ),
  },
];
