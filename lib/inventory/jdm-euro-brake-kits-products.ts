import type { Product } from "./types";

function media(files: string[]) {
  return { thumbnail: files[0], images: files };
}

/** Premium big-brake kits for JDM/Euro platforms — extends the existing Wilwood
 * lineup (previously Chevy/GM/Corvette only) to match platforms already sold
 * elsewhere in the catalog (RB26DETT, BMW S55, 2JZ-GTE). */
export const jdmEuroBrakeKitsProducts: Product[] = [
  {
    id: 2091,
    name: "Wilwood Big Brake Kit - Nissan Skyline R32/R33/R34 (RB26DETT)",
    category: "brakes",
    brand: "wilwood-big-brake-kits",
    price: 3850,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "Nissan Skyline R32/R33/R34 (RB26DETT)",
    createdAt: Date.now(),
    ...media([
      "/product-media/brakes/wilwood-big-brake-kit-nissan-skyline-r32-r33-r34-rb26dett/1.jpg",
      "/product-media/brakes/wilwood-big-brake-kit-nissan-skyline-r32-r33-r34-rb26dett/2.jpg",
    ]),
    description: `Wilwood Big Brake Kit - Nissan Skyline R32/R33/R34 (RB26DETT)

Complete 6-piston front / 4-piston rear Wilwood big-brake kit purpose-built for the R32/R33/R34 Skyline chassis.

Direct fitment for RB26DETT-powered Skylines, this kit retains OEM master cylinder and ABS compatibility while delivering a dramatic upgrade in pad contact area, heat capacity, and pedal feel over factory calipers. A proven pairing for owners already running upgraded turbo and fuel system builds on this platform.

Specifications
• Part Type: Big Brake Kit (Front & Rear)
• Caliper Configuration: 6-Piston Front / 4-Piston Rear
• Compatibility: OEM Master Cylinder & ABS Retained
• Application: Nissan Skyline R32/R33/R34 (RB26DETT)
• Manufacturer: Wilwood

Highlights
• Direct-Fit R32/R33/R34 Application
• Massive Upgrade Over Factory Calipers
• Retains OEM Master Cylinder & ABS
• Drilled & Slotted Rotors Included
• Pairs Well with Upgraded Turbo Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available — freight quotes provided for oversized items.`,
  },
  {
    id: 2092,
    name: "Wilwood Rear Big Brake Kit - BMW E9x 3-Series (N54/S55)",
    category: "brakes",
    brand: "wilwood-big-brake-kits",
    price: 1850,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "BMW E9x 3-Series, incl. E90/E92 M3 (N54/S55)",
    createdAt: Date.now(),
    ...media([
      "/product-media/brakes/wilwood-rear-big-brake-kit-bmw-e9x-3-series-n54-s55/1.jpg",
    ]),
    description: `Wilwood Rear Big Brake Kit - BMW E9x 3-Series (N54/S55)

Rear big-brake upgrade for E9x-chassis BMWs, matched to balance against an upgraded front setup on N54 and S55-powered builds.

Covers most E9x 3-Series variants including E90/E92 M3, delivering stronger, more consistent rear stopping power for cars already pushing more power through the N54 or S55. Designed as the rear half of a full big-brake upgrade, or a standalone rear improvement for track-day E9x builds.

Specifications
• Part Type: Big Brake Kit (Rear)
• Application: BMW E9x 3-Series (N54/S55 platforms)
• Rotor Type: Drilled & Slotted
• Compatibility: OEM Parking Brake Retained
• Manufacturer: Wilwood

Highlights
• Direct-Fit E9x 3-Series Application
• Balances Upgraded Front Big-Brake Setups
• Retains OEM Parking Brake Function
• Drilled & Slotted Rotors Included
• Ideal for N54/S55 Track-Day Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available — freight quotes provided for oversized items.`,
  },
  {
    id: 2093,
    name: "CEIKA Big Brake Kit - Toyota Supra MK4 (2JZ-GTE)",
    category: "brakes",
    brand: "ceika",
    price: 2450,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "Toyota Supra MK4 / A80 (2JZ-GTE)",
    createdAt: Date.now(),
    ...media([
      "/product-media/brakes/ceika-big-brake-kit-toyota-supra-mk4-2jz-gte/1.jpg",
    ]),
    description: `CEIKA Big Brake Kit - Toyota Supra MK4 (2JZ-GTE)

6-piston front big-brake kit built specifically for the MK4 Supra chassis, filling a fitment gap Wilwood doesn't cover on this platform.

CEIKA is an established name in JDM-fitment big-brake kits, and this kit is engineered around the A80 Supra's factory hub and knuckle geometry for a clean, direct install. A natural companion to the fuel system and turbo upgrades already popular on 2JZ-GTE builds.

Specifications
• Part Type: Big Brake Kit (Front)
• Caliper Configuration: 6-Piston Front
• Application: Toyota Supra MK4 / A80 (2JZ-GTE)
• Rotor Type: Drilled & Slotted, 2-Piece Floating
• Manufacturer: CEIKA

Highlights
• Purpose-Built MK4 Supra Fitment
• Direct Install on Factory Hub/Knuckle Geometry
• 2-Piece Floating Rotor Design
• Fills the Gap Left by Non-Supra-Fitment Brands
• Pairs Well with 2JZ-GTE Turbo Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available — freight quotes provided for oversized items.`,
  },
];
