/* =========================================================
   DRIVORAPARTS — PRODUCT FITMENT & LOGISTICS (CENTRAL MAP)
   ---------------------------------------------------------
   Structured "Fitment & Logistics" data keyed by product id.
   Merged at the data layer by getProductCatalogMeta — any
   field set inline on a Product object takes priority over
   the value here, and rows only render when a value exists.

   Authoring notes:
   - `fitment`   : the vehicles/chassis/years a part fits.
   - `drivetrain`: only meaningful for complete engines.
   - `included`  : what physically ships with the unit.
   - `coreCharge`: OUTRIGHT for new crate units; CORE_REQUIRED
                   for rebuildable reman/refurbished cores.
   - `freightNotes` / `warrantyTerms`: store-level policy.
========================================================= */

import type { ProductLogistics } from "./types";

const ENGINE_FREIGHT =
  "Ships as palletized heavy freight. Liftgate service and residential delivery available at checkout; a commercial address is recommended for fastest handling.";
const KIT_FREIGHT =
  "Ships in multiple insured boxes via ground courier; larger kits may be palletized.";
const PARCEL_FREIGHT =
  "Ships via standard insured parcel/courier — no special freight handling required.";

const OUTRIGHT = "Outright sale — no core charge or core return required.";
const CORE_REQUIRED =
  "Core charge applies — fully refundable when your rebuildable original unit is returned. Exact amount confirmed at checkout.";

const PARTS_ONLY =
  "Parts only — labor, installation, and consequential costs are not covered.";

export const productLogistics: Record<number, ProductLogistics> = {
  /* =====================================================
     ENGINES
  ===================================================== */
  1: {
    partNumber: "N54B30 (BMW Engine Code)",
    fitment:
      "Fits BMW 135i (E82/E88), 335i (E90/E92/E93), 535i (E60) & X6 xDrive35i (E71), 2007–2016. Mates to BMW GS6 6-speed manual and GA6HP 6-speed automatic bellhousing patterns.",
    drivetrain: "RWD — compatible with xDrive AWD applications",
    included: [
      "Complete long block assembly",
      "Factory twin turbochargers",
      "Fuel injectors & high-pressure fuel pump (HPFP)",
      "Intake & exhaust manifolds",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  33: {
    partNumber: "B58B30 (BMW Engine Code)",
    fitment:
      "Fits BMW 140i/240i (F2x), 340i/440i (F3x), 540i (G30), Z4 M40i & Toyota GR Supra (A90), 2015–present. ZF 8HP automatic / GS6 manual bellhousing.",
    drivetrain: "RWD — compatible with xDrive AWD",
    included: [
      "Complete long block assembly",
      "Twin-scroll turbocharger",
      "Fuel injectors & HPFP",
      "Intake & exhaust manifolds",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  34: {
    partNumber: "2JZ-GTE (Toyota Engine Code)",
    fitment:
      "Fits Toyota Supra MKIV (A80) & Aristo (JZS147/161), 1991–2002. Bellhousing accepts Toyota V160/V161 Getrag 6-speed and R154 manual transmissions.",
    drivetrain: "RWD (longitudinal)",
    included: [
      "Complete long block assembly",
      "Sequential twin turbochargers",
      "Intake & exhaust manifolds",
      "Fuel injectors",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  35: {
    partNumber: "1JZ-GTE (Toyota Engine Code)",
    fitment:
      "Fits Toyota Chaser/Mark II/Soarer/Supra (JZX & JZZ chassis), 1990–2007. Mates to R154 manual / automatic bellhousing.",
    drivetrain: "RWD (longitudinal)",
    included: [
      "Complete long block assembly",
      "Turbocharger(s)",
      "Intake & exhaust manifolds",
      "Fuel injectors",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  36: {
    partNumber: "1UZ-FE (Toyota/Lexus V8 Code)",
    fitment:
      "Fits Lexus LS400, SC400, GS400 & Toyota Crown/Soarer, 1989–2000. A popular RWD V8 swap base.",
    drivetrain: "RWD (longitudinal)",
    included: [
      "Complete long block assembly",
      "Intake manifold",
      "Coil packs",
      "Fuel injectors",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  37: {
    partNumber: "N55B30 (BMW Engine Code)",
    fitment:
      "Fits BMW 135i/235i, 335i/435i (F2x/F3x), 535i (F10) & X3/X4/X5/X6 xDrive35i, 2009–2016. Single twin-scroll turbo.",
    drivetrain: "RWD — compatible with xDrive AWD",
    included: [
      "Complete long block assembly",
      "Twin-scroll turbocharger",
      "Fuel injectors & HPFP",
      "Intake & exhaust manifolds",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  38: {
    partNumber: "S55B30 (BMW M Engine Code)",
    fitment:
      "Fits BMW M3 (F80), M4 (F82/F83) & M2 Competition (F87), 2014–2020. High-performance twin-turbo inline-6.",
    drivetrain: "RWD",
    included: [
      "Complete long block assembly",
      "Twin turbochargers",
      "Fuel injectors & HPFP",
      "Intake & exhaust manifolds",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  39: {
    partNumber: "RB26DETT (Nissan Engine Code)",
    fitment:
      "Fits Nissan Skyline GT-R R32/R33/R34, 1989–2002. Mates to Getrag/Nismo 6-speed bellhousing.",
    drivetrain: "AWD (ATTESA E-TS) — RWD-convertible",
    included: [
      "Complete long block assembly",
      "Sequential twin turbochargers",
      "Intake & exhaust manifolds",
      "Fuel injectors",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  40: {
    partNumber: "S58B30 (BMW M Engine Code)",
    fitment:
      "Fits BMW M3 (G80), M4 (G82/G83), X3 M & X4 M (F97/F98), 2019–present. ZF 8HP / 6-speed manual.",
    drivetrain: "RWD — compatible with M xDrive AWD",
    included: [
      "Complete long block assembly",
      "Twin turbochargers",
      "Fuel injectors & HPFP",
      "Intake & exhaust manifolds",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  41: {
    partNumber: "SR20DET (Nissan Engine Code)",
    fitment:
      "Fits Nissan Silvia/180SX/200SX (S13/S14/S15), 1989–2002. Common RWD swap; FWD variants exist — verify configuration.",
    drivetrain: "RWD (longitudinal turbo variant)",
    included: [
      "Complete long block assembly",
      "Turbocharger",
      "Intake & exhaust manifolds",
      "Fuel injectors",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  42: {
    partNumber: "K20A/K20C (Honda Engine Code)",
    fitment:
      "Fits Honda Civic Si/Type R (EP3/FD2/FK8), Acura RSX & Integra DC5, 2001–present. A popular FWD K-swap base.",
    drivetrain: "FWD (transverse)",
    included: [
      "Complete long block assembly",
      "Intake manifold",
      "Fuel injectors",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  43: {
    partNumber: "K24 (Honda Engine Code)",
    fitment:
      "Fits Honda Accord/CR-V/Element & Acura TSX, 2002–present. Common K-swap base.",
    drivetrain: "FWD (transverse)",
    included: [
      "Complete long block assembly",
      "Intake manifold",
      "Fuel injectors",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  44: {
    partNumber: "M57D30 (BMW Diesel Engine Code)",
    fitment:
      "Fits BMW 330d/530d/730d & X5 3.0d (E46/E39/E38/E53), 1998–2008. Turbo-diesel inline-6.",
    drivetrain: "RWD — compatible with xDrive AWD",
    included: [
      "Complete long block assembly",
      "Turbocharger",
      "Diesel injectors",
      "Intake & exhaust manifolds",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  45: {
    partNumber: "B18C (Honda Engine Code)",
    fitment:
      "Fits Honda/Acura Integra Type R & GS-R (DC2), 1994–2001. FWD transverse VTEC.",
    drivetrain: "FWD (transverse)",
    included: [
      "Complete long block assembly",
      "Intake manifold",
      "Fuel injectors",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  46: {
    partNumber: "13B-REW (Mazda Rotary Code)",
    fitment:
      "Fits Mazda RX-7 FD3S & RX-8 (13B-MSP), 1992–2012. Twin-rotor Wankel; sequential twin turbo on FD.",
    drivetrain: "RWD (longitudinal)",
    included: [
      "Complete rotary engine assembly",
      "Turbocharger(s) where applicable",
      "Intake & exhaust components",
      "Fuel injectors",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  47: {
    partNumber: "6.2L Supercharged HEMI (Hellcrate)",
    fitment:
      "Fits Dodge Challenger/Charger Hellcat (LX/LC) and crate-swap builds. Supplied as a complete crate engine — a popular RWD V8 swap.",
    drivetrain: "RWD",
    included: [
      "Complete crate engine",
      "Supercharger assembly",
      "Fuel injectors",
      "Coil packs",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  48: {
    partNumber: "Coyote 5.0L (Ford Performance Crate)",
    fitment:
      "Fits Ford Mustang GT (S197/S550) & F-150; Ford Performance crate engine for RWD swaps. Mates to MT82 manual / 10R80 automatic.",
    drivetrain: "RWD",
    included: [
      "Complete crate engine",
      "Intake manifold",
      "Fuel injectors",
      "Coil packs",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  49: {
    partNumber: "LS3 6.2L (GM Performance Crate)",
    fitment:
      "Fits Chevrolet Corvette C6, Camaro SS (Gen5) & universal LS swaps. Bellhousing accepts T56/TR6060 manual and 4L/6L automatic patterns.",
    drivetrain: "RWD",
    included: [
      "Complete crate engine",
      "Intake manifold",
      "Fuel injectors",
      "Coil packs",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  50: {
    partNumber: "LS7 7.0L (GM Performance Crate)",
    fitment:
      "Fits Chevrolet Corvette Z06 (C6) & Camaro Z/28; a premium 427ci LS swap base.",
    drivetrain: "RWD",
    included: [
      "Complete crate engine",
      "Intake manifold",
      "Fuel injectors",
      "Coil packs",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  51: {
    partNumber: "LT1 6.2L Gen V (GM Performance)",
    fitment:
      "Fits Chevrolet Corvette C7 Stingray & Camaro SS (Gen6), 2014–present. Direct-injected Gen V small block.",
    drivetrain: "RWD",
    included: [
      "Complete engine assembly",
      "Direct-injection fuel system",
      "Fuel injectors",
      "Coil packs",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  52: {
    partNumber: "LT4 6.2L Supercharged Gen V (GM)",
    fitment:
      "Fits Chevrolet Corvette Z06 (C7), Camaro ZL1 & Cadillac CTS-V, 2015–present. 1.7L supercharger.",
    drivetrain: "RWD",
    included: [
      "Complete engine assembly",
      "Supercharger assembly",
      "Direct-injection fuel system",
      "Fuel injectors",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  53: {
    partNumber: "N63B44 (BMW Engine Code)",
    fitment:
      "Fits BMW 550i/650i/750i (F10/F12/F01) & X5/X6 xDrive50i, 2008–present. Hot-vee twin-turbo V8.",
    drivetrain: "RWD — compatible with xDrive AWD",
    included: [
      "Complete long block assembly",
      "Twin turbochargers",
      "Fuel injectors & HPFP",
      "Intake & exhaust manifolds",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  54: {
    partNumber: "EA888 2.0 TFSI (Audi/VAG Code)",
    fitment:
      "Fits Audi A3/A4/A5/Q5 & VW Golf GTI/R (EA888), 2008–present. Transverse and longitudinal variants exist — verify orientation.",
    drivetrain: "FWD / quattro AWD (verify orientation)",
    included: [
      "Complete long block assembly",
      "Turbocharger",
      "Fuel injectors & HPFP",
      "Intake & exhaust manifolds",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  55: {
    partNumber: "EA825 4.0 TFSI (Audi Engine Code)",
    fitment:
      "Fits Audi S6/S7/S8/RS6/RS7 & A8 (C7/D4), 2012–present. Hot-vee biturbo V8.",
    drivetrain: "AWD (quattro, longitudinal)",
    included: [
      "Complete long block assembly",
      "Twin turbochargers",
      "Fuel injectors & HPFP",
      "Intake & exhaust manifolds",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  56: {
    partNumber: "M113 (Mercedes-Benz Engine Code)",
    fitment:
      "Fits Mercedes-Benz C/E/S/CLK/SL & ML, 1998–2011 (supercharged M113K on AMG). A popular RWD V8 swap.",
    drivetrain: "RWD (longitudinal)",
    included: [
      "Complete long block assembly",
      "Intake manifold",
      "Coil packs",
      "Fuel injectors",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  57: {
    partNumber: "M157 (Mercedes-AMG Engine Code)",
    fitment:
      "Fits Mercedes-AMG E63/S63/CLS63/GL63/ML63, 2011–2018. Hot-vee 5.5L biturbo V8.",
    drivetrain: "RWD — compatible with 4MATIC AWD",
    included: [
      "Complete long block assembly",
      "Twin turbochargers",
      "Fuel injectors",
      "Intake & exhaust manifolds",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  58: {
    partNumber: "VR6 (Volkswagen Engine Code)",
    fitment:
      "Fits VW Golf/Jetta/Corrado/Passat & R32 (2.8L–3.6L VR6), 1991–present. Transverse FWD/4Motion layout.",
    drivetrain: "FWD / 4Motion AWD",
    included: [
      "Complete long block assembly",
      "Intake manifold",
      "Coil packs",
      "Fuel injectors",
      "Factory sensors installed",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },

  /* =====================================================
     TURBO / PERFORMANCE SYSTEMS
  ===================================================== */
  2: {
    partNumber: "Garrett GTX3076R",
    fitment:
      "Universal performance turbocharger — verify turbine housing A/R and flange for your application. Common on 4- and 6-cylinder builds up to ~700 HP.",
    included: [
      "Turbocharger center assembly",
      "Compressor & turbine housings",
      "Mounting gaskets",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  59: {
    partNumber: "HKS SSQV / Super SQV BOV",
    fitment:
      "Universal — fits most turbocharged applications via the included flange/adapter. Verify piping diameter before install.",
    included: [
      "Blow-off valve assembly",
      "Mounting flange / adapter",
      "Hardware & O-rings",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  60: {
    partNumber: "Turbosmart Kompact / Supersonic BOV",
    fitment:
      "Universal — fits most turbocharged applications via the included flange/adapter. Verify piping diameter before install.",
    included: [
      "Blow-off valve assembly",
      "Mounting flange / adapter",
      "Hardware & O-rings",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  61: {
    partNumber: "BorgWarner EFR Series",
    fitment:
      "Universal performance turbocharger — select EFR frame size (e.g. 7064 / 8374 / 9180) for your target power. Verify housing and flange.",
    included: [
      "Turbocharger assembly",
      "Compressor & turbine housings",
      "Integrated wastegate / BOV (model dependent)",
      "Mounting gaskets",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  62: {
    partNumber: "Garrett Complete Turbo Kit",
    fitment:
      "Application-specific bolt-on turbo kit — confirm your vehicle, engine, and year at checkout.",
    included: [
      "Turbocharger",
      "Turbo manifold",
      "Downpipe",
      "Intercooler & charge piping",
      "Wastegate / blow-off valve",
      "Oil feed/drain lines & hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: KIT_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  63: {
    partNumber: "HKS Cat-Back Exhaust System",
    fitment:
      "Application-specific cat-back system — confirm your vehicle and year at checkout.",
    included: [
      "Cat-back exhaust piping",
      "Muffler(s)",
      "Clamps & gaskets",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: KIT_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  64: {
    partNumber: "HKS Downpipe",
    fitment:
      "Application-specific downpipe — confirm your vehicle and engine at checkout.",
    included: ["Downpipe", "Gaskets", "Mounting hardware"],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  65: {
    partNumber: "Garrett GTX3076R Turbo Kit",
    fitment:
      "Application-specific GTX3076R bolt-on kit — confirm your vehicle and engine at checkout.",
    included: [
      "Garrett GTX3076R turbocharger",
      "Turbo manifold",
      "Downpipe",
      "Wastegate",
      "Oil lines & hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: KIT_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  66: {
    partNumber: "Garrett GTX3582R Kit",
    fitment:
      "Application-specific GTX3582R bolt-on kit — confirm your vehicle and engine at checkout.",
    included: [
      "Garrett GTX3582R turbocharger",
      "Turbo manifold",
      "Downpipe",
      "Wastegate",
      "Oil lines & hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: KIT_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  67: {
    partNumber: "Hybrid Turbo (Audi TFSI)",
    fitment:
      "Direct-fit hybrid turbo upgrade for Audi 2.0/2.5 TFSI — confirm your engine code at checkout.",
    included: [
      "Hybrid turbocharger",
      "Mounting gaskets",
      "Hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  68: {
    partNumber: "Hybrid Turbo (BMW N54/N55)",
    fitment:
      "Direct-fit hybrid turbo upgrade for BMW N54/N55 — confirm your engine at checkout.",
    included: [
      "Hybrid turbocharger(s)",
      "Mounting gaskets",
      "Hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  69: {
    partNumber: "HKS Cold Air Intake",
    fitment:
      "Application-specific intake system — confirm your vehicle and year at checkout.",
    included: [
      "Intake pipe",
      "High-flow air filter",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  70: {
    partNumber: "Garrett Front-Mount Intercooler Kit",
    fitment:
      "Application-specific FMIC kit — confirm your vehicle and engine at checkout.",
    included: [
      "Intercooler core",
      "Charge piping",
      "Couplers & clamps",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: KIT_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  71: {
    partNumber: "Precision PT6266",
    fitment:
      "Universal performance turbocharger (~735 HP) — verify housing A/R and flange for your application.",
    included: [
      "Turbocharger assembly",
      "Compressor & turbine housings",
      "Mounting gaskets",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  72: {
    partNumber: "Turbosmart Hyper-Gate / Pro-Gate",
    fitment:
      "Universal external wastegate — verify flange style and spring pressure for your setup.",
    included: [
      "External wastegate",
      "Spring set",
      "Flanges & hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  73: {
    partNumber: "Turbosmart Internal Wastegate Actuator",
    fitment:
      "Universal internal wastegate actuator — verify fitment to your turbine housing.",
    included: [
      "Wastegate actuator",
      "Mounting bracket & hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },

  /* =====================================================
     BRAKES
  ===================================================== */
  74: {
    partNumber: "ATE OEM Brake Kit",
    fitment:
      "OEM-replacement brake kit for European platforms — confirm your vehicle and year at checkout.",
    included: [
      "Front & rear rotors",
      "Brake pad sets",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  75: {
    partNumber: "Brembo GT Big Brake Kit",
    fitment:
      "Application-specific big brake kit — confirm your vehicle and year at checkout.",
    included: [
      "Monobloc calipers",
      "Two-piece floating rotors",
      "Performance brake pads",
      "Stainless braided lines",
      "Mounting brackets & hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  76: {
    partNumber: "Brembo OEM Brake Kit",
    fitment:
      "OEM-replacement brake kit — confirm your vehicle and year at checkout.",
    included: [
      "Rotors",
      "Brake pad sets",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  77: {
    partNumber: "EBC Performance Brake Kit",
    fitment:
      "Application-specific performance brake kit — confirm your vehicle and year at checkout.",
    included: [
      "Performance-coated rotors",
      "EBC performance pads",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  78: {
    partNumber: "EBC Rotors & Pads Kit",
    fitment:
      "Application-specific matched rotor & pad kit — confirm your vehicle and year at checkout.",
    included: [
      "EBC rotors",
      "Matched performance pads",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  79: {
    partNumber: "Wilwood Big Brake Kit",
    fitment:
      "Application-specific big brake kit — confirm your vehicle and year at checkout.",
    included: [
      "Forged multi-piston calipers",
      "Vented & slotted rotors",
      "High-temp brake pads",
      "Brackets & lines",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },

  /* =====================================================
     TRANSMISSIONS
  ===================================================== */
  80: {
    partNumber: "DQ500 (0BH)",
    fitment:
      "Fits Audi RS3/TT RS (2.5 TFSI) and high-torque 2.0 TSI VAG platforms. Confirm engine and axle configuration at checkout.",
    drivetrain: "quattro AWD / FWD (transverse)",
    included: [
      "Complete DSG transmission assembly",
      "Mechatronic unit",
      "Dual-clutch pack",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  81: {
    partNumber: "ZF 8HP70",
    fitment:
      "Fits BMW inline-6 and V8 applications (F/G chassis) and modern RWD swaps with a compatible controller. Bellhousing/adapter required per engine.",
    drivetrain: "RWD — xDrive AWD variants exist",
    included: [
      "Complete 8-speed automatic transmission",
      "Torque converter",
      "Valve body / mechatronics",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  82: {
    partNumber: "ZF 8HP90",
    fitment:
      "Fits high-torque BMW M and V8 applications, and high-horsepower swaps with a compatible controller. Bellhousing/adapter required per engine.",
    drivetrain: "RWD — compatible with AWD applications",
    included: [
      "Complete 8-speed automatic transmission",
      "Torque converter",
      "Valve body / mechatronics",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  83: {
    partNumber: "10R80",
    fitment:
      "Fits Ford Mustang GT (S550) & F-150 (5.0L Coyote / EcoBoost). Suits modern RWD swaps with a standalone controller.",
    drivetrain: "RWD (4WD variants on trucks)",
    included: [
      "Complete 10-speed automatic transmission",
      "Torque converter",
      "Valve body",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  84: {
    partNumber: "4L80E",
    fitment:
      "Fits GM trucks and LS / big-block swaps (RWD). Requires a compatible controller setup.",
    drivetrain: "RWD",
    included: [
      "Complete 4-speed automatic transmission",
      "Torque converter",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  85: {
    partNumber: "6L80",
    fitment:
      "Fits GM LS / LT applications — Camaro, Silverado & Corvette (RWD). Controller required for swap use.",
    drivetrain: "RWD",
    included: [
      "Complete 6-speed automatic transmission",
      "Torque converter",
      "Valve body",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  86: {
    partNumber: "722.9 (7G-Tronic)",
    fitment:
      "Fits Mercedes-Benz RWD and 4MATIC platforms (2004+). Confirm chassis and engine at checkout.",
    drivetrain: "RWD — 4MATIC AWD variants",
    included: [
      "Complete 7-speed automatic transmission",
      "Torque converter",
      "Conductor plate / valve body",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  87: {
    partNumber: "CD009",
    fitment:
      "From Nissan 350Z/370Z (VQ). Popular swap behind LS, 2JZ and others — adapter/bellhousing and clutch sold separately.",
    drivetrain: "RWD",
    included: ["Complete 6-speed manual transmission assembly"],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  88: {
    partNumber: "R154",
    fitment:
      "Fits Toyota Supra MK3 / Soarer; common swap behind 1JZ/2JZ with the correct bellhousing and clutch.",
    drivetrain: "RWD",
    included: ["Complete 5-speed manual transmission assembly"],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  89: {
    partNumber: "V160 (Getrag)",
    fitment:
      "From Toyota Supra MK4 (2JZ-GTE). Premium 6-speed for high-power 2JZ RWD builds.",
    drivetrain: "RWD",
    included: ["Complete 6-speed manual transmission assembly"],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  90: {
    fitment:
      "Universal external ATF cooler — fits most automatic transmissions. Verify line size for your application.",
    included: [
      "Cooler core",
      "Mounting brackets",
      "Line fittings & hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  91: {
    fitment:
      "Application-specific rebuild kit — confirm your transmission model at checkout.",
    included: [
      "Friction clutches & steels",
      "Seals & gaskets",
      "Filter",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  92: {
    partNumber: "T56 Magnum",
    fitment:
      "Universal performance 6-speed (up to 700 lb-ft) for GM, Ford & custom RWD swaps. Select input shaft / bellhousing for your engine.",
    drivetrain: "RWD",
    included: ["Complete 6-speed manual transmission assembly"],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  93: {
    partNumber: "TR6060",
    fitment:
      "Factory 6-speed from Camaro SS / Mustang GT / Challenger / Viper. Suits RWD swaps with the correct bellhousing and clutch.",
    drivetrain: "RWD",
    included: ["Complete 6-speed manual transmission assembly"],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  94: {
    partNumber: "ZF 8HP (Swap Package)",
    fitment:
      "Complete 8HP swap package for RWD conversions. Includes standalone controller; confirm engine/adapter needs at checkout.",
    drivetrain: "RWD",
    included: [
      "ZF 8HP automatic transmission",
      "Standalone transmission controller",
      "Wiring harness",
      "Torque converter",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: ENGINE_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },

  /* =====================================================
     TURBOCHARGERS
  ===================================================== */
  95: {
    partNumber: "Audi RS3 Hybrid Turbo (2.5 TFSI)",
    fitment:
      "Direct-fit hybrid turbo upgrade for Audi RS3 / TT RS 2.5 TFSI — confirm your engine code at checkout.",
    included: [
      "Hybrid turbocharger assembly",
      "Mounting gaskets",
      "Hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  96: {
    partNumber: "BMW B58 Hybrid Turbo",
    fitment:
      "Direct-fit hybrid turbo upgrade for BMW B58 TwinPower platforms — confirm your vehicle and year at checkout.",
    included: [
      "Hybrid turbocharger assembly",
      "Mounting gaskets",
      "Hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  97: {
    partNumber: "BMW N54 Hybrid Turbo Kit",
    fitment:
      "Complete hybrid turbo kit for BMW N54 twin-turbo platforms — confirm your vehicle at checkout.",
    included: [
      "Hybrid turbocharger pair",
      "Mounting gaskets",
      "Oil feed/drain lines",
      "Hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: KIT_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  98: {
    partNumber: "BorgWarner EFR 7163",
    fitment:
      "Universal EFR 7163 performance turbo — verify turbine housing A/R and flange for your application.",
    included: [
      "EFR 7163 turbocharger assembly",
      "Compressor & turbine housings",
      "Mounting gaskets",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  99: {
    partNumber: "BorgWarner EFR 7670",
    fitment:
      "Universal EFR 7670 high-flow turbo — verify housing A/R and flange for your target power level.",
    included: [
      "EFR 7670 turbocharger assembly",
      "Compressor & turbine housings",
      "Mounting gaskets",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  100: {
    partNumber: "Front-Mount Intercooler Kit",
    fitment:
      "Application-specific FMIC kit — confirm your vehicle and engine at checkout.",
    included: [
      "Intercooler core",
      "Charge piping",
      "Couplers & clamps",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: KIT_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  101: {
    partNumber: "Garrett GTX3076R Gen II",
    fitment:
      "Universal GTX3076R Gen II turbo — verify housing A/R and flange for your application (~650 HP).",
    included: [
      "GTX3076R Gen II turbocharger",
      "Compressor & turbine housings",
      "Mounting gaskets",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  102: {
    partNumber: "Garrett GTX3582R Gen II",
    fitment:
      "Universal GTX3582R Gen II turbo — verify housing A/R and flange for high-horsepower builds (~770 HP).",
    included: [
      "GTX3582R Gen II turbocharger",
      "Compressor & turbine housings",
      "Mounting gaskets",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  103: {
    partNumber: "Precision PT6266",
    fitment:
      "Universal performance turbocharger (~735 HP) — verify housing A/R and flange for your application.",
    included: [
      "Turbocharger assembly",
      "Compressor & turbine housings",
      "Mounting gaskets",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  104: {
    partNumber: "Precision PT6466",
    fitment:
      "Universal performance turbocharger (~800 HP) — verify housing A/R and flange for your application.",
    included: [
      "Turbocharger assembly",
      "Compressor & turbine housings",
      "Mounting gaskets",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  105: {
    partNumber: "Precision PT6870",
    fitment:
      "Universal high-flow turbocharger (~900 HP) — verify housing A/R and flange for your application.",
    included: [
      "Turbocharger assembly",
      "Compressor & turbine housings",
      "Mounting gaskets",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  106: {
    partNumber: "Universal T4 Turbo Kit",
    fitment:
      "Universal T4 turbo kit — confirm your engine, manifold flange, and target power at checkout.",
    included: [
      "T4 turbocharger",
      "Turbo manifold",
      "Downpipe",
      "Wastegate",
      "Oil lines & hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: KIT_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },

  /* =====================================================
     SUSPENSION
  ===================================================== */
  107: {
    partNumber: "Adjustable Front Control Arm",
    fitment:
      "Application-specific adjustable front control arms — confirm your vehicle and lowering setup at checkout.",
    included: [
      "Adjustable front control arms",
      "Performance bushings",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  108: {
    partNumber: "Air Lift 3H Management Kit",
    fitment:
      "Universal air management for Air Lift air suspension — confirm tank size and line routing at checkout.",
    included: [
      "3H electronic controller",
      "Dual-path valve manifold",
      "Wiring harness",
      "Pressure sensors",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  109: {
    partNumber: "Air Lift 3P Management Kit",
    fitment:
      "Universal pressure-based air management — confirm tank size and line routing at checkout.",
    included: [
      "3P digital controller",
      "Solenoid valve block",
      "Wiring harness",
      "Pressure sensors",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  110: {
    partNumber: "BC Racing BR Series Coilovers",
    fitment:
      "Application-specific coilover kit — confirm your vehicle and year at checkout.",
    included: [
      "Front & rear coilover assemblies",
      "Spring perches & collars",
      "Damping adjustment knobs",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  111: {
    partNumber: "Bilstein B8 Performance Shocks",
    fitment:
      "Application-specific B8 shocks — confirm your vehicle and spring setup at checkout.",
    included: [
      "B8 monotube shock absorbers",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  112: {
    partNumber: "Bilstein B16 Coilover Kit",
    fitment:
      "Application-specific B16 coilover kit — confirm your vehicle and year at checkout.",
    included: [
      "B16 coilover assemblies",
      "Compression & rebound adjusters",
      "Spring perches & collars",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  113: {
    partNumber: "Camber Arm Kit",
    fitment:
      "Application-specific camber arms — confirm your vehicle and alignment goals at checkout.",
    included: [
      "Adjustable camber arms",
      "Performance bushings",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  114: {
    partNumber: "Complete Air Ride Kit",
    fitment:
      "Application-specific air ride kit — confirm your vehicle and management system at checkout.",
    included: [
      "Air struts or air bags",
      "Air lines & fittings",
      "Mounting hardware",
      "Basic plumbing components",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: KIT_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  115: {
    partNumber: "Eibach Pro-Kit Springs",
    fitment:
      "Application-specific lowering springs — confirm your vehicle and year at checkout.",
    included: [
      "Front & rear lowering springs",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  116: {
    partNumber: "Fortune Auto 500 Coilovers",
    fitment:
      "Application-specific 500 Series coilovers — confirm vehicle and spring rate at checkout.",
    included: [
      "Coilover assemblies",
      "Custom-rate springs",
      "Damping adjusters",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  117: {
    partNumber: "KW Variant 3 Coilovers",
    fitment:
      "Application-specific KW V3 coilovers — confirm your vehicle and year at checkout.",
    included: [
      "V3 coilover assemblies",
      "Compression & rebound adjusters",
      "Spring perches & collars",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  118: {
    partNumber: "Suspension Rebuild Kit",
    fitment:
      "Application-specific rebuild kit — confirm your vehicle and worn components at checkout.",
    included: [
      "Control arm bushings",
      "Suspension mounts",
      "Hardware & fasteners",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  119: {
    partNumber: "Tein Flex Z Coilovers",
    fitment:
      "Application-specific Flex Z coilovers — confirm your vehicle and year at checkout.",
    included: [
      "Flex Z coilover assemblies",
      "16-way damping adjusters",
      "Spring perches & collars",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  120: {
    partNumber: "Whiteline Sway Bar Kit",
    fitment:
      "Application-specific sway bar kit — confirm your vehicle and year at checkout.",
    included: [
      "Upgraded sway bar(s)",
      "Heavy-duty end links",
      "Performance bushings",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },

  /* =====================================================
     ELECTRONICS
  ===================================================== */
  121: {
    partNumber: "AEM Wideband AFR Gauge",
    fitment:
      "Universal wideband gauge kit — confirm sensor bung size and mounting location at checkout.",
    included: [
      "Wideband gauge display",
      "Bosch LSU 4.9 sensor",
      "Wiring harness",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  122: {
    partNumber: "COBB Accessport",
    fitment:
      "Vehicle-specific tuning device — confirm your year/make/model at checkout.",
    included: [
      "Accessport handheld unit",
      "OBD connection cable",
      "Mounting bracket",
      "Quick-start guide",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  123: {
    partNumber: "Dash Camera",
    fitment:
      "Universal windshield-mount dash camera — confirm power routing at checkout.",
    included: [
      "HD dash camera unit",
      "Windshield mount",
      "Power cable & adapter",
      "Memory card (where applicable)",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  124: {
    partNumber: "Digital Dash Display",
    fitment:
      "Universal digital display — confirm sensor inputs and mounting at checkout.",
    included: [
      "Digital dash display unit",
      "Wiring harness",
      "Mounting hardware",
      "Configuration software access",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  125: {
    partNumber: "Electronic Boost Controller",
    fitment:
      "Universal turbo boost control — confirm solenoid and vacuum routing at checkout.",
    included: [
      "EBC control unit",
      "Boost control solenoid",
      "Wiring harness",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  126: {
    partNumber: "Flex Fuel Sensor Kit",
    fitment:
      "Universal flex-fuel sensor — confirm fuel line size and ECU compatibility at checkout.",
    included: [
      "Ethanol content sensor",
      "Wiring harness",
      "Fuel line fittings",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  127: {
    partNumber: "Haltech Elite ECU",
    fitment:
      "Application-specific standalone ECU — confirm engine, harness, and trigger setup at checkout.",
    included: [
      "Haltech Elite ECU",
      "Main engine harness (where applicable)",
      "USB tuning cable",
      "Documentation & software access",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  128: {
    partNumber: "Haltech Nexus ECU",
    fitment:
      "Application-specific Nexus ECU — confirm engine, harness, and display setup at checkout.",
    included: [
      "Haltech Nexus ECU",
      "Main engine harness (where applicable)",
      "USB tuning cable",
      "Documentation & software access",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  129: {
    partNumber: "HP Tuners MPVI3",
    fitment:
      "Platform-specific OBD tuning interface — confirm your vehicle at checkout.",
    included: [
      "MPVI3 interface",
      "USB cable",
      "Software license information",
      "Quick-start guide",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  130: {
    partNumber: "MSD Ignition System",
    fitment:
      "Application-specific MSD ignition — confirm distributor/coil setup at checkout.",
    included: [
      "MSD ignition control module",
      "Wiring harness",
      "Mounting hardware",
      "Installation instructions",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  131: {
    partNumber: "Performance Data Logger",
    fitment:
      "Universal data logger — confirm sensor inputs and mounting at checkout.",
    included: [
      "Data logger unit",
      "GPS antenna",
      "Wiring harness",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  132: {
    partNumber: "Professional OBD2 Scan Tool",
    fitment:
      "Universal OBD2-equipped vehicles (1996+) — confirm protocol support at checkout.",
    included: [
      "OBD2 scan tool",
      "OBD connection cable",
      "Protective case",
      "Quick-start guide",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  133: {
    partNumber: "Shift Light Kit",
    fitment:
      "Universal shift light — confirm tach/ECU signal source at checkout.",
    included: [
      "LED shift light unit",
      "Wiring harness",
      "Mounting bracket",
      "Installation instructions",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  134: {
    partNumber: "TPMS Kit",
    fitment:
      "Universal TPMS — confirm wheel valve-stem compatibility at checkout.",
    included: [
      "TPMS display monitor",
      "Valve-stem sensors",
      "Mounting hardware",
      "Installation instructions",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },

  /* =====================================================
     LIGHTING
  ===================================================== */
  135: {
    partNumber: "AlphaRex NOVA LED Headlights",
    fitment:
      "Application-specific headlight assemblies — confirm your vehicle and year at checkout.",
    included: [
      "Left & right LED headlight assemblies",
      "Wiring adapters (where applicable)",
      "Installation hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  136: {
    partNumber: "Baja Designs OnX6 LED Light Bar",
    fitment:
      "Universal light bar — confirm length, beam pattern, and mounting bracket at checkout.",
    included: [
      "OnX6 LED light bar",
      "Wiring harness",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  137: {
    partNumber: "Baja Designs Squadron Pro",
    fitment:
      "Universal auxiliary pod — confirm beam pattern and mount at checkout.",
    included: [
      "Squadron Pro LED pod(s)",
      "Wiring harness",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  138: {
    partNumber: "Diode Dynamics SS3 Fog Lights",
    fitment:
      "Application-specific fog light kit — confirm your vehicle at checkout.",
    included: [
      "SS3 LED fog light units",
      "Application-specific brackets",
      "Wiring harness",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  139: {
    partNumber: "Govee RGB Interior Lights",
    fitment:
      "Universal interior ambient kit — confirm cabin layout at checkout.",
    included: [
      "RGB LED strips",
      "Controller & power adapter",
      "Mounting clips & adhesive",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  140: {
    partNumber: "LED Side Marker Lights",
    fitment:
      "Application-specific side markers — confirm your vehicle at checkout.",
    included: [
      "LED side marker light set",
      "Wiring adapters (where applicable)",
      "Installation hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  141: {
    partNumber: "Morimoto XB LED Headlights",
    fitment:
      "Application-specific XB headlight assemblies — confirm your vehicle at checkout.",
    included: [
      "Left & right XB LED headlight assemblies",
      "Wiring adapters (where applicable)",
      "Installation hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  142: {
    partNumber: "Morimoto XB LED Tail Lights",
    fitment:
      "Application-specific XB tail light assemblies — confirm your vehicle at checkout.",
    included: [
      "Left & right XB LED tail light assemblies",
      "Wiring adapters (where applicable)",
      "Installation hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  143: {
    partNumber: "OPT7 Aura Underglow Kit",
    fitment:
      "Universal underbody kit — confirm vehicle size and mounting points at checkout.",
    included: [
      "RGB underglow LED strips",
      "Control module & wiring",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  144: {
    partNumber: "Oracle Halo Headlights",
    fitment:
      "Application-specific halo headlight upgrade — confirm your vehicle at checkout.",
    included: [
      "Halo headlight assembly or upgrade kit",
      "Wiring & controllers (where applicable)",
      "Installation hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  145: {
    partNumber: "Osram Night Breaker Laser",
    fitment:
      "Standard halogen bulb sizes — confirm socket type and application at checkout.",
    included: [
      "Night Breaker Laser bulb set",
      "Installation guide",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  146: {
    partNumber: "Philips Ultinon Pro9000",
    fitment:
      "Compatible LED bulb replacement — confirm housing type and socket at checkout.",
    included: [
      "Ultinon Pro9000 LED bulb set",
      "Installation guide",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  147: {
    partNumber: "Rigid Industries E-Series Light Bar",
    fitment:
      "Universal E-Series light bar — confirm length, pattern, and bracket at checkout.",
    included: [
      "E-Series LED light bar",
      "Wiring harness",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  148: {
    partNumber: "Sequential LED Turn Signal Kit",
    fitment:
      "Application-specific sequential kit — confirm your vehicle and lamp type at checkout.",
    included: [
      "Sequential turn signal module",
      "Wiring harness & adapters",
      "Installation instructions",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
  149: {
    partNumber: "XK Glow Rock Lights",
    fitment:
      "Universal rock light kit — confirm pod count and mounting layout at checkout.",
    included: [
      "RGB rock light pods",
      "Control module & wiring",
      "Mounting hardware",
    ],
    coreCharge: OUTRIGHT,
    freightNotes: PARCEL_FREIGHT,
    warrantyTerms: PARTS_ONLY,
  },
};
