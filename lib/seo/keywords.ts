/** High-intent search terms per category — auto-woven into meta descriptions. */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  engine: [
    "crate engine",
    "LS swap",
    "JDM engine",
    "2JZ",
    "RB26",
    "Coyote engine",
    "performance motor",
  ],
  transmission: [
    "manual swap",
    "automatic transmission",
    "DSG",
    "T56",
    "ZF 8HP",
    "drivetrain",
  ],
  turbocharger: [
    "turbo kit",
    "Garrett turbo",
    "BorgWarner",
    "boost upgrade",
    "twin turbo",
  ],
  suspension: [
    "4x4 lift kit",
    "coilover",
    "OME BP-51",
    "Toyota Hilux suspension",
    "Ford Ranger lift kit",
    "off-road suspension",
  ],
  brakes: [
    "big brake kit",
    "Wilwood",
    "Brembo",
    "EBC pads",
    "performance rotors",
  ],
  bumper: [
    "front bumper",
    "bull bar",
    "ARB bumper",
    "ADD Offroad",
    "Fab Fours",
    "winch bumper",
  ],
  canopy: [
    "ute canopy",
    "truck cap",
    "SmartCap EVO",
    "ARB canopy",
    "aluminium canopy",
    "LEER truck cap",
  ],
  electronics: [
    "ECU tune",
    "engine management",
    "wideband",
    "dash cam",
    "performance gauge",
  ],
  lighting: [
    "LED light bar",
    "headlight upgrade",
    "Baja Designs",
    "Morimoto",
    "AlphaRex",
  ],
  "body-parts": [
    "truck bed",
    "rust-free bed",
    "widebody kit",
    "carbon hood",
    "F-150 bed",
    "Tacoma shell",
  ],
  interior: [
    "racing seat",
    "steering wheel",
    "shift knob",
    "roll cage",
    "interior upgrade",
  ],
  "4x4-accessories": [
    "snorkel",
    "roof rack",
    "Safari snorkel",
    "Rhino-Rack",
    "Hilux roof rack",
    "Ranger roof rack",
  ],
  aftermarket: [
    "used performance parts",
    "pre-owned car parts",
    "aftermarket marketplace",
  ],
  "wheels-tires": [
    "performance wheels",
    "BMW wheels",
    "off-road tires",
    "wheel spacers",
    "flow-formed wheels",
  ],
};

/** Vehicle / platform hints for brand hub pages. */
export const BRAND_FITMENT_HINTS: Record<string, string> = {
  "old-man-emu": "Toyota Hilux, Ford Ranger, LandCruiser, Prado, Patrol",
  dobinsons: "Hilux, Ranger, Prado, D-Max, Navara, Triton, LandCruiser 79",
  bilstein: "Hilux, Tacoma, 4Runner, F-150, Silverado, Jeep Wrangler",
  "fox-racing-shox": "Ranger, Tacoma, Hilux, F-150 Raptor, LandCruiser 300",
  "king-shocks": "Tacoma, Ranger, Hilux, Wrangler, Patrol Y62",
  "ironman-4x4": "Hilux, Ranger, D-Max, Prado, Triton",
  "tough-dog": "Hilux, Ranger, Navara NP300, D-Max, LandCruiser 79",
  arb: "Hilux, Ranger, Prado, LandCruiser, Patrol, D-Max",
  "rsi-smartcap": "Ford F-150, RAM 1500, Tacoma, LandCruiser",
  leer: "F-150, Silverado, RAM 1500, Tacoma",
  snugtop: "F-150, Silverado, RAM 1500",
  safari: "Hilux, Ranger, LandCruiser, Prado, Patrol",
  tjm: "Hilux, Ranger, LandCruiser, Prado",
  garrett: "universal turbo upgrades and forced-induction builds",
  brembo: "BMW, Ford, Subaru, and track-focused brake upgrades",
  wilwood: "big brake kits for street, track, and off-road builds",
};

export const SITE_KEYWORDS = [
  "performance auto parts",
  "automotive marketplace",
  "truck beds for sale",
  "engine swap parts",
  "4x4 accessories",
  "lift kits",
  "bull bars",
  "snorkels",
  "crypto checkout auto parts",
  "worldwide shipping car parts",
  "DrivoraParts",
];

export function categoryKeywordPhrase(slug: string, limit = 4): string {
  const words = CATEGORY_KEYWORDS[slug];
  if (!words?.length) return slug.replace(/-/g, " ");
  return words.slice(0, limit).join(", ");
}

export function brandFitmentHint(brandSlug: string): string | undefined {
  return BRAND_FITMENT_HINTS[brandSlug];
}

export function tokenizeForKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export function buildProductKeywords(input: {
  name: string;
  category: string;
  brand?: string;
  brandName?: string;
  fitment?: string;
}): string[] {
  const seen = new Set<string>();
  const add = (value?: string) => {
    if (!value) return;
    for (const token of tokenizeForKeywords(value)) {
      if (!seen.has(token)) seen.add(token);
    }
  };

  add(input.name);
  add(input.brandName ?? input.brand);
  add(input.fitment);
  add(input.category.replace(/-/g, " "));

  for (const kw of CATEGORY_KEYWORDS[input.category] ?? []) add(kw);
  for (const kw of SITE_KEYWORDS) add(kw);

  return [...seen].slice(0, 24);
}
