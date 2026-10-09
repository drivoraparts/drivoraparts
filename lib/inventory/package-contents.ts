import { extractContents } from "./contents-extractor";
import { checklistForKind, classifyProductKind, ROLLOUT_KINDS } from "./product-kind";
import type { PackageContents, Product } from "./types";

/**
 * Structured package contents by product id, applied when the page is built.
 * It sits beside the catalog rather than inside the product files so contents
 * can be filled in family by family as suppliers answer, without touching
 * prices, stock or any other listing data.
 *
 * RULES
 *  - A line is added only when the listing's own source says so. "Normally
 *    comes with this kind of product" is never enough.
 *  - Items the source does not mention are simply absent. The page then says
 *    the rest is not confirmed; it does not guess.
 *  - `notIncluded` and `requiredSeparately` hold only things the source states.
 *    General installation guidance belongs to the shared checklists.
 *
 * PILOT: ten listings chosen to cover different conditions and package types.
 * Each entry notes where its facts come from.
 */
/**
 * Items the BD Heavy Hauler Ready Run pages state for every engine in the
 * family ("All engines also include"). Variant-specific parts (cylinder head,
 * turbocharger, injectors) are written out per listing below. The pages
 * mention a new valve cover in their description but not in the component
 * list, so it is not claimed for any of them.
 */
const HEAVY_HAULER_COMMON = [
  "Fluidampr harmonic balancer",
  "Turbo oil feed line and drain tube",
  "New water pump and thermostat",
  "New coolant temperature sensor",
  "New Bosch fuel rail with pressure sensor and relief valve",
  "New high-pressure fuel lines and injector feed tubes",
  "New oil pressure switch/sensor",
  "Dipstick and tube",
  "High-quality gaskets",
  "Break-in oil and filter",
];

const HEAVY_HAULER_INSTALL = [
  "The manufacturer lists an installation time of 14 hours 30 minutes",
];

const NOT_FOR_CALIFORNIA = "The manufacturer states it is not for sale on licensed California vehicles";

const bdSource = (label: string, slug: string) => [
  {
    label,
    url: "https://us.bddiesel.com/products/" + slug,
    accessed: "2026-10-09",
  },
];

/**
 * ATS Diesel's Allison conversion kits. The manufacturer's page lists the
 * conversion package GENERALLY, with the qualifier "Specific Parts Vary
 * Depending On Year And Model", and does not itemize Stage 5. Our listings'
 * own part numbers (319-932-2356 and the like) do not appear on the page, so
 * the list is attached with that qualifier rather than as a per-SKU contents
 * list. Researched 2026-10-09.
 */
const ATS_ALLISON_PACKAGE = [
  "Allison 6-speed transmission with a cast Cummins bell housing and extension housing",
  "Billet Five Star torque converter",
  "ATS deep transmission oil pan",
  "Translator transmission controller with a plug-and-play wiring harness",
  "Transfer case adapter kit",
  "Shift linkage kit",
  "Dipstick tube",
  "Cooler adapter lines and fittings",
  "Transmission mount",
];

const ATS_QUALIFIER =
  "The manufacturer lists the conversion package generally and states that specific parts vary depending on year and model; this exact part number is not itemized on its page";

const atsSource = [
  {
    label: "ATS Diesel Full Allison Conversion Kit page (manufacturer)",
    url: "https://atsdiesel.com/products/ats-diesel-full-allison-conversion-kit-2wd-ram-cummins-6-7l-2007-5-2019",
    accessed: "2026-10-09",
  },
];

/**
 * BD Precision Plus Ready Run engines: the items each page states under "All
 * engines also include". The 6.7L pages add EGR gaskets and an upgraded grid
 * heater (BD Killer Grid Heater kit), written out on those listings. Each page
 * describes a new valve cover in its text but not in its component list, so a
 * valve cover is not claimed.
 */
const BD_READY_RUN_COMMON = [
  "Fluidampr harmonic balancer",
  "Turbo oil feed line and drain tube",
  "New water pump and thermostat",
  "New coolant temperature sensor",
  "New Bosch fuel rail with pressure sensor and relief valve",
  "New high-pressure fuel lines and injector feed tubes",
  "New oil pressure switch/sensor",
  "Dipstick and tube",
];

const BD_6_7_EXTRAS = [
  "EGR gaskets",
  "Grid heater upgraded with the BD Killer Grid Heater kit",
];

const BD_NO_CA_EO = "The manufacturer states this product does not require an EO in California";

const BD_LONG_BLOCK_LIMIT =
  "Designed for demanding work applications; the manufacturer does not recommend high-horsepower tuning";

/**
 * BD Diesel transmission-only units (TowMaster, TorqueMaster). Researched
 * 2026-10-09 from each unit's own BD page. Where a page states it, a BD torque
 * converter is REQUIRED and is not part of the transmission-only price: BD
 * says it must be installed at the same time and that a third-party or factory
 * converter voids the transmission warranty. Pages that say nothing about a
 * converter (the 5R110) carry no such line. Warranty and core deposit are on
 * the pages but are handled by the existing warranty and core-charge fields.
 */
const BD_68RFE_BASE = [
  "Hard anodized valve body with a new solenoid pack installed in every unit",
  "Custom bonded-gasket valve body separator plate (raises line pressure and stops internal cross leaks)",
  "Heavy-duty cam-and-roller low/reverse one-way clutch",
  "New 4C billet spring retainer",
  "Steel girdle on the 2C piston for more clutches and a broader apply area",
  "BD QT100 pressure plates for increased clutch counts",
  "Overdrive clutches and 2C clutches increased by 33%",
  "Custom Big Stack overdrive shaft",
  "BD reinforced accumulator plate",
  "BD deep-sump oil pan",
];

const BD_68RFE_2007_EXTRAS = [
  "TCC limit valve machined and sleeved at the high-wear area in the pump",
  "BD ProTech68 pressure control module, which raises line pressure to 250 psi",
];

const BD_CONVERTER_REQUIRED =
  "A BD torque converter (not included in this transmission-only unit); BD states it must be installed at the same time, and that a third-party or factory converter voids the transmission warranty";

const BD_BREAK_IN =
  "BD advises no heavy towing or hauling until 300 miles of stop-and-go driving, so the vehicle's computer can relearn the transmission";

const BD_2019_TUNE =
  "Special tuning is required on 2019-and-newer applications to increase line pressure";

const BD_2019_CONTROLLER = "Line pressure controller (not included)";

export const packageContents: Record<number, PackageContents> = {
  // #2114 Ford 7.3L Godzilla Supercharged Engine Package (Brand New).
  // The four items below were confirmed for this listing by the owner; the
  // description's "Not Confirmed as Included" section covers the rest.
  2114: {
    status: "partial",
    checklist: "engine",
    included: [
      "Ford 7.3L Godzilla V8 engine",
      "Supercharger",
      "ECU (Engine Control Unit)",
      "Engine wiring harness",
    ],
  },

  // #199 GM LTX Complete Swap Drivetrain Package (Brand New).
  // Source: its Specifications ("Engine: Gen V LT performance series",
  // "Transmission: Matched automatic", "Included: Harness, ECU, cooling, swap
  // documentation"). The source does not itemize the cooling components.
  199: {
    status: "partial",
    checklist: "engine",
    included: [
      "Gen V LT performance-series engine",
      "Matched automatic transmission",
      "Wiring harness",
      "ECU",
      "Cooling (the supplier does not itemize these components)",
      "Swap documentation",
    ],
  },

  // #685 GT 1000 Supercharged Coyote Drivetrain Package (Brand New).
  // Source: the listing's own "Package Details" list and its notes that the
  // package comes with a complete accessory drive with power steering, the
  // standalone ECU and pedal, and that 10R80 and 6R80 transmissions are only
  // offered at a later date.
  685: {
    status: "listed",
    checklist: "engine",
    included: [
      "Gen 3 Coyote block",
      "Boss 302 crankshaft",
      "CP Carrillo bullet rods",
      "Custom forged pistons",
      "5.2 Predator heads with Predator cams",
      "Billet oil pump gears",
      "MMR billet timing chain and tension kit",
      "Ported GT500 blower (supercharger)",
      "ID 1300cc injectors",
      "108 mm throttle body",
      "Application-specific oil pan",
      "Application-specific long-tube headers",
      "Wegner front drive (accessory drive, with power steering)",
      "Billet GT 1000 valve covers",
      "Tremec T56 Magnum transmission kit",
      "Standalone harness and ECU",
      "Accelerator pedal",
      "ESS Race Heat Exchanger kit",
    ],
    notIncluded: [
      "10R80 and 6R80 automatic transmissions (the listing says these will be offered at a later date)",
    ],
    vehicleRequirements: [
      "The oil pan is application-specific, chosen for the vehicle you are swapping into",
    ],
  },

  // #3943 BD Diesel Heavy Hauler Ready Run Engine, 2004-2005 5.9L Cummins,
  // part DJPLB100102 (Refurbished). Researched 2026-10-09 from the
  // manufacturer's own product page (see sources). Only this exact part is
  // covered: the 2006-2007 and 6.7L Heavy Hauler engines (#3944-#3946) are
  // different parts and are NOT assumed to match. The injector power rating is
  // left out because retailer pages disagree on it (15 HP vs 30 HP); the page
  // lists a new valve cover in its description but not in its component list,
  // so the valve cover is not claimed.
  3943: {
    status: "listed",
    checklist: "engine",
    included: [
      "D&J long block: disassembled, crack-checked, blasted and cleaned, CNC bored, line bored, surfaced as needed and torque-plate honed; blueprinted and balanced; pre-lubed and painted black",
      "9/16 in ARP head studs, torqued to 175 ft-lb",
      "D&J Stage 1 cylinder heads with heavy-duty seats, 5-axis CNC porting and a CNC valve job",
      "Machined rocker box and pedestals, D&J heavy-duty 7/16 in pushrods and a D&J tow-performance cast cam",
      "BD two-piece high-silicon ductile-iron exhaust manifold with Grade 10.9 black-oxide bolts and spacers, pre-drilled for pyrometer probes",
      "BD turbocharger: 63 mm billet compressor wheel, 76 mm turbine wheel, adjustable wastegate preset to 30 psi",
      "BD high-pressure fuel system: remanufactured CP3 pump with a new metering unit, StockPlus Premium injectors with new Bosch OE nozzles, solenoids and control valves, BD OEM-fit fuel lines and gaskets",
      "Fluidampr harmonic balancer",
      "Turbo oil feed line and drain tube",
      "New water pump and thermostat",
      "New coolant temperature sensor",
      "New Bosch fuel rail with pressure sensor and relief valve",
      "New high-pressure fuel lines and injector feed tubes",
      "New oil pressure switch/sensor",
      "Dipstick and tube",
      "Break-in oil and filter",
    ],
    vehicleRequirements: [
      "Application: 2004-2005 Dodge/Ram 2500 and 3500 (5.9L Cummins)",
      "The manufacturer states it is not for sale on licensed California vehicles",
    ],
    installationRequirements: [
      "The manufacturer lists an installation time of 14 hours 30 minutes",
    ],
    sources: [
      {
        label: "BD Diesel product page (manufacturer)",
        url: "https://us.bddiesel.com/products/heavy-hauler-ready-run-engine-dodge-ram-2500-3500-5-9l-cummins-2004-2005",
        accessed: "2026-10-09",
      },
    ],
  },

  // #3944 BD Heavy Hauler Ready Run Engine, 2006-2007 5.9L Cummins,
  // DJPLB100101. Researched 2026-10-09 from the manufacturer's page, whose part
  // number matches this listing.
  3944: {
    status: "listed",
    checklist: "engine",
    included: [
      "D&J long block: disassembled, crack-checked, blasted and cleaned before machining; machined rocker box and pedestals; pre-lubed and painted black",
      "Custom ARP 9/16 in head studs",
      "D&J 200 CFM Stage 1 high-performance cylinder head",
      "D&J HD 7/16 in pushrods and D&J tow-performance cast cam",
      "BD two-piece high-silicon ductile-iron exhaust manifold with Grade 10.9 black-oxide bolts and spacers, pre-drilled for pyrometer probes",
      "BD turbocharger: custom 63 mm billet compressor wheel and 76 mm turbine wheel, adjustable wastegate preset at 30 psi, brand new and VSR high-speed balanced",
      "BD high-pressure fuel system: remanufactured CP3 pump with a new metering unit, StockPlus Premium injectors (up to 15 HP) with new Bosch OE nozzles, solenoids and control valves, BD OEM-fit fuel lines",
      ...HEAVY_HAULER_COMMON,
    ],
    vehicleRequirements: [
      "Application: 2006-2007 Dodge/Ram 2500 and 3500 (5.9L Cummins)",
      NOT_FOR_CALIFORNIA,
    ],
    installationRequirements: HEAVY_HAULER_INSTALL,
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "heavy-hauler-ready-run-engine-dodge-ram-2500-3500-5-9l-cummins-2006-2007"
    ),
  },

  // #3945 BD Heavy Hauler Ready Run Engine, 2007-2012 6.7L Cummins, DJPLB100100.
  3945: {
    status: "listed",
    checklist: "engine",
    included: [
      "Heavy Hauler long block",
      "D&J ARP 9/16 in head studs, torqued to 175 ft-lb",
      "D&J 200 CFM Stage 1 high-performance cylinder head",
      "D&J HD 7/16 in pushrods and D&J tow-performance cast cam",
      "BD two-piece high-silicon ductile-iron exhaust manifold",
      "BD turbocharger, fully remanufactured and VSR high-speed balanced (CARB EO D-553-32)",
      "BD high-pressure fuel system: remanufactured CP3 pump with a new metering unit, StockPlus Premium injectors (up to 15 HP) with new Bosch OE nozzles, solenoids and control valves, BD OEM-fit fuel lines",
      ...HEAVY_HAULER_COMMON,
    ],
    vehicleRequirements: [
      "Application: 2007-2012 Dodge/Ram 2500 and 3500 (6.7L Cummins)",
      NOT_FOR_CALIFORNIA,
    ],
    installationRequirements: HEAVY_HAULER_INSTALL,
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "heavy-hauler-ready-run-engine-dodge-ram-2500-3500-6-7l-cummins-2007-2012"
    ),
  },

  // #3946 BD Heavy Hauler Ready Run Engine, 2013-2018 6.7L Cummins, DJPLB100098.
  3946: {
    status: "listed",
    checklist: "engine",
    included: [
      "D&J long block: disassembled, crack-checked, blasted and cleaned before machining; blueprinted and balanced; machined rocker box and pedestals; pre-lubed and painted black",
      "Custom ARP 9/16 in head studs, torqued to 175 ft-lb",
      "D&J Stage 1 performance cylinder heads, 5-axis CNC ported, with a CNC high-performance valve job",
      "D&J HD 7/16 in pushrods and D&J tow-performance cast cam",
      "BD two-piece high-silicon ductile-iron exhaust manifold with Grade 10.9 bolts and spacers, pre-drilled for pyrometer probes",
      "BD turbocharger: 64.5 mm 7+7-blade billet compressor wheel and 70 mm 12-blade turbine wheel, actuator pre-programmed for drop-in functionality (CARB EO D-553-32)",
      "BD high-pressure fuel system: remanufactured CP3 pump with a new metering unit, StockPlus Premium injectors (up to 30 HP) with new Bosch OE nozzles, solenoids and control valves (CARB EO D-553-10), BD OEM-fit fuel lines",
      ...HEAVY_HAULER_COMMON,
    ],
    vehicleRequirements: [
      "Application: 2013-2018 Dodge/Ram 2500 and 3500 (6.7L Cummins)",
      NOT_FOR_CALIFORNIA,
    ],
    installationRequirements: HEAVY_HAULER_INSTALL,
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "heavy-hauler-ready-run-engine-dodge-ram-2500-3500-6-7l-cummins-2013-2018"
    ),
  },

  // BD Precision Plus Ready Run engines (#3950, #3909, #3948, #3949) and
  // Precision Plus long blocks (#3960, #3947, #3952). Researched 2026-10-09
  // from each part's own BD Diesel page; every page's part number matched the
  // listing's. The 2006-2007 and 6.7L pages differ from one another and are
  // written out separately.
  3950: {
    status: "listed",
    checklist: "engine",
    included: [
      "Long block assembled with ARP 2000 studs; cylinder head with heavy-duty valve seats and a CNC valve job",
      "BD two-piece high-silicon ductile-iron exhaust manifold",
      "BD turbocharger, brand new and VSR high-speed balanced",
      "BD high-pressure fuel system: remanufactured CP3 pump with a new metering unit, BD OEM-fit fuel lines",
      ...BD_READY_RUN_COMMON,
    ],
    vehicleRequirements: [
      "Application: 2004.5-2005 Dodge/Ram 2500 and 3500 (5.9L Cummins)",
      BD_NO_CA_EO,
    ],
    installationRequirements: HEAVY_HAULER_INSTALL,
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "engine-package-dodge-ram-2500-3500-5-9l-cummins-2004-5-2007"
    ),
  },
  3909: {
    status: "listed",
    checklist: "engine",
    included: [
      "Long block assembled with ARP 2000 studs",
      "BD two-piece high-silicon ductile-iron exhaust manifold",
      "BD turbocharger, brand new and VSR high-speed balanced",
      "BD high-pressure fuel system: remanufactured CP3 pump with a new metering unit, BD OEM-fit fuel lines, high-quality gaskets",
      ...BD_READY_RUN_COMMON,
    ],
    vehicleRequirements: [
      "Application: 2006-2007 Dodge/Ram 2500 and 3500 (5.9L Cummins)",
      BD_NO_CA_EO,
    ],
    installationRequirements: HEAVY_HAULER_INSTALL,
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "precision-plus-ready-run-engine-dodge-ram-2500-3500-5-9l-cummins-2006-2007"
    ),
  },
  3948: {
    status: "listed",
    checklist: "engine",
    included: [
      "Long block: CNC blueprinted, bored, honed and deck surfaced, with heavy-duty valve seats, a CNC valve job and ARP 2000 studs",
      "BD two-piece high-silicon ductile-iron exhaust manifold with Grade 10.9 black-oxide bolts and spacers, pre-drilled for pyrometer probes",
      "BD turbocharger, fully remanufactured and VSR high-speed balanced, actuator pre-programmed for drop-in functionality",
      "BD high-pressure fuel system: remanufactured CP3 pump with a new metering unit, BD OEM-fit fuel lines, high-quality gaskets",
      ...BD_READY_RUN_COMMON,
      ...BD_6_7_EXTRAS,
    ],
    vehicleRequirements: [
      "Application: 2013-2018 Dodge/Ram 2500 and 3500 (6.7L Cummins)",
      BD_NO_CA_EO,
    ],
    installationRequirements: HEAVY_HAULER_INSTALL,
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "engine-package-dodge-ram-2500-3500-6-7l-cummins-2013-2018"
    ),
  },
  3949: {
    status: "listed",
    checklist: "engine",
    included: [
      "Long block: CNC blueprinted, bored, honed and deck surfaced, with heavy-duty valve seats and ARP 2000 studs",
      "BD two-piece high-silicon ductile-iron exhaust manifold, pre-drilled for pyrometer probes",
      "BD turbocharger, fully remanufactured and VSR high-speed balanced",
      "BD high-pressure fuel system: remanufactured CP3 pump with a new metering unit, BD OEM-fit fuel lines",
      ...BD_READY_RUN_COMMON,
      ...BD_6_7_EXTRAS,
    ],
    vehicleRequirements: [
      "Application: 2007.5-2012 Dodge/Ram 2500 and 3500 (6.7L Cummins)",
      BD_NO_CA_EO,
    ],
    installationRequirements: HEAVY_HAULER_INSTALL,
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "engine-package-dodge-ram-2500-3500-6-7l-cummins-2007-5-2012"
    ),
  },
  3960: {
    status: "listed",
    checklist: "engine",
    included: [
      "Remanufactured block, crankshaft, rods, pistons, camshaft and D&J Precision Plus reman cylinder head (HD bronze valve guides, extra-large seats, CNC valve job)",
      "New pistons, bearings, tappets, oil cooler, oil pump and crankshaft seals; stock camshaft and connecting rods restored to OEM specifications",
      "Oil pan and front timing cover",
      "Pre-lubed break-in oil, painted black, filter included",
    ],
    vehicleRequirements: [
      "Application: 2013-2018 Dodge/Ram 6.7L Cummins. The manufacturer's description says 2007.5-2018 while its title and part number say 2013-2018, so confirm your year with us before ordering",
      BD_NO_CA_EO,
      BD_LONG_BLOCK_LIMIT,
    ],
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "precision-plus-long-block-engine-dodge-ram-6-7l-cummins-2013-2018"
    ),
  },
  3947: {
    status: "listed",
    checklist: "engine",
    included: [
      "Remanufactured cylinder head with extra-large valve seats and a high-precision CNC valve job, pressure tested",
      "Upgraded internal components",
      "Year-specific front covers and timing gear housings",
      "Oil pan, front cover and pre-lubed break-in oil",
      "Solid flat tappets and adjustable rockers in place of the hydraulic roller lifters",
    ],
    vehicleRequirements: [
      "Application: 2021-2024 Dodge/Ram 6.7L Cummins",
      BD_NO_CA_EO,
      BD_LONG_BLOCK_LIMIT,
    ],
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "precision-plus-long-block-engine-dodge-ram-6-7l-cummins-2021-2024"
    ),
  },
  3952: {
    status: "listed",
    checklist: "engine",
    included: [
      "Remanufactured cylinder head with extra-large valve seats and a high-precision CNC valve job, pressure tested",
      "Fully blueprinted, bored, honed and deck-surfaced block; upgraded internal components",
      "Year-specific front covers and timing gear housings",
      "Oil pan, front cover and pre-lubed break-in oil",
      "Solid flat tappets and adjustable rockers in place of the hydraulic roller lifters",
    ],
    vehicleRequirements: [
      "Application: 2019-2020 Dodge/Ram 6.7L Cummins (the front covers and timing gear housings are year-specific)",
      BD_NO_CA_EO,
      BD_LONG_BLOCK_LIMIT,
    ],
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "precision-plus-long-block-engine-dodge-ram-6-7l-cummins-2019-2020"
    ),
  },

  // BD transmission-only units. Each part number below matched its BD page.
  // #2205 / #4119: the 2019-2024 TowMaster 68RFE page (part 1064294) shows 4WD
  // and 2WD variants without separate part numbers, so it is applied to both
  // listings and says so.
  2205: {
    status: "listed",
    checklist: "transmission",
    included: [...BD_68RFE_BASE, "Option on the page: billet input shaft (not standard on the TowMaster)"],
    requiredSeparately: [BD_CONVERTER_REQUIRED, BD_2019_CONTROLLER],
    programmingRequirements: [BD_2019_TUNE],
    installationRequirements: [
      "BD lists an installation time of 9 hours",
      BD_BREAK_IN,
    ],
    vehicleRequirements: [
      "Application: 2019-2024 Ram 6.7L Cummins (68RFE), 4WD. The BD page lists 4WD and 2WD variants without separate part numbers",
    ],
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "towmaster-ram-6-7l-cummins-68rfe-transmission-2019-2024"
    ),
  },
  4119: {
    status: "listed",
    checklist: "transmission",
    included: [...BD_68RFE_BASE, "Option on the page: billet input shaft (not standard on the TowMaster)"],
    requiredSeparately: [BD_CONVERTER_REQUIRED, BD_2019_CONTROLLER],
    programmingRequirements: [BD_2019_TUNE],
    installationRequirements: [
      "BD lists an installation time of 9 hours",
      BD_BREAK_IN,
    ],
    vehicleRequirements: [
      "Application: 2019-2024 Ram 6.7L Cummins (68RFE), 2WD. The BD page lists 4WD and 2WD variants without separate part numbers",
    ],
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "towmaster-ram-6-7l-cummins-68rfe-transmission-2019-2024"
    ),
  },
  2744: {
    status: "listed",
    checklist: "transmission",
    included: [
      ...BD_68RFE_BASE,
      ...BD_68RFE_2007_EXTRAS,
      "Option on the page: billet input shaft (not standard on the TowMaster)",
    ],
    requiredSeparately: [BD_CONVERTER_REQUIRED],
    installationRequirements: [
      "BD lists an installation time of 9 hours",
      BD_BREAK_IN,
    ],
    vehicleRequirements: [
      "Application: 2007.5-2018 Dodge/Ram 6.7L Cummins (68RFE). The BD page lists 4WD and 2WD variants without separate part numbers",
    ],
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "towmaster-dodge-68rfe-transmission-2007-5-2018"
    ),
  },
  2721: {
    status: "listed",
    checklist: "transmission",
    included: [...BD_68RFE_BASE, "Billet input shaft"],
    requiredSeparately: [BD_CONVERTER_REQUIRED, BD_2019_CONTROLLER],
    programmingRequirements: [BD_2019_TUNE],
    installationRequirements: [
      "BD lists an installation time of 9 hours",
      BD_BREAK_IN,
    ],
    vehicleRequirements: [
      "Application: 2019-2024 Ram 6.7L Cummins (68RFE), 4WD. The BD page lists 4WD and 2WD variants without separate part numbers",
    ],
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "torquemaster-transmission-dodge-68rfe-2019-2024-c-w-billet-input-shaft"
    ),
  },
  4118: {
    status: "listed",
    checklist: "transmission",
    included: [...BD_68RFE_BASE, "Billet input shaft"],
    requiredSeparately: [BD_CONVERTER_REQUIRED, BD_2019_CONTROLLER],
    programmingRequirements: [BD_2019_TUNE],
    installationRequirements: [
      "BD lists an installation time of 9 hours",
      BD_BREAK_IN,
    ],
    vehicleRequirements: [
      "Application: 2019-2024 Ram 6.7L Cummins (68RFE), 2WD. The BD page lists 4WD and 2WD variants without separate part numbers",
    ],
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "torquemaster-transmission-dodge-68rfe-2019-2024-c-w-billet-input-shaft"
    ),
  },
  2807: {
    status: "listed",
    checklist: "transmission",
    included: [...BD_68RFE_BASE, ...BD_68RFE_2007_EXTRAS, "Billet input shaft"],
    requiredSeparately: [BD_CONVERTER_REQUIRED],
    installationRequirements: [
      "BD lists an installation time of 9 hours",
      BD_BREAK_IN,
    ],
    vehicleRequirements: [
      "Application: 2007.5-2018 Dodge/Ram 6.7L Cummins (68RFE), 4WD",
    ],
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "torquemaster-dodge-68rfe-transmission-2007-5-2018-4wd-c-w-billet-input-shaft"
    ),
  },
  2773: {
    status: "listed",
    checklist: "transmission",
    included: [
      "BD aluminum HD deep transmission pan, adding 3.5 qt of oil capacity",
      "High-energy friction plates",
      "Revised oil circuits",
      "New converter lock-up valve to raise lock-up pressure",
      "New A and B trim valves delivering full line pressure to the clutches",
      "Increased clutch counts: C1 8 clutches, C2 7, C3 7, C4 7, C5 7",
      "Dyno tested",
    ],
    requiredSeparately: [BD_CONVERTER_REQUIRED],
    installationRequirements: ["BD lists an installation time of 9 hours"],
    vehicleRequirements: ["Application: 2007-2010 Chevy/GMC 6.6L LMM Duramax with Allison 1000, 4WD"],
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "towmaster-chevy-allison-1000-transmission-2007-2010-lmm-4wd"
    ),
  },
  2803: {
    status: "listed",
    checklist: "transmission",
    included: [
      "BD aluminum HD deep pan, adding 6 qt of oil capacity",
      "Re-calibrated accumulator body, quicker and firmer shifts",
      "Full shift kit with a line-mod valve to increase pressures",
      "Increased pressure to the converter; added lube circuits to the overdrive planet and added lube and support to the output and intermediate shafts",
      "Drilled and tapped direct and intermediate feeds to prevent leaks at the case; upgraded overdrive snap ring; machined center support; reworked front pump",
      "Fully rollerized geartrain; increased clutch counts (forward 5, direct 5, low/reverse 7, intermediate 4, overdrive 4, coast 2)",
      "Auxiliary frame-mounted full-flow filter kit (stated for 1990-2003)",
      "Dyno tested",
    ],
    requiredSeparately: [BD_CONVERTER_REQUIRED],
    installationRequirements: [
      "BD lists an installation time of 7 hours",
      "A remote filter is required for inspection, with the cooler flow rate measured in GPM at the oil/air transmission cooler outlet",
    ],
    vehicleRequirements: [
      "Application: 1999-2003 Ford 7.3L Power Stroke with the 4R100, 4WD (base part 1064444F)",
      "A 2WD 4R100 vehicle with an attached driveline brake assembly requires the 4WD model",
      "Suffixes on the page: LR for a rear-end ratio of 4.88 or lower, PTO for PTO provision; the page contradicts itself on whether the base unit has PTO provision, so confirm with us if you need it",
      "The BD deep pan interferes with the factory crossmember on the Excursion, which requires the factory-style pan",
    ],
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "towmaster-ford-4r100-transmission-1999-2003-4wd"
    ),
  },
  2793: {
    status: "listed",
    checklist: "transmission",
    included: [
      "BD heavy-duty deep transmission pan, adding 6 qt of oil capacity",
      "Upgraded, larger late-model sump filter",
      "Aluminum replacements for the plastic valve-body pressure plugs",
      "Heavy-duty snap ring and pressure regulator valve to prevent runaway pressure damaging the case",
      "Reworked front pump",
      "Increased clutch counts: forward 4, low/reverse 6, intermediate 5, direct 6, overdrive 5, coast 3",
      "Dyno tested",
    ],
    installationRequirements: ["BD lists an installation time of 7 hours"],
    vehicleRequirements: [
      "Application: 2008-2010 Ford 6.4L Power Stroke with the 5R110, 4WD. BD says fitment is year-specific",
    ],
    sources: bdSource(
      "BD Diesel product page (manufacturer)",
      "towmaster-ford-5r110-transmission-2008-2010-6-4l-power-stroke-4wd"
    ),
  },

  // #2115 Toyota 1UZ-FE Non-VVT-i Complete Swap Package (Used, inspected and
  // tested). Source: its "PACKAGE INCLUDES" list, its swap-package notice and
  // its 300 HP target notes.
  2115: {
    status: "listed",
    checklist: "engine",
    included: [
      "Toyota 1UZ-FE Non-VVT-i 4.0L V8 engine",
      "Compatible transmission",
      "Factory ECU",
      "Factory engine wiring harness",
    ],
    optionalUpgrades: [
      "For a roughly 300 HP build the listing notes the intake, exhaust and fuel systems, ECU calibration and tuning, and supporting engine components may need upgrading (300 HP is a build target, not the stock rating)",
    ],
    vehicleRequirements: [
      "Installation requirements vary by chassis. Verify vehicle year, make, model, original engine, transmission and drivetrain before ordering",
    ],
  },

  // #3177-#3180 ATS Allison Conversion kits (Stages 3, 4 and 5). Stage build
  // details come from the manufacturer's stage table (Stages 1-4 only; Stage 5
  // is not described there).
  3177: {
    status: "partial",
    checklist: "transmission",
    included: [
      "ATS-built Allison LCT1000, Stage 3: Five-Star torque converter, deep transmission pan, billet input shaft and billet intermediate shaft",
      ...ATS_ALLISON_PACKAGE,
    ],
    vehicleRequirements: [
      "2WD version for the 2010-2012 Ram 6.7L Cummins, replacing the 68RFE; drivetrain and model year change the part number",
      ATS_QUALIFIER,
    ],
    sources: atsSource,
  },
  3178: {
    status: "partial",
    checklist: "transmission",
    included: [
      "ATS-built Allison LCT1000, Stage 4: Five-Star torque converter, deep transmission pan, billet input and intermediate shafts, billet P2 carrier, C2 hub and a modified P1 sun gear planetary assembly",
      ...ATS_ALLISON_PACKAGE,
    ],
    vehicleRequirements: [
      "2WD version for the 2013-2018 Ram 6.7L Cummins, replacing the Aisin AS69RC; drivetrain and model year change the part number",
      ATS_QUALIFIER,
    ],
    sources: atsSource,
  },
  3179: {
    status: "partial",
    checklist: "transmission",
    included: [
      "ATS-built Stage 5 Allison transmission (the manufacturer's page does not itemize the Stage 5 build)",
      ...ATS_ALLISON_PACKAGE,
    ],
    vehicleRequirements: [
      "2WD version for the 2019-2022 Ram 6.7L Cummins, replacing the Aisin AS69RC; drivetrain and model year both change the part number",
      ATS_QUALIFIER,
    ],
    sources: atsSource,
  },
  3180: {
    status: "partial",
    checklist: "transmission",
    included: [
      "ATS-built Stage 5 Allison transmission (the manufacturer's page does not itemize the Stage 5 build)",
      ...ATS_ALLISON_PACKAGE,
    ],
    vehicleRequirements: [
      "4WD version for the 2019-2022 Ram 6.7L Cummins, replacing the Aisin AS69RC; drivetrain and model year both change the part number",
      ATS_QUALIFIER,
    ],
    sources: atsSource,
  },

  // #2702 BD TorqueMaster AS69RC Transmission and Converter Package
  // (Refurbished). Source: Specifications ("Torque converter: Included",
  // "Core charge: $2,500, refundable") and the description.
  2702: {
    status: "partial",
    checklist: "transmission",
    included: [
      "BD TorqueMaster AS69RC transmission",
      "BD torque converter, matched to the transmission",
    ],
    vehicleRequirements: [
      "4WD version for RAM 3500/4500/5500 6.7L 2019-2024; other drivetrain and PTO combinations carry their own part numbers",
      "Exchange unit: a $2,500 refundable core deposit applies, refunded when your old unit is returned",
    ],
  },

  // #2078 BMW 1972 Automatic Transmission, ZF 3HP (Used). Source: the listing
  // says it is sold as a complete unit, exactly as listed.
  2078: {
    status: "partial",
    checklist: "transmission",
    included: ["ZF 3HP automatic transmission, sold as a complete unit exactly as listed"],
    vehicleRequirements: [
      "Fits 1972 BMW automatic models (2002 and related Neue Klasse); confirm compatibility before ordering",
      "Inspect and verify the ratio and bellhousing for your chassis before installing",
    ],
  },

  // #687 Harrop TVS2650 Supercharger Kit (Brand New). The listing says nothing
  // about its contents, so none are listed.
  687: {
    status: "unconfirmed",
    checklist: "supercharger",
  },

  // #3908 BD Diesel Screamer Stage 1 GT37 Retrofit Turbo Kit (Brand New). The
  // listing gives the application and part number only.
  3908: {
    status: "unconfirmed",
    checklist: "turbocharger",
  },
};


/**
 * What a listing shows when nobody has entered its contents by hand.
 *
 * Two independent things feed it:
 *  - what the listing's OWN text states (see contents-extractor.ts), for every
 *    listing, whatever it is; and
 *  - the shared checklist for the kinds in ROLLOUT_KINDS.
 *
 * Nothing is added from what such products normally include. Status:
 *  - "listed": the listing's text states what is included;
 *  - "partial": only a structured included list exists;
 *  - "unconfirmed": a rollout kind with nothing stated;
 *  - "stated": outside the rollout kinds, the text states exclusions or
 *    requirements but no contents; no status note is shown.
 */
export function deriveContents(
  product: Pick<Product, "name" | "category" | "description">,
  hasStructuredIncluded: boolean
): PackageContents | undefined {
  const kind = classifyProductKind(product);
  const inRollout = Boolean(kind && ROLLOUT_KINDS.includes(kind));
  const extracted = extractContents(product.description ?? "");
  const stated = Object.keys(extracted).length > 0;

  if (!inRollout && !stated) return undefined;

  // A structured included list on the product itself wins over the text.
  const { included: fromText, ...rest } = extracted;
  const included = hasStructuredIncluded ? undefined : fromText;

  let status: PackageContents["status"];
  if (included) status = "listed";
  else if (hasStructuredIncluded) status = "partial";
  else if (inRollout) status = "unconfirmed";
  else status = "stated";

  return {
    status,
    ...(kind && inRollout ? { checklist: checklistForKind(kind, product.name) } : {}),
    ...(included ? { included } : {}),
    ...rest,
  };
}
