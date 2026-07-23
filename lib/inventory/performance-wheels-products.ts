import type { Product } from "./types";

function media(files: string[]) {
  return { thumbnail: files[0], images: files };
}

/** Wheel coverage beyond the existing BMW-only lineup (bimmerworld-wheels-products.ts)
 * — JDM fitment for platforms already sold elsewhere in the catalog (2JZ-GTE Supra),
 * and off-road fitment for the 4x4 truck side (Hilux/Ranger, shared 6x139.7 bolt pattern). */
export const performanceWheelsProducts: Product[] = [
  {
    id: 2094,
    name: "Volk Racing TE37 Wheel Set - Toyota Supra MK4 (A80)",
    category: "wheels-tires",
    brand: "volk-racing",
    price: 2280,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "Toyota Supra MK4 / A80 — 18x9.5 +40 Front / 18x10.5 +45 Rear",
    createdAt: Date.now(),
    ...media([
      "/product-media/wheels-tires/volk-racing-te37-wheel-set-toyota-supra-mk4-a80/1.jpg",
    ]),
    description: `Volk Racing TE37 Wheel Set - Toyota Supra MK4 (A80)

The iconic forged Volk Racing TE37, sized specifically for the MK4 Supra — 18x9.5 +40 front and 18x10.5 +45 rear, sold as a matched set of four.

The TE37 is one of the most recognized JDM wheels ever made — a forged, lightweight design that cuts rotational mass without sacrificing strength. Sourced through an authorized Rays Engineering distributor for genuine fitment and finish on this specific Supra sizing.

Specifications
• Part Type: Forged Aluminum Wheel Set (4)
• Sizing: 18x9.5 +40 (Front) / 18x10.5 +45 (Rear)
• Application: Toyota Supra MK4 / A80
• Construction: Forged, Lightweight
• Manufacturer: Volk Racing (Rays Engineering)

Highlights
• Genuine Volk Racing TE37 Forged Construction
• MK4 Supra-Specific Sizing (Front/Rear Staggered)
• Iconic JDM Wheel with Strong Resale Value
• Sourced Through Authorized Distributor
• Significant Weight Savings Over Factory Wheels

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available — freight quotes provided for oversized items.`,
  },
  {
    id: 2095,
    name: "Method Race Wheels MR301 The Standard - Toyota Hilux / Ford Ranger",
    category: "wheels-tires",
    brand: "method-race-wheels",
    price: 1240,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    createdAt: Date.now(),
    fitment: "Toyota Hilux / Ford Ranger (6x139.7)",
    ...media([
      "/product-media/wheels-tires/method-race-wheels-mr301-the-standard-toyota-hilux-ford-ranger/1.png",
      "/product-media/wheels-tires/method-race-wheels-mr301-the-standard-toyota-hilux-ford-ranger/2.png",
    ]),
    description: `Method Race Wheels MR301 The Standard - Toyota Hilux / Ford Ranger

Purpose-built off-road wheel set in the shared 6x139.7 bolt pattern, fitting both the Hilux and Ranger — pairs directly with the suspension lift kits and bull bars already in the catalog.

The MR301 "The Standard" is Method's core off-road wheel — a simple, strong, beadlock-style design engineered for real trail use rather than just looks. Sold as a matched set of four in a size built to clear common lift-kit and larger all-terrain tire setups.

Specifications
• Part Type: Off-Road Wheel Set (4)
• Bolt Pattern: 6x139.7
• Application: Toyota Hilux / Ford Ranger
• Construction: Cast Aluminum, Off-Road Rated
• Manufacturer: Method Race Wheels

Highlights
• Direct-Fit Hilux/Ranger Bolt Pattern
• Built for Trail Use, Not Just Looks
• Clears Common Lift Kit & AT Tire Setups
• Pairs with Existing Suspension Lift Catalog
• Matched Set of Four

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available — freight quotes provided for oversized items.`,
  },
  {
    id: 2096,
    name: "Fuel Off-Road D611 Stroke Wheel Set - Toyota Hilux / Ford Ranger",
    category: "wheels-tires",
    brand: "fuel-off-road",
    price: 1420,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    createdAt: Date.now(),
    fitment: "Toyota Hilux / Ford Ranger (6x139.7)",
    ...media([
      "/product-media/wheels-tires/fuel-off-road-d611-stroke-wheel-set-toyota-hilux-ford-ranger/1.jpg",
    ]),
    description: `Fuel Off-Road D611 Stroke Wheel Set - Toyota Hilux / Ford Ranger

Larger-format off-road wheel set for the Hilux/Ranger platform, complementing Method's lineup with wider size options for bigger lifted-truck builds.

The D611 Stroke brings Fuel Off-Road's one-piece cast construction and aggressive styling to the same 6x139.7 platform already supported elsewhere in the catalog, giving customers running a heavier lift or larger tire setup a wheel sized to match.

Specifications
• Part Type: Off-Road Wheel Set (4)
• Bolt Pattern: 6x139.7
• Application: Toyota Hilux / Ford Ranger
• Construction: Cast Aluminum, Off-Road Rated
• Manufacturer: Fuel Off-Road

Highlights
• Direct-Fit Hilux/Ranger Bolt Pattern
• Wider Size Range for Bigger Lifted Builds
• Aggressive Off-Road Styling
• Complements Existing Method Wheel Lineup
• Matched Set of Four

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available — freight quotes provided for oversized items.`,
  },
  {
    id: 2097,
    name: `OEM 20" BMW M5 (F90) Wheels / Rims Set - Gloss Black (New)`,
    category: "wheels-tires",
    brand: "bmw",
    price: 2995,
    compareAtPrice: 3995,
    stock: true,
    stockQty: 8,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    partNumber: "36118073977 (Front) / 36118073979 (Rear) — Style 706M",
    fitment:
      "BMW M5 (F90) — 20x9.5J Front / 20x10.5J Rear, 5x112, 66.6mm Center Bore. Verify compatibility using your VIN before purchase.",
    createdAt: Date.now(),
    ...media([
      `/product-media/wheels-tires/oem-20-bmw-m5-f90-wheels-rims-set-gloss-black-new/1.jpg`,
      `/product-media/wheels-tires/oem-20-bmw-m5-f90-wheels-rims-set-gloss-black-new/2.jpg`,
      `/product-media/wheels-tires/oem-20-bmw-m5-f90-wheels-rims-set-gloss-black-new/3.png`,
      `/product-media/wheels-tires/oem-20-bmw-m5-f90-wheels-rims-set-gloss-black-new/4.jpg`,
    ]),
    sourceUrl:
      "https://www.getbmwparts.com/p-m-double-spoke-style-706m-20-rim-set-black-36118073979kit",
    description: `OEM 20" BMW M5 (F90) Wheels / Rims Set - Gloss Black (New)

100% genuine BMW OEM wheel set for the BMW M5 (F90) — the factory M Double Spoke Style 706M, finished in a deep Gloss Black for a clean, factory-correct, performance-luxury look. Every wheel is brand new, built to BMW's exact factory specifications, and sourced through an authorized genuine-parts channel for true OEM fitment, load rating, and finish quality.

As a direct-fit factory replacement, this set bolts straight onto your M5 (F90) with no spacers, adapters, or modification required — the same wheel BMW speced for this chassis from the factory, not a lookalike reproduction. That means correct offset, correct load rating, and the factory ride and handling character the M5 was tuned around.

Specifications
• Front Wheels: 20 x 9.5J
• Rear Wheels: 20 x 10.5J
• Bolt Pattern: 5 x 112
• Center Bore: 66.6mm
• Direct OEM Fitment — Genuine BMW Part
• High-Strength OEM Alloy Construction
• Finish: Gloss Black

Vehicle Fitment
• BMW M5 (F90)
• Verify compatibility using your VIN before purchase.

Highlights
• 100% Genuine BMW OEM — Not Aftermarket or Reproduction
• Factory Style 706M M Double Spoke Design
• Premium Gloss Black Finish
• Direct Bolt-On Replacement, No Modification Required
• Built to BMW Factory Performance & Durability Standards
• Professional Installation Recommended

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available — freight quotes provided for oversized items.`,
  },
];
