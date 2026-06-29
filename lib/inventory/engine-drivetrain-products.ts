/* =========================================================
   GM / FORD SWAP ENGINE & DRIVETRAIN LISTINGS
   ---------------------------------------------------------
   Swap-ready engines and complete drivetrain packages.
   Descriptions are original DrivoraParts copy — not sourced
   verbatim from third-party retailers.
========================================================= */

import type { Product } from "./types";

function media(slug: string, files: string[]) {
  const paths = files.map(
    (file) => `/product-media/engine/swap-packages/${slug}/${file}`
  );
  return { thumbnail: paths[0], images: paths };
}

function swapDescription(
  name: string,
  intro: string,
  specs: Record<string, string>,
  highlights: string[]
): string {
  const specLines = Object.entries(specs)
    .map(([k, v]) => `• ${k}: ${v}`)
    .join("\n");

  return `${name}

${intro}

Specifications
${specLines}

Highlights
${highlights.map((line) => `• ${line}`).join("\n")}

Warranty
24-Month Limited Warranty

Shipping
Freight shipping available worldwide — contact for a pallet quote.`;
}

const BASE = {
  category: "engine" as const,
  stock: true,
  condition: "brand-new",
  mileage: "Low-mile takeout / crate (varies by unit)",
  warranty: "24-Month Limited Warranty",
  location: "USA Warehouse",
};

export const engineDrivetrainProducts: Product[] = [
  {
    id: 186,
    name: "Chevrolet L86 6.2L V8 Engine",
    brand: "chevrolet",
    platform: "gm-l86",
    price: 8358,
    horsepower: "420 HP",
    fitment: "GM Gen V truck/SUV donor — custom swap applications",
    createdAt: 1_741_900_000_000,
    ...media("gm-l86-6-2-engine", ["1.jpg", "2.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet L86 6.2L V8 Engine",
      "Gen V 6.2L aluminum V8 with direct injection and variable valve timing — a proven swap choice when you want LT-class architecture without the premium crate price tag. Units are leak-down and compression tested before shipment.",
      {
        "Engine Code": "L86",
        Configuration: "V8",
        Displacement: "6.2L",
        Aspiration: "Naturally aspirated",
        "Factory Power": "420 HP (approx.)",
        "Fuel System": "Direct injection",
        "Included": "Long block assembly (harness/ECU optional — confirm at checkout)",
      },
      [
        "Gen V aluminum block architecture",
        "Compression and leak-down tested",
        "Strong candidate for LS/LT-style swap builds",
        "Compatible with GM 8-speed swap ecosystem",
        "USA-sourced low-mile takeout inventory",
      ]
    ),
  },
  {
    id: 187,
    name: "Chevrolet L86 6.2L + 8L90 Drivetrain Package",
    brand: "chevrolet",
    platform: "gm-gen-v-packages",
    price: 11336,
    horsepower: "420 HP",
    fitment: "RWD / 4WD GM Gen V swap projects",
    createdAt: 1_741_901_000_000,
    ...media("gm-l86-8l90-drivetrain", ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet L86 6.2L + 8L90 Drivetrain Package",
      "Complete Gen V powertrain pairing the L86 6.2L V8 with the 8L90 eight-speed automatic. Ideal for builders who want a modern, factory-calibrated engine and transmission combo in one freight-ready package.",
      {
        Engine: "L86 6.2L V8",
        Transmission: "GM 8L90 8-speed automatic",
        "Factory Power": "420 HP (approx.)",
        "Included": "Engine, transmission, OEM harness (pedals/ECU when available)",
        Configuration: "RWD or 4WD donor options",
      },
      [
        "Matched Gen V engine and 8-speed trans",
        "Modern gearing for street and tow use",
        "Compression and leak-down tested",
        "Swap-friendly harness included",
        "Turn-key alternative to piecing parts separately",
      ]
    ),
  },
  {
    id: 188,
    name: "Chevrolet L83 5.3L V8 Engine",
    brand: "chevrolet",
    platform: "gm-l83",
    price: 4299,
    horsepower: "355 HP",
    fitment: "GM Gen V truck/SUV donor — custom swap applications",
    createdAt: 1_741_902_000_000,
    ...media("gm-l83-5-3-engine", ["1.jpg", "2.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet L83 5.3L V8 Engine",
      "Affordable Gen V 5.3L V8 with direct injection — one of the most popular swap engines for weight-conscious builds that still need V8 torque. Inspected and tested prior to shipping.",
      {
        "Engine Code": "L83",
        Configuration: "V8",
        Displacement: "5.3L",
        Aspiration: "Naturally aspirated",
        "Factory Power": "355 HP (approx.)",
        "Fuel System": "Direct injection",
      },
      [
        "Lightweight Gen V truck engine",
        "Excellent value for swap budgets",
        "Proven reliability in daily-driven builds",
        "Pairs with 6L80 / 8L90 ecosystems",
        "Compression and leak-down tested",
      ]
    ),
  },
  {
    id: 189,
    name: "Chevrolet L83 5.3L + 8L90 Drivetrain Package",
    brand: "chevrolet",
    platform: "gm-gen-v-packages",
    price: 9199,
    horsepower: "355 HP",
    fitment: "RWD / 4WD GM Gen V swap projects",
    createdAt: 1_741_903_000_000,
    ...media("gm-l83-8l90-drivetrain", ["1.jpg", "2.jpg", "3.jpg", "4.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet L83 5.3L + 8L90 Drivetrain Package",
      "Budget-friendly Gen V swap package combining the L83 5.3L with an 8L90 eight-speed automatic. Delivers modern fuel economy and smooth shifting in a single freight shipment.",
      {
        Engine: "L83 5.3L V8",
        Transmission: "GM 8L90 8-speed automatic",
        "Factory Power": "355 HP (approx.)",
        "Included": "Engine, transmission, OEM harness",
      },
      [
        "Strong value complete drivetrain",
        "8-speed modern gearing",
        "Ideal for trucks, SUVs, and restomods",
        "Tested engine prior to shipment",
        "Harness included for faster installs",
      ]
    ),
  },
  {
    id: 190,
    name: "Chevrolet L84 5.3L + 8L90 Drivetrain Package",
    brand: "chevrolet",
    platform: "gm-l84",
    price: 7999,
    horsepower: "355 HP",
    fitment: "GM Gen V active fuel management delete swap builds",
    createdAt: 1_741_904_000_000,
    ...media("gm-l84-8l90-drivetrain", ["1.jpg", "2.jpg", "3.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet L84 5.3L + 8L90 Drivetrain Package",
      "Gen V 5.3L L84 paired with the 8L90 transmission for builders who want a complete package with AFM/DOD already addressed on many donor units.",
      {
        Engine: "L84 5.3L V8",
        Transmission: "GM 8L90 8-speed automatic",
        "Factory Power": "355 HP (approx.)",
        Configuration: "RWD / 4WD donor dependent",
      },
      [
        "Complete engine and trans package",
        "Popular for AFM-delete swap plans",
        "Modern 8-speed driveability",
        "Compression tested before ship",
        "Freight-ready pallet shipping",
      ]
    ),
  },
  {
    id: 191,
    name: "Chevrolet LV3 4.3L V6 + 6L80 Drivetrain Package",
    brand: "chevrolet",
    platform: "gm-lv3",
    price: 4499,
    horsepower: "285 HP",
    fitment: "Compact swap projects needing V6 weight savings",
    createdAt: 1_741_905_000_000,
    ...media("gm-lv3-6l80-drivetrain", ["1.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet LV3 4.3L V6 + 6L80 Drivetrain Package",
      "Lightweight Gen V V6 with 6L80 six-speed automatic — a smart option when chassis space or front-end weight is limited but you still want electronic fuel injection and overdrive.",
      {
        Engine: "LV3 4.3L V6",
        Transmission: "GM 6L80 6-speed automatic",
        "Factory Power": "285 HP (approx.)",
        Configuration: "RWD truck donor",
      },
      [
        "Compact V6 swap footprint",
        "6L80 proven automatic",
        "Lower front-end mass vs V8",
        "Gen V EFI reliability",
        "Budget-friendly complete package",
      ]
    ),
  },
  {
    id: 192,
    name: "Ford Gen 3 Coyote Complete Drivetrain",
    brand: "ford",
    platform: "ford-coyote-gen3-drivetrain",
    price: 16576,
    horsepower: "460 HP",
    fitment: "2018+ Mustang / F-150 Coyote donor applications",
    createdAt: 1_741_906_000_000,
    ...media("ford-gen3-coyote-drivetrain", ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]),
    ...BASE,
    description: swapDescription(
      "Ford Gen 3 Coyote Complete Drivetrain",
      "Third-generation Coyote 5.0L V8 packaged with matching transmission and harness — built for builders who want the latest Ford DOHC V8 without hunting individual components.",
      {
        Engine: "Gen 3 Coyote 5.0L V8",
        "Factory Power": "460 HP (approx.)",
        Configuration: "DOHC V8",
        "Included": "Engine, transmission, harness (confirm accessories at checkout)",
      },
      [
        "Latest Coyote architecture",
        "High-revving DOHC performance",
        "Complete drivetrain convenience",
        "Strong aftermarket support",
        "USA warehouse fulfillment",
      ]
    ),
  },
  {
    id: 193,
    name: "Ford Gen 2 Coyote 5.0L V8 Engine",
    brand: "ford",
    platform: "ford-coyote-gen2",
    price: 10999,
    horsepower: "435 HP",
    fitment: "2015–2017 Coyote donor swap applications",
    createdAt: 1_741_907_000_000,
    ...media("ford-gen2-coyote", ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]),
    ...BASE,
    description: swapDescription(
      "Ford Gen 2 Coyote 5.0L V8 Engine",
      "Second-generation Coyote 5.0L — a sweet spot for swap builds balancing cost, parts availability, and 400+ horsepower natively aspirated.",
      {
        Engine: "Gen 2 Coyote 5.0L V8",
        Configuration: "DOHC V8",
        "Factory Power": "435 HP (approx.)",
        Aspiration: "Naturally aspirated",
      },
      [
        "Proven Gen 2 Coyote platform",
        "Wide donor pool in salvage market",
        "Excellent swap community support",
        "Inspection prior to shipment",
        "Pairs with Tremec and auto swap kits",
      ]
    ),
  },
  {
    id: 194,
    name: "Ford 3.5L EcoBoost V6 Engine",
    brand: "ford",
    platform: "ford-ecoboost-3-5",
    price: 9999,
    horsepower: "365–450 HP (application dependent)",
    fitment: "F-150 / Explorer EcoBoost donor swaps",
    createdAt: 1_741_908_000_000,
    ...media("ford-ecoboost-3-5", ["1.jpg", "2.jpg", "3.jpg", "4.jpg"]),
    ...BASE,
    description: swapDescription(
      "Ford 3.5L EcoBoost V6 Engine",
      "Twin-turbocharged 3.5L EcoBoost V6 delivering V8-rivaling torque in a lighter package — ideal for performance trucks and creative swap platforms.",
      {
        Engine: "3.5L EcoBoost V6",
        Aspiration: "Twin-turbocharged",
        Configuration: "V6",
        "Fuel System": "Direct + port injection (generation dependent)",
      },
      [
        "Twin-turbo factory power",
        "Lighter than comparable V8",
        "Strong low-end torque",
        "Popular in modern truck swaps",
        "Inspected takeout inventory",
      ]
    ),
  },
  {
    id: 195,
    name: "Chevrolet LT4 Supercharged 6.2L Swap Crate Package",
    brand: "chevrolet",
    platform: "gm-lt-packages",
    price: 27386,
    horsepower: "650 HP",
    fitment: "Custom swap — supercharged Gen V LT applications",
    createdAt: 1_741_909_000_000,
    ...media("gm-lt4-supercharged-swap-crate", ["1.jpg", "2.jpg", "3.jpg", "6.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet LT4 Supercharged 6.2L Swap Crate Package",
      "Supercharged Gen V LT4 6.2L packaged for serious swap power — factory intercooled blower, integrated cooling, and crate-level completeness for high-horsepower street builds.",
      {
        Engine: "LT4 6.2L supercharged V8",
        "Factory Power": "650 HP (approx.)",
        Aspiration: "Supercharged",
        "Included": "Engine, supercharger assembly, front drive (package dependent)",
      },
      [
        "650 HP factory-rated platform",
        "Integrated intercooled supercharger",
        "Crate-style swap completeness",
        "Track-capable Gen V architecture",
        "Premium freight handling available",
      ]
    ),
  },
  {
    id: 196,
    name: "GM Gen V 6.2L Complete Swap Package",
    brand: "chevrolet",
    platform: "gm-gen-v-packages",
    price: 23062,
    horsepower: "420–460 HP (engine variant dependent)",
    fitment: "Full Gen V swap — engine, trans, harness",
    createdAt: 1_741_910_000_000,
    ...media("gm-gen-v-6-2-package", ["2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"]),
    ...BASE,
    description: swapDescription(
      "GM Gen V 6.2L Complete Swap Package",
      "Turn-key Gen V 6.2L swap bundle with matched transmission, wiring, and calibration support options — designed to shorten the timeline from pallet to first start.",
      {
        Engine: "Gen V 6.2L V8 (L86/L87 family)",
        Transmission: "8-speed automatic (package matched)",
        "Included": "Harness, ECU, trans controller (package tier dependent)",
        Configuration: "RWD / 4WD options",
      },
      [
        "Complete Gen V swap ecosystem",
        "Matched engine and transmission",
        "Wiring and control modules included",
        "Ideal for first-time swap builders",
        "Technical support available at checkout",
      ]
    ),
  },
  {
    id: 197,
    name: "GM LT Twin-Turbo Complete Drivetrain",
    brand: "chevrolet",
    platform: "gm-lt-packages",
    price: 43961,
    horsepower: "800+ HP (package dependent)",
    fitment: "High-performance LT-based custom swap builds",
    createdAt: 1_741_911_000_000,
    ...media("gm-lt-twin-turbo-drivetrain", ["2.jpg", "4.jpg", "5.jpg"]),
    ...BASE,
    description: swapDescription(
      "GM LT Twin-Turbo Complete Drivetrain",
      "Factory-style twin-turbo Gen V LT package for builders targeting four-digit horsepower with modern engine management and matched driveline components.",
      {
        Engine: "Gen V LT series V8",
        Aspiration: "Twin-turbocharged",
        "Power Target": "800+ HP (calibration dependent)",
        Transmission: "Matched automatic (package spec)",
      },
      [
        "Twin-turbo LT architecture",
        "Built for high-horsepower swaps",
        "Integrated boost and fuel control",
        "Complete drivetrain coordination",
        "Premium build tier fulfillment",
      ]
    ),
  },
  {
    id: 198,
    name: "GM 6.6L Duramax Diesel Engine",
    brand: "chevrolet",
    platform: "gm-duramax-6-6",
    price: 12252,
    horsepower: "445 HP",
    fitment: "HD truck diesel swap / repower projects",
    createdAt: 1_741_912_000_000,
    ...media("gm-duramax-6-6", ["1.jpg", "2.jpg", "3.jpg"]),
    ...BASE,
    mileage: "Verified low-mile takeout",
    description: swapDescription(
      "GM 6.6L Duramax Diesel Engine",
      "6.6L Duramax L5P/LML-family diesel for tow-heavy swap builds and repower projects — massive torque and modern common-rail efficiency in a freight-ready unit.",
      {
        Engine: "6.6L Duramax diesel",
        Configuration: "Inline-6 turbo diesel",
        "Factory Power": "445 HP (approx.)",
        Torque: "910 lb-ft (approx.)",
        Aspiration: "Turbocharged diesel",
      },
      [
        "Legendary Duramax torque",
        "Ideal for tow and work-truck swaps",
        "Modern emissions-era fuel economy",
        "Compression tested before shipment",
        "Diesel freight specialists on request",
      ]
    ),
  },
  {
    id: 199,
    name: "GM LTX Complete Swap Drivetrain Package",
    brand: "chevrolet",
    platform: "gm-lt-packages",
    price: 84462,
    horsepower: "750+ HP (package dependent)",
    fitment: "No-compromise LT swap — engine, trans, controls",
    createdAt: 1_741_913_000_000,
    ...media("gm-ltx-complete-swap", ["2.jpg", "3.jpg", "4.jpg", "5.jpg"]),
    ...BASE,
    description: swapDescription(
      "GM LTX Complete Swap Drivetrain Package",
      "Flagship Gen V LT swap program with matched transmission, cooling, controls, and installation documentation — for builders who want a single supplier for the entire powertrain.",
      {
        Engine: "Gen V LT performance series",
        Transmission: "Matched automatic",
        "Included": "Harness, ECU, cooling, swap documentation",
        "Power Tier": "750+ HP capable (package dependent)",
      },
      [
        "Top-tier complete swap program",
        "Matched components end-to-end",
        "Built for serious horsepower goals",
        "Dedicated swap documentation",
        "White-glove freight coordination",
      ]
    ),
  },
  {
    id: 200,
    name: "GM LT Road-Race Complete Swap Drivetrain",
    brand: "chevrolet",
    platform: "gm-lt-packages",
    price: 72247,
    horsepower: "650+ HP",
    fitment: "Track-oriented LT swap — road race / time attack",
    createdAt: 1_741_914_000_000,
    ...media("gm-lt-r-complete-swap", ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]),
    ...BASE,
    description: swapDescription(
      "GM LT Road-Race Complete Swap Drivetrain",
      "Track-biased Gen V LT swap package emphasizing cooling, oil control, and driveline durability for sustained road-course use.",
      {
        Engine: "Gen V LT series V8",
        "Package Focus": "Road race / time attack",
        Transmission: "Matched performance automatic",
        Cooling: "Enhanced swap cooling package",
      },
      [
        "Built for sustained track use",
        "Enhanced cooling and oiling",
        "Complete controls and harness",
        "Road-race validated component spec",
        "Technical consultation available",
      ]
    ),
  },
  {
    id: 201,
    name: "Chevrolet LS3 / L99 Complete Drivetrain",
    brand: "chevrolet",
    platform: "gm-ls-drivetrains",
    price: 10999,
    horsepower: "400–430 HP",
    fitment: "Classic LS swap with modern 6-speed auto",
    createdAt: 1_741_915_000_000,
    ...media("gm-ls3-l99-drivetrain", ["1.jpg", "2.jpg", "3.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet LS3 / L99 Complete Drivetrain",
      "LS3 or L99 engine mated to a modern automatic transmission — the classic LS swap formula with contemporary gearing and driveability.",
      {
        Engine: "LS3 / L99 6.2L V8",
        Transmission: "6-speed automatic (donor matched)",
        "Factory Power": "400–430 HP (variant dependent)",
        Configuration: "RWD",
      },
      [
        "Legendary LS swap platform",
        "Complete engine and transmission",
        "Huge aftermarket support",
        "Proven reliability",
        "Compression tested units",
      ]
    ),
  },
  {
    id: 202,
    name: "Chevrolet LSA Supercharged Drivetrain",
    brand: "chevrolet",
    platform: "gm-ls-drivetrains",
    price: 12999,
    horsepower: "556 HP",
    fitment: "Supercharged LS swap — CTS-V / Camaro donor",
    createdAt: 1_741_916_000_000,
    ...media("gm-lsa-drivetrain", ["1.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet LSA Supercharged Drivetrain",
      "Factory-supercharged LSA 6.2L with matched driveline — 556 horsepower of blower-backed LS power for street and strip builds.",
      {
        Engine: "LSA 6.2L supercharged V8",
        "Factory Power": "556 HP",
        Aspiration: "Supercharged",
        "Included": "Engine and matched transmission",
      },
      [
        "Factory supercharged LS power",
        "556 HP rated platform",
        "Complete drivetrain package",
        "Strong low-end torque",
        "Inspection prior to shipment",
      ]
    ),
  },
  {
    id: 203,
    name: "Chevrolet L86 6.2L + 10L80 Drivetrain Package",
    brand: "chevrolet",
    platform: "gm-gen-v-packages",
    price: 13499,
    horsepower: "420 HP",
    fitment: "Latest GM 10-speed swap applications",
    createdAt: 1_741_917_000_000,
    ...media("gm-l86-10l80-drivetrain", ["1.jpg", "2.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet L86 6.2L + 10L80 Drivetrain Package",
      "L86 6.2L V8 paired with the 10L80 ten-speed automatic for builders who want the newest GM transmission technology in their swap.",
      {
        Engine: "L86 6.2L V8",
        Transmission: "GM 10L80 10-speed automatic",
        "Factory Power": "420 HP (approx.)",
        Configuration: "RWD / 4WD donor dependent",
      },
      [
        "Latest 10-speed GM trans",
        "Tighter gearing spread",
        "Modern Gen V engine",
        "Complete harness package",
        "Ideal for performance trucks",
      ]
    ),
  },
  {
    id: 204,
    name: "Chevrolet Gen V LT1 + 10L80 Drivetrain",
    brand: "chevrolet",
    platform: "gm-lt-packages",
    price: 11999,
    horsepower: "455 HP",
    fitment: "Camaro / Corvette LT1 donor swap builds",
    createdAt: 1_741_918_000_000,
    ...media("gm-lt1-10l80-drivetrain", ["1.jpg", "2.jpg", "3.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet Gen V LT1 + 10L80 Drivetrain",
      "Corvette-derived LT1 6.2L with 10L80 ten-speed — performance-car calibration in a swap-ready freight package.",
      {
        Engine: "LT1 6.2L V8",
        Transmission: "GM 10L80 10-speed automatic",
        "Factory Power": "455 HP",
        Configuration: "RWD",
      },
      [
        "Corvette LT1 performance",
        "10-speed modern gearing",
        "Direct-injected Gen V",
        "Complete swap harness",
        "Track and street capable",
      ]
    ),
  },
  {
    id: 205,
    name: "Ford 6.7L Powerstroke + 10-Speed Diesel Drivetrain",
    brand: "ford",
    platform: "ford-powerstroke-6-7",
    price: 18499,
    horsepower: "475 HP",
    fitment: "Super Duty diesel repower / swap",
    createdAt: 1_741_919_000_000,
    ...media("ford-powerstroke-6-7-drivetrain", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.jpg",
    ]),
    ...BASE,
    mileage: "Low-mile diesel takeout",
    description: swapDescription(
      "Ford 6.7L Powerstroke + 10-Speed Diesel Drivetrain",
      "Ford 6.7L Power Stroke diesel with 10-speed automatic — the ultimate tow and work package for heavy-duty swap and repower projects.",
      {
        Engine: "6.7L Power Stroke diesel V8",
        Transmission: "Ford 10-speed automatic",
        "Factory Power": "475 HP (approx.)",
        Torque: "1,050 lb-ft (approx.)",
      },
      [
        "Class-leading diesel torque",
        "Modern 10-speed pairing",
        "Super Duty proven durability",
        "Complete harness when available",
        "Diesel freight specialists",
      ]
    ),
  },
  {
    id: 206,
    name: "Chevrolet LT4 + TR6060 Manual Drivetrain",
    brand: "chevrolet",
    platform: "gm-lt-packages",
    price: 18999,
    horsepower: "650 HP",
    fitment: "Manual swap — LT4 with Tremec TR6060",
    createdAt: 1_741_920_000_000,
    ...media("gm-lt4-tr6060-drivetrain", ["1.jpg", "2.jpg", "3.jpg", "4.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet LT4 + TR6060 Manual Drivetrain",
      "Supercharged LT4 paired with a Tremec TR6060 six-speed manual for drivers who want blower power with a third pedal.",
      {
        Engine: "LT4 6.2L supercharged V8",
        Transmission: "Tremec TR6060 6-speed manual",
        "Factory Power": "650 HP",
        "Oil System": "Wet-sump (package spec)",
      },
      [
        "650 HP supercharged LT4",
        "TR6060 manual engagement",
        "Track-capable pairing",
        "Complete clutch and trans included",
        "Built for enthusiast swaps",
      ]
    ),
  },
  {
    id: 207,
    name: "GM LT4 New Complete Drivetrain Package",
    brand: "chevrolet",
    platform: "gm-lt-packages",
    price: 32499,
    horsepower: "650 HP",
    fitment: "New-condition LT4 complete swap",
    createdAt: 1_741_921_000_000,
    ...media("gm-lt4-new-drivetrain", ["3.jpg", "4.jpg", "5.jpg"]),
    ...BASE,
    mileage: "0 Miles / crate-grade",
    description: swapDescription(
      "GM LT4 New Complete Drivetrain Package",
      "New-grade LT4 supercharged package with matched transmission and full control suite — for builders who want minimum miles and maximum completeness.",
      {
        Engine: "LT4 6.2L supercharged V8",
        Condition: "New / crate-grade",
        "Factory Power": "650 HP",
        "Included": "Engine, trans, harness, ECU, accessories (tier dependent)",
      },
      [
        "New-condition LT4 package",
        "650 HP supercharged",
        "Full control module suite",
        "Turn-key swap orientation",
        "Premium white-glove freight",
      ]
    ),
  },
  {
    id: 208,
    name: "Ford Coyote GT-S Performance Package",
    brand: "ford",
    platform: "ford-coyote-packages",
    price: 29999,
    horsepower: "750 HP (package target)",
    fitment: "High-performance Coyote swap — supercharged",
    createdAt: 1_741_922_000_000,
    ...media("ford-coyote-gt-s", ["1.jpg", "2.jpg", "3.jpg"]),
    ...BASE,
    description: swapDescription(
      "Ford Coyote GT-S Performance Package",
      "Supercharged Coyote swap program targeting 750 horsepower with matched cooling, fuel system, and driveline components for serious street performance.",
      {
        Engine: "Coyote 5.0L V8",
        Aspiration: "Supercharged (package spec)",
        "Power Target": "750 HP",
        Transmission: "Matched automatic or manual (tier dependent)",
      },
      [
        "750 HP target package",
        "Supercharged Coyote architecture",
        "Integrated cooling and fuel upgrades",
        "Complete swap coordination",
        "Built for modern muscle swaps",
      ]
    ),
  },
  {
    id: 209,
    name: "Ford Coyote GT-T Twin-Turbo Drivetrain",
    brand: "ford",
    platform: "ford-coyote-packages",
    price: 36999,
    horsepower: "900+ HP (package target)",
    fitment: "Twin-turbo Coyote swap — max effort street / strip",
    createdAt: 1_741_923_000_000,
    ...media("ford-coyote-gt-t", ["1.jpg", "2.jpg", "3.jpg", "4.jpg"]),
    ...BASE,
    description: swapDescription(
      "Ford Coyote GT-T Twin-Turbo Drivetrain",
      "Twin-turbocharged Coyote package engineered for 900+ horsepower goals with matched engine management, fueling, and driveline spec.",
      {
        Engine: "Coyote 5.0L V8",
        Aspiration: "Twin-turbocharged",
        "Power Target": "900+ HP",
        Transmission: "Matched performance trans",
      },
      [
        "Twin-turbo Coyote platform",
        "900+ HP capability",
        "Integrated boost control",
        "Complete drivetrain package",
        "For max-effort swap builds",
      ]
    ),
  },
  {
    id: 210,
    name: "Supercharged LT MAX Performance Package",
    brand: "chevrolet",
    platform: "gm-lt-packages",
    price: 44999,
    horsepower: "900+ HP (package target)",
    fitment: "Ultimate Gen V LT swap — blower + supporting mods",
    createdAt: 1_741_924_000_000,
    ...media("gm-lt-s-max", ["1.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"]),
    ...BASE,
    description: swapDescription(
      "Supercharged LT MAX Performance Package",
      "Top-tier supercharged Gen V LT program with upgraded internals, cooling, and calibration headroom for 900+ horsepower swap applications.",
      {
        Engine: "Gen V LT series V8",
        Aspiration: "Supercharged — enhanced package",
        "Power Target": "900+ HP",
        "Package Tier": "MAX performance",
      },
      [
        "Maximum LT swap package",
        "900+ HP target capability",
        "Upgraded supporting systems",
        "Complete controls included",
        "Concierge swap support available",
      ]
    ),
  },
  {
    id: 211,
    name: "Chevrolet 427 LS7 Complete Drivetrain Package",
    brand: "chevrolet",
    platform: "gm-ls-drivetrains",
    price: 42499,
    horsepower: "505 HP",
    fitment: "NA high-performance LS swap — 7.0L LS7",
    createdAt: 1_741_925_000_000,
    ...media("gm-ls7-427-drivetrain", ["1.jpg", "2.jpg", "3.jpg"]),
    ...BASE,
    description: swapDescription(
      "Chevrolet 427 LS7 Complete Drivetrain Package",
      "7.0L LS7 with matched transmission and swap controls — naturally aspirated 505 horsepower from America's iconic flat-plane NA V8.",
      {
        Engine: "LS7 7.0L V8",
        Displacement: "427 cu in",
        "Factory Power": "505 HP",
        Aspiration: "Naturally aspirated",
        Transmission: "Matched automatic (package spec)",
      },
      [
        "Iconic 427 LS7 NA power",
        "505 HP factory rating",
        "Complete drivetrain package",
        "Track-bred engineering",
        "Premium swap tier fulfillment",
      ]
    ),
  },
];
