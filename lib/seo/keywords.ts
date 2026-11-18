/** High-intent search terms per category — auto-woven into meta descriptions. */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  engine: ["Toyota engine", "2JZ-GTE", "1UZ-FE V8", "Tacoma engine parts", "cold air intake"],
  transmission: ["Toyota transmission", "R154", "Tacoma transmission", "clutch kit", "AC60F"],
  turbocharger: ["Toyota turbo", "turbo kit", "boost upgrade"],
  suspension: [
    "Toyota lift kit",
    "Tacoma lift kit",
    "4Runner suspension",
    "Tundra lift kit",
    "Land Cruiser suspension",
    "OME BP-51",
  ],
  brakes: ["Toyota big brake kit", "Supra brakes", "performance rotors"],
  bumper: ["Tacoma front bumper", "4Runner bumper", "Tundra bumper", "Land Cruiser bumper", "ARB bumper"],
  canopy: ["Tacoma canopy", "truck cap", "Toyota bed canopy", "ARB canopy"],
  electronics: ["Toyota electronics", "plug-and-play wiring"],
  lighting: ["Tacoma headlights", "Tundra headlights", "4Runner headlights", "LED headlight upgrade"],
  "body-parts": ["Toyota body parts", "GR Supra aero kit"],
  interior: ["Toyota interior", "Tacoma dash cover", "Supra interior"],
  "4x4-accessories": ["Toyota snorkel", "Tacoma roof rack", "4Runner roof rack", "Land Cruiser snorkel"],
  aftermarket: ["Toyota aftermarket parts"],
  "wheels-tires": ["Toyota wheels", "GR Supra wheels", "off-road tires"],
};

/** Vehicle / platform hints for brand hub pages. */
export const BRAND_FITMENT_HINTS: Record<string, string> = {
  // Toyota models only: the storefront lists Toyota parts (see
  // lib/inventory/toyota-visibility.ts), so a brand hub must not promise
  // fitment for other makes it no longer offers.
  "old-man-emu": "Toyota Tacoma, 4Runner, Land Cruiser, Tundra, Hilux, Prado",
  dobinsons: "Toyota Tacoma, 4Runner, Land Cruiser, Hilux, Prado",
  bilstein: "Toyota Tacoma, 4Runner, Tundra",
  "fox-racing-shox": "Toyota Tacoma, 4Runner, Land Cruiser 300",
  "king-shocks": "Toyota Tacoma, 4Runner, Tundra",
  "ironman-4x4": "Toyota Hilux, Prado, Land Cruiser",
  "tough-dog": "Toyota Hilux, Land Cruiser",
  arb: "Toyota Tacoma, 4Runner, Land Cruiser, Hilux, Prado",
  "rsi-smartcap": "Toyota Tacoma, Hilux",
  safari: "Toyota Land Cruiser, Hilux, Prado, 4Runner",
  tjm: "Toyota Hilux, Land Cruiser, Prado",
};

export const SITE_KEYWORDS = [
  "Toyota parts",
  "Tacoma parts",
  "Tundra parts",
  "4Runner parts",
  "Land Cruiser parts",
  "Toyota lift kits",
  "Toyota bumpers",
  "Toyota engines",
  "Toyota transmissions",
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
