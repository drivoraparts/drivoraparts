import type { Product } from "./types";

function media(slug: string, files: string[]) {
  const paths = files.map((file) => `/product-media/interior/${slug}/${file}`);
  return { thumbnail: paths[0], images: paths };
}

function interiorDescription(
  name: string,
  fitment: string,
  highlights: string[]
): string {
  return `${name}

${name} for ${fitment} with premium cabin styling, improved driver ergonomics, and show-ready interior fitment for street and track builds.

This interior upgrade package enhances factory cabin lines with vehicle-specific components designed for a clean OEM+ appearance. Built from durable materials with precise fitment, it delivers the comfort and presence enthusiasts expect from a premium interior kit.

Specifications
• Part Type: Interior Upgrade / Cockpit Kit
• Fitment: ${fitment}
• Material: Leather / Alcantara / Composite (Kit Dependent)
• Finish: Factory-Match / Custom Trim Options (Kit Dependent)
• Installation: Professional or DIY Install (Kit Dependent)
• Manufacturer: DrivoraParts Sourced OEM+ Supplier

Highlights
${highlights.map((line) => `• ${line}`).join("\n")}

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`;
}

export const interiorProducts: Product[] = [
  {
    id: 161,
    name: "Ford F-150 Interior Upgrade Kit",
    category: "interior",
    brand: "ford",
    price: 449,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2015–2026 Ford F-150",
    ...media("ford-f-150", ["1.jpg", "2.jpg"]),
    description: interiorDescription(
      "Ford F-150 Interior Upgrade Kit",
      "2015–2026 Ford F-150",
      [
        "Full-Cabin Interior Styling Upgrade",
        "Premium Trim & Upholstery Components",
        "Truck-Ready OEM+ Fitment",
        "Daily Driver & Show Build Ready",
        "Durable All-Weather Materials",
      ]
    ),
  },
  {
    id: 162,
    name: "Ford Mustang S550 Katzkin Leather Seat Kit",
    category: "interior",
    brand: "ford",
    price: 550,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2015–2023 Ford Mustang S550",
    ...media("ford-mustang-s550", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.webp",
    ]),
    description: interiorDescription(
      "Ford Mustang S550 Katzkin Leather Seat Kit",
      "2015–2023 Ford Mustang S550",
      [
        "Katzkin Leather Seat Upholstery Upgrade",
        "S550 Mustang-Specific Pattern & Fitment",
        "Premium Leather With OEM+ Stitching",
        "Track-Day & Show-Ready Cabin Styling",
        "Complete Front & Rear Seat Coverage",
      ]
    ),
  },
  {
    id: 163,
    name: "Ford Ranger Interior Upgrade Kit",
    category: "interior",
    brand: "ford",
    price: 499,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2019–2026 Ford Ranger",
    ...media("ford-ranger", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.jpg",
      "6.jpg",
    ]),
    description: interiorDescription(
      "Ford Ranger Interior Upgrade Kit",
      "2019–2026 Ford Ranger",
      [
        "Mid-Size Truck Interior Refresh",
        "Premium Trim & Upholstery Components",
        "Trail & Overland Build Ready",
        "Clean OEM+ Ranger Fitment",
        "Durable All-Weather Construction",
      ]
    ),
  },
  {
    id: 164,
    name: "Honda Civic FK8 Interior Upgrade Kit",
    category: "interior",
    brand: "honda",
    price: 399,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2016–2021 Honda Civic FK8 Platform",
    ...media("honda-civic-fk8", ["1.jpg"]),
    description: interiorDescription(
      "Honda Civic FK8 Interior Upgrade Kit",
      "2016–2021 Honda Civic FK8 Platform",
      [
        "FK8 Civic Cabin Styling Upgrade",
        "Premium Trim & Seat Components",
        "Street & Track Build Ready",
        "Clean OEM+ Honda Fitment",
        "Show-Ready Civic Interior Presence",
      ]
    ),
  },
  {
    id: 165,
    name: "Honda Civic FK8 Type R Interior Upgrade Kit",
    category: "interior",
    brand: "honda",
    price: 449,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2017–2021 Honda Civic Type R (FK8)",
    ...media("honda-civic-fk8-type-r", ["1.jpg"]),
    description: interiorDescription(
      "Honda Civic FK8 Type R Interior Upgrade Kit",
      "2017–2021 Honda Civic Type R (FK8)",
      [
        "Type R Specific Interior Package",
        "Enhanced FK8 Cabin Styling",
        "Built for High-Grip Track Setups",
        "Show & Time Attack Ready Finish",
        "OEM+ Type R Interior Upgrade",
      ]
    ),
  },
  {
    id: 166,
    name: "Nissan 350Z MOMO MOD 07 Steering Wheel",
    category: "interior",
    brand: "nissan",
    price: 389,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2003–2008 Nissan 350Z (Z33)",
    ...media("nissan-350z", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.jpg",
      "6.jpg",
      "7.jpg",
      "8.jpg",
      "9.jpg",
      "10.jpg",
      "11.jpg",
      "12.jpg",
      "13.jpg",
      "14.jpg",
    ]),
    description: interiorDescription(
      "Nissan 350Z MOMO MOD 07 Steering Wheel",
      "2003–2008 Nissan 350Z (Z33)",
      [
        "MOMO MOD 07 Performance Steering Wheel",
        "350Z-Specific Hub & Fitment",
        "Premium Leather Grip & Sport Profile",
        "Track-Inspired Driver Feedback",
        "JDM Z-Car Cockpit Upgrade",
      ]
    ),
  },
  {
    id: 167,
    name: "Nissan 370Z Interior Upgrade Kit",
    category: "interior",
    brand: "nissan",
    price: 429,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2009–2020 Nissan 370Z (Z34)",
    ...media("nissan-370z", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.jpg",
    ]),
    description: interiorDescription(
      "Nissan 370Z Interior Upgrade Kit",
      "2009–2020 Nissan 370Z (Z34)",
      [
        "370Z Cabin Styling Upgrade",
        "Premium Trim & Driver Components",
        "Track & Show Build Ready",
        "JDM-Inspired Z-Car Interior",
        "Clean OEM+ Fitment",
      ]
    ),
  },
  {
    id: 168,
    name: "Subaru WRX STI Interior Performance Kit",
    category: "interior",
    brand: "subaru",
    price: 479,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2015–2021 Subaru WRX STI (VA)",
    ...media("subaru-wrx-sti", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.jpg",
      "6.jpg",
      "7.jpg",
      "8.jpg",
      "9.jpg",
      "10.jpg",
    ]),
    description: interiorDescription(
      "Subaru WRX STI Interior Performance Kit",
      "2015–2021 Subaru WRX STI (VA)",
      [
        "WRX STI Gauge Pod & Shift Knob Package",
        "Track-Focused Driver Ergonomics",
        "Built for AWD Performance Builds",
        "Premium STI Cockpit Styling",
        "Show & Rally Build Ready",
      ]
    ),
  },
  {
    id: 169,
    name: "Toyota GR Supra A90 Interior Upgrade Kit",
    category: "interior",
    brand: "toyota",
    price: 549,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2019–2026 Toyota GR Supra A90",
    ...media("toyota-gr-supra-a90", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
    ]),
    description: interiorDescription(
      "Toyota GR Supra A90 Interior Upgrade Kit",
      "2019–2026 Toyota GR Supra A90",
      [
        "A90 Supra Cabin Styling Upgrade",
        "Premium Trim & Driver Components",
        "Built for B58 Performance Builds",
        "Show-Ready GR Supra Interior",
        "Clean OEM+ Fitment",
      ]
    ),
  },
  {
    id: 170,
    name: "Toyota Hilux Interior Upgrade Kit",
    category: "interior",
    brand: "toyota",
    price: 399,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2015–2026 Toyota Hilux",
    ...media("toyota-hilux", ["1.jpg"]),
    description: interiorDescription(
      "Toyota Hilux Interior Upgrade Kit",
      "2015–2026 Toyota Hilux",
      [
        "Hilux Cabin Styling Upgrade",
        "Premium Trim & Upholstery Components",
        "Trail & Overland Build Ready",
        "Durable All-Weather Materials",
        "Clean OEM+ Hilux Fitment",
      ]
    ),
  },
  {
    id: 171,
    name: "Toyota Tacoma Dashboard Cover Kit",
    category: "interior",
    brand: "toyota",
    price: 299,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2016–2025 Toyota Tacoma",
    ...media("toyota-tacoma", ["1.avif", "2.avif"]),
    description: interiorDescription(
      "Toyota Tacoma Dashboard Cover Kit",
      "2016–2025 Toyota Tacoma",
      [
        "Non-Slip Faux Leather Dash Cover",
        "UV & Heat Protection for Factory Dash",
        "Tacoma-Specific Trim Fitment",
        "Easy Install Daily Driver Upgrade",
        "Clean Black OEM+ Appearance",
      ]
    ),
  },
  {
    id: 172,
    name: "Volkswagen Golf GTI MK7 Interior Upgrade Kit",
    category: "interior",
    brand: "volkswagen",
    price: 449,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "2015–2021 Volkswagen Golf GTI MK7",
    ...media("volkswagen-golf-gti-mk7", ["1.jpg", "2.jpg", "3.jpg"]),
    description: interiorDescription(
      "Volkswagen Golf GTI MK7 Interior Upgrade Kit",
      "2015–2021 Volkswagen Golf GTI MK7",
      [
        "MK7 GTI Cabin Styling Upgrade",
        "Premium Trim & Driver Components",
        "Hot Hatch OEM+ Fitment",
        "Street & Track Build Ready",
        "Show-Ready Euro Interior Presence",
      ]
    ),
  },
];
