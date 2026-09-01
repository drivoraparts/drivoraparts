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
  {
    id: 2102,
    name: "Saginaw P-Series Power Steering Pump (Canned Ham)",
    category: "engine",
    brand: "universal",
    price: 268,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "1960s–1990s GM Cars & Trucks — Saginaw P-Series Wet-Reservoir Pump",
    partNumber: "Saginaw P-Series",
    createdAt: 1785762228000, // listed 2026-08-03
    thumbnail: "/product-media/engine/power-steering-saginaw-p-series/1.jpg",
    images: ["/product-media/engine/power-steering-saginaw-p-series/1.jpg"],
    description: `Saginaw P-Series Power Steering Pump (Canned Ham)

Brand-new Saginaw P-Series power steering pump — the classic "canned ham" wet-reservoir style fitted to GM cars and trucks from the 1960s through the 1990s. Steel reservoir with black finish for a clean, factory-style appearance.

Specifications
• Part Type: Saginaw P-Series Wet-Reservoir Power Steering Pump
• Condition: Brand New
• Reservoir: Integrated steel "canned ham" style
• Finish: Black
• Manufacturer: DrivoraParts Sourced OEM+ Supplier

Highlights
• Classic Saginaw P-Series Architecture
• Direct Fit for Period-Correct GM Restorations
• Integrated Wet Reservoir — No Remote Tank Needed
• Clean Black Finish
• Confirm Bracket & Pulley Compatibility Before Ordering

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 2103,
    name: "GM Type II (TC/CB Series) Power Steering Pump",
    category: "engine",
    brand: "universal",
    price: 240,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "GM LS Swaps, Corvettes & Trucks — Type II TC/CB Series (Remote Reservoir)",
    partNumber: "GM Type II (TC/CB Series)",
    createdAt: 1785762228000, // listed 2026-08-03
    thumbnail: "/product-media/engine/power-steering-gm-type-ii/1.jpg",
    images: ["/product-media/engine/power-steering-gm-type-ii/1.jpg"],
    description: `GM Type II (TC/CB Series) Power Steering Pump

Brand-new GM Type II power steering pump for remote-reservoir setups — the compact aluminum-housed pump found on Corvettes (TC series) and SUVs/trucks (CB series), a popular choice for LS swaps running braided accessory drives.

Specifications
• Part Type: GM Type II Power Steering Pump (TC/CB Series)
• Condition: Brand New
• Housing: Aluminum, remote-reservoir configuration
• Fittings: AN female inlet/outlet for braided hose setups
• Manufacturer: DrivoraParts Sourced OEM+ Supplier

Highlights
• Compact Type II Architecture for LS Swaps
• Remote Reservoir — Tight Engine Bay Friendly
• Press-On Shaft, AN-Ready Fittings
• Common Corvette & Truck Fitment Base
• Confirm TC vs. CB Shaft Spec Before Ordering

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 2104,
    name: "CBR/CBX Racing Series Power Steering Pump",
    category: "engine",
    brand: "universal",
    price: 403,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "Off-Road, Hydro-Boost & High-Flow Racing Applications — CBR/CBX Series",
    partNumber: "CBR/CBX Racing Series",
    createdAt: 1785762228000, // listed 2026-08-03
    thumbnail: "/product-media/engine/power-steering-cbr-cbx-racing/1.jpg",
    images: ["/product-media/engine/power-steering-cbr-cbx-racing/1.jpg"],
    description: `CBR/CBX Racing Series Power Steering Pump

Brand-new high-flow CBR/CBX-style racing power steering pump, built for off-road, hydro-assist brake, and full-hydraulic steering applications that need more volume and pressure than a stock pump can deliver.

Specifications
• Part Type: CBR/CBX High-Flow Racing Power Steering Pump
• Condition: Brand New
• Application: Off-Road / Hydro-Boost / Full Hydraulic Steering
• Fittings: High-flow AN ports
• Manufacturer: DrivoraParts Sourced OEM+ Supplier

Highlights
• High-Flow, High-Pressure Racing Pump
• Suited to Hydro-Boost Brake Conversions
• Compatible with Most Aftermarket Accessory Drives
• Built for Off-Road & Full-Hydraulic Setups
• Confirm Port Size & Flow Spec for Your Application

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 2105,
    name: "Turn One Power Steering Pump",
    category: "engine",
    brand: "turn-one",
    price: 449,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "GM LS & F-Body Applications — Confirm Fitting/Mount Spec at Checkout",
    createdAt: 1785762228000, // listed 2026-08-03
    thumbnail: "/product-media/engine/power-steering-turn-one/1.jpg",
    images: ["/product-media/engine/power-steering-turn-one/1.jpg"],
    description: `Turn One Power Steering Pump

Brand-new Turn One power steering pump, hand-built with proprietary internals engineered to reduce parasitic horsepower loss and fluid temperature versus a factory-style Type II pump — a popular Stage 1 upgrade for LS-swapped and F-body builds.

Specifications
• Part Type: Turn One Performance Power Steering Pump
• Condition: Brand New
• Housing: Lightweight aluminum
• Application: GM LS & F-Body platforms
• Manufacturer: DrivoraParts Sourced OEM+ Supplier

Highlights
• Hand-Built Performance Internals
• Reduced Parasitic Horsepower Loss
• Lower Operating Fluid Temperature
• Popular LS Swap & F-Body Upgrade
• Confirm Fitting/Mount Spec Before Ordering

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 2106,
    name: "Borgeson Universal Power Steering Pump",
    category: "engine",
    brand: "borgeson",
    price: 249,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "Street Rods, Chevy, Ford, Mopar — Confirm Application at Checkout",
    createdAt: 1785762228000, // listed 2026-08-03
    thumbnail: "/product-media/engine/power-steering-borgeson-universal/1.jpg",
    images: ["/product-media/engine/power-steering-borgeson-universal/1.jpg"],
    description: `Borgeson Universal Power Steering Pump

Brand-new GM-pressure power steering pump from Borgeson Universal — assembled and tested in the USA, built for street rods, muscle cars, and custom builds across Chevy, Ford, and Mopar platforms.

Specifications
• Part Type: Self-Contained Power Steering Pump
• Condition: Brand New
• Pressure Spec: GM pressure
• Testing: Assembled & tested in the USA
• Manufacturer: DrivoraParts Sourced OEM+ Supplier

Highlights
• Trusted Aftermarket Steering Specialist Brand
• Assembled & Tested in the USA
• Fits a Wide Range of Street Rod & Muscle Car Builds
• Self-Contained — No Separate Reservoir Needed
• Confirm Bracket & Pulley Match Before Ordering

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 2107,
    name: "UniSteer Performance Power Steering Pump",
    category: "engine",
    brand: "unisteer",
    price: 252,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "GM Type II / TC Applications — Low-Flow, Confirm Spec at Checkout",
    createdAt: 1785762228000, // listed 2026-08-03
    thumbnail: "/product-media/engine/power-steering-unisteer/1.jpg",
    images: ["/product-media/engine/power-steering-unisteer/1.jpg"],
    description: `UniSteer Performance Power Steering Pump

Brand-new UniSteer Type II/TC-style power steering pump, individually set to its designated flow and pressure and function-tested on UniSteer's in-house test stand before shipping.

Specifications
• Part Type: Gen II/TC Aluminum Power Steering Pump
• Condition: Brand New
• Finish: Natural aluminum
• Testing: Factory flow/pressure tested
• Manufacturer: DrivoraParts Sourced OEM+ Supplier

Highlights
• Factory Flow & Pressure Tested Before Shipping
• Aluminum Housing, Low-Flow Type II/TC Spec
• Trusted Street Rod & Muscle Car Steering Brand
• Backed by Manufacturer Limited Warranty
• Confirm Fitting Configuration Before Ordering

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 2108,
    name: "PSC Motorsports Power Steering Pump",
    category: "engine",
    brand: "psc-motorsports",
    price: 326,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "High-Displacement Saginaw P-Series Application — Confirm Spec at Checkout",
    createdAt: 1785762228000, // listed 2026-08-03
    thumbnail: "/product-media/engine/power-steering-psc-motorsports/1.jpg",
    images: ["/product-media/engine/power-steering-psc-motorsports/1.jpg"],
    description: `PSC Motorsports Power Steering Pump

Brand-new PSC Motorsports high-displacement Saginaw P-Series power steering pump — built by one of the most trusted names in off-road and racing steering systems for demanding full-hydraulic and hydro-assist applications.

Specifications
• Part Type: High-Displacement Saginaw P-Series Power Steering Pump
• Condition: Brand New
• Application: Off-road / racing / hydro-assist
• Manufacturer: DrivoraParts Sourced OEM+ Supplier

Highlights
• High-Displacement Racing-Spec Internals
• Trusted PSC Off-Road & Racing Pedigree
• Suited to Demanding Hydro-Assist Applications
• Durable Construction for Competition Use
• Confirm Displacement Spec for Your Setup

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 2109,
    name: "Tuff Stuff Performance Power Steering Pump (Chrome)",
    category: "engine",
    brand: "tuff-stuff",
    price: 352,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "GM Saginaw-Style Applications, Keyed Shaft — Confirm Spec at Checkout",
    createdAt: 1785762228000, // listed 2026-08-03
    thumbnail: "/product-media/engine/power-steering-tuff-stuff/1.jpg",
    images: ["/product-media/engine/power-steering-tuff-stuff/1.jpg"],
    description: `Tuff Stuff Performance Power Steering Pump (Chrome)

Brand-new 100% new-component Tuff Stuff Saginaw-style power steering pump in a show-quality chrome finish, with billet-style cap and new dipstick — built in the USA to fix leaks and restore proper steering feel.

Specifications
• Part Type: Saginaw-Style Power Steering Pump
• Condition: Brand New — 100% New Components
• Finish: Chrome
• Made In: USA
• Manufacturer: DrivoraParts Sourced OEM+ Supplier

Highlights
• 100% New Components, Made in the USA
• Show-Quality Chrome Finish
• Billet-Style Cap & New Dipstick Included
• Keyed Shaft, Bolt-On Saginaw Fitment
• Confirm Shaft & Mounting Spec Before Ordering

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 2110,
    name: "ACDelco GM Original Equipment Power Steering Pump",
    category: "engine",
    brand: "acdelco",
    price: 261,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "GM Cars & Trucks (incl. Silverado/Suburban/Yukon/Tahoe) — Confirm Fitment at Checkout",
    partNumber: "19420691",
    createdAt: 1785762228000, // listed 2026-08-03
    thumbnail: "/product-media/engine/power-steering-acdelco/1.jpg",
    images: ["/product-media/engine/power-steering-acdelco/1.jpg"],
    description: `ACDelco GM Original Equipment Power Steering Pump

Brand-new ACDelco GM Original Equipment power steering pump — cast iron construction built to GM factory specification for direct OE-quality replacement on eligible GM cars and trucks.

Specifications
• Part Type: GM Original Equipment Power Steering Pump
• Condition: Brand New
• Construction: Cast iron
• Manufacturer Part Number: 19420691
• Manufacturer: ACDelco (GM Original Equipment)

Highlights
• Genuine GM Original Equipment Spec
• Cast Iron Durability
• Direct OE-Quality Replacement
• Trusted OEM Supplier Brand
• Confirm Exact Vehicle Fitment Before Ordering

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 2111,
    name: "Motorcraft Power Steering Pump",
    category: "engine",
    brand: "motorcraft",
    price: 241,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "Ford, Lincoln & Mercury Applications — Confirm Fitment at Checkout",
    partNumber: "STP320",
    createdAt: 1785762228000, // listed 2026-08-03
    thumbnail: "/product-media/engine/power-steering-motorcraft/1.jpg",
    images: ["/product-media/engine/power-steering-motorcraft/1.jpg"],
    description: `Motorcraft Power Steering Pump

Brand-new Motorcraft power steering pump, manufactured to exact Ford OE specification — the only power steering pump brand recommended by Ford Motor Company for Ford, Lincoln, and Mercury vehicles.

Specifications
• Part Type: Ford OE Power Steering Pump
• Condition: Brand New
• Manufacturer Part Number: STP320
• Manufacturer: Motorcraft (Ford OE)

Highlights
• Genuine Ford OE Specification
• Ford-Recommended Steering Component Brand
• Direct-Fit Belt-Driven Design
• Consistent OE Pressure & Flow
• Confirm Exact Vehicle Fitment Before Ordering

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 2112,
    name: "Delphi Power Steering Pump",
    category: "engine",
    brand: "delphi",
    price: 108,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "GM C5 Corvette (1998–2006) and Related Applications — Confirm Fitment at Checkout",
    partNumber: "26120639",
    createdAt: 1785762228000, // listed 2026-08-03
    thumbnail: "/product-media/engine/power-steering-delphi/1.jpg",
    images: ["/product-media/engine/power-steering-delphi/1.jpg"],
    description: `Delphi Power Steering Pump

Brand-new Delphi power steering pump built to genuine GM specification — a direct OE-quality fit for C5 Corvette and related GM applications.

Specifications
• Part Type: OE Power Steering Pump
• Condition: Brand New
• Manufacturer Part Number: 26120639
• Manufacturer: Delphi Technologies (GM OE Supplier)

Highlights
• Genuine GM OE Specification
• Direct Fit for C5 Corvette Applications
• Major OEM Supplier Quality
• Consistent OE Pressure & Flow
• Confirm Exact Vehicle Fitment Before Ordering

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 2101,
    name: "Universal Power Steering Pump",
    category: "engine",
    brand: "universal",
    price: 300,
    stock: true,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: "Universal Fit — Confirm Application/Pulley Match at Checkout",
    createdAt: 1785758693000, // listed 2026-08-03
    thumbnail: "/product-media/engine/power-steering-pump-universal/1.jpg",
    images: [
      "/product-media/engine/power-steering-pump-universal/1.jpg",
      "/product-media/engine/power-steering-pump-universal/2.jpg",
    ],
    description: `Universal Power Steering Pump

Brand-new universal-fit power steering pump with serpentine pulley, built to restore full hydraulic assist and eliminate worn-pump noise, leaks, and stiff steering feel.

Specifications
• Part Type: Power Steering Pump, Universal Fit
• Condition: Brand New
• Pulley: Serpentine (multi-groove)
• Manufacturer: DrivoraParts Sourced OEM+ Supplier

Highlights
• Brand-New, Never Installed
• Restores Full Hydraulic Steering Assist
• Direct Serpentine Pulley Fitment
• Eliminates Pump Whine & Steering Stiffness
• Confirm Port/Pulley Match to Your Application Before Ordering

Warranty
12-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
];
