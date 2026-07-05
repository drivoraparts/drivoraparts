import { categoryKeywordPhrase, brandFitmentHint } from "./keywords";
import { truncateSeoDescription } from "./text";

const CATEGORY_COPY: Record<string, string> = {
  engine:
    "Buy crate engines, JDM swaps, LS motors, 2JZ, RB26, Coyote & platform-specific powerplants for BMW, Toyota, Nissan, Honda & Ford builds.",
  transmission:
    "Shop manual swaps, ZF 8HP, Tremec T56, DSG, rebuild kits & driveline packages for street, track & off-road conversions.",
  turbocharger:
    "Garrett, BorgWarner & precision turbo kits — twin-scroll, ball-bearing & upgrade hardware for boosted street and race builds.",
  suspension:
    "Vehicle-specific 4x4 lift kits from Old Man Emu, Dobinsons, Bilstein, Fox, King Shocks, Ironman 4x4 & Tough Dog for Hilux, Ranger, LandCruiser, Patrol & more.",
  brakes:
    "Big brake kits, Wilwood, Brembo, EBC & ATE upgrades — rotors, pads & calipers for street, track & tow-ready stopping power.",
  electronics:
    "ECU tuners, wideband gauges, engine management, dash cams & wiring for modern performance and swap builds.",
  lighting:
    "LED light bars, Morimoto, AlphaRex, Baja Designs headlights, fog lights & exterior lighting for street and off-road.",
  "body-parts":
    "Rust-free truck beds, F-150 & Tacoma shells, widebody kits, carbon hoods & aero for BMW, Ford, Honda, Nissan, Subaru & Toyota.",
  interior:
    "Racing seats, steering wheels, harnesses, roll cages & cockpit upgrades for street, show & track builds.",
  "4x4-accessories":
    "ARB & TJM bull bars, Safari snorkels, Rhino-Rack, Front Runner & Rola roof racks for Hilux, Ranger, LandCruiser & Patrol.",
  aftermarket:
    "Pre-owned performance parts marketplace — engines, turbos, suspension & truck gear from enthusiast sellers.",
  "wheels-tires":
    "Flow-formed wheels, BMW fitment, spacers, performance tires & track rubber from BimmerWorld and top wheel brands.",
};

export function getCategorySeoDescription(slug: string, productCount = 0): string {
  const base =
    CATEGORY_COPY[slug] ??
    `Shop ${slug.replace(/-/g, " ")} performance parts online at DrivoraParts. ${categoryKeywordPhrase(slug)}.`;

  if (productCount > 0) {
    return truncateSeoDescription(
      `${base} ${productCount.toLocaleString()}+ in-stock listings with worldwide shipping.`
    );
  }

  return truncateSeoDescription(base);
}

export function getBrandSeoDescription(
  brandName: string,
  categoryName: string,
  productCount: number,
  brandSlug?: string,
  categorySlug?: string
): string {
  const fitment = brandSlug ? brandFitmentHint(brandSlug) : undefined;
  const categoryTerms = categorySlug ? categoryKeywordPhrase(categorySlug, 3) : categoryName.toLowerCase();

  const base = fitment
    ? `Shop ${brandName} ${categoryName.toLowerCase()} for ${fitment}. ${categoryTerms}.`
    : `Shop ${brandName} ${categoryName.toLowerCase()} parts — ${categoryTerms}.`;

  const tail =
    productCount > 0
      ? `${productCount} listing${productCount === 1 ? "" : "s"} with fitment specs & secure checkout at DrivoraParts.`
      : "Verified listings with fitment details and worldwide shipping at DrivoraParts.";

  return truncateSeoDescription(`${base} ${tail}`);
}

export function getCategoryKeywords(slug: string): string[] {
  const phrase = categoryKeywordPhrase(slug, 8);
  return phrase.split(", ").map((s) => s.trim()).filter(Boolean);
}
