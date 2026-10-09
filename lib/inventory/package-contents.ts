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

  // #3943 BD Diesel Heavy Hauler Ready Run Engine, 2004-2005 5.9L Cummins
  // (Refurbished). Source: the listing describes a built engine assembly with
  // new pistons, bearings and gaskets. It does not itemize what "Ready Run"
  // adds, so that is left unconfirmed.
  3943: {
    status: "partial",
    checklist: "engine",
    included: [
      "Engine assembly, BD part DJPLB100102: crack-checked and precision-machined, with new pistons, bearings and gaskets",
    ],
    vehicleRequirements: [
      "Application: 2004-2005 Dodge/Ram 2500 and 3500 (5.9L)",
    ],
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

  // #3179 ATS Allison Conversion Stage 5 (Brand New). Source: Specifications
  // ("Supplied as: Complete conversion kit", "Build: Stage 5 Allison") and the
  // description. The kit's parts are not itemized.
  3179: {
    status: "partial",
    checklist: "transmission",
    included: [
      "Built Stage 5 Allison transmission",
      "Conversion kit components that let it replace the Aisin AS69RC (the supplier does not itemize them)",
    ],
    vehicleRequirements: [
      "2WD version for the 2019-2022 Ram 6.7L Cummins; drivetrain and model year both change the part number",
    ],
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
 * An itemized list the listing itself carries, read only when it is a clear
 * bulleted list under an "Includes" / "Package Details" style heading.
 *
 * Deliberately not read: a one-line "Included: engine; trans; harness (tier
 * dependent)" style summary. Those carry qualifiers ("when available",
 * "confirm at checkout") that a clean list would silently drop, which would
 * say more than the listing does.
 */
export function readItemizedList(description: string): string[] | undefined {
  const lines = description.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const heading = lines[i].trim();
    if (!/^(package\s+|kit\s+)?(includes?|contents|what.s included|package details|included)\s*:?$/i.test(heading)) {
      continue;
    }

    const items: string[] = [];
    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) j++;
    for (; j < lines.length; j++) {
      const line = lines[j].trim();
      if (/^[•\-*]\s+/.test(line)) items.push(line.replace(/^[•\-*]\s+/, ""));
      else break;
    }
    if (items.length >= 2) return items;
  }

  return undefined;
}

/**
 * What a listing in a rollout kind shows when nobody has entered its contents.
 * It claims nothing: "partial" only if the source already holds an included
 * list, otherwise "unconfirmed", plus the shared checklist for that kind.
 */
export function deriveContents(
  product: Pick<Product, "name" | "category" | "description">,
  hasStructuredIncluded: boolean
): PackageContents | undefined {
  const kind = classifyProductKind(product);
  if (!kind || !ROLLOUT_KINDS.includes(kind)) return undefined;

  const itemized = hasStructuredIncluded ? undefined : readItemizedList(product.description ?? "");
  return {
    status: hasStructuredIncluded || itemized ? "partial" : "unconfirmed",
    checklist: checklistForKind(kind, product.name),
    ...(itemized ? { included: itemized } : {}),
  };
}
