import { categoryKeywordPhrase, brandFitmentHint } from "./keywords";
import { truncateSeoDescription } from "./text";

const CATEGORY_COPY: Record<string, string> = {
  engine:
    "Buy crate engines, JDM swaps, LS motors, 2JZ, RB26, Coyote & platform-specific powerplants for BMW, Toyota, Nissan, Honda & Ford builds.",
  transmission:
    "Shop ZF 8HP, Tremec Magnum, Nissan CD009, Allison 1000, Aisin Hilux autos, clutch kits from ACT, Exedy, Xtreme & ATSG rebuild kits for street, track & 4WD builds.",
  turbocharger:
    "Garrett, BorgWarner & precision turbo kits — twin-scroll, ball-bearing & upgrade hardware for boosted street and race builds.",
  suspension:
    "Vehicle-specific 4x4 lift kits from Old Man Emu, Dobinsons, Bilstein, Fox, King Shocks, Ironman 4x4 & Tough Dog for Hilux, Ranger, LandCruiser, Patrol & more.",
  brakes:
    "Big brake kits, Wilwood, Brembo, EBC & ATE upgrades — rotors, pads & calipers for street, track & tow-ready stopping power.",
  bumper:
    "ARB Summit, TJM Outback & Ironman Raid off-road bumpers plus ADD, DV8, Fab Fours, Duraflex & Rocket Bunny performance front bumpers for Hilux, Ranger, F-150, Wrangler, Supra & more.",
  canopy:
    "ARB Ascent, RSI SmartCap EVO, Alu-Cab Explorer, Aeroklas, EGR, LEER, SnugTop, A.R.E. & TJM aluminium canopies for Hilux, Ranger, LandCruiser, F-150, Tacoma & RAM builds.",
  electronics:
    "ECU tuners, wideband gauges, engine management, dash cams & wiring for modern performance and swap builds.",
  lighting:
    "Vehicle-specific LED headlights from Morimoto, AlphaRex, Oracle, Anzo, Spyder & VLAND — plus light bars, Baja Designs fog lights & exterior lighting for street and off-road.",
  "body-parts":
    "Truck beds, widebody kits, carbon hoods & aero for BMW, Ford, Honda, Nissan, Subaru & Toyota.",
  interior:
    "Racing seats, steering wheels, harnesses, roll cages & cockpit upgrades for street, show & track builds.",
  "4x4-accessories":
    "Safari snorkels, Rhino-Rack, Front Runner & Rola roof racks for Hilux, Ranger, LandCruiser & Patrol.",
  aftermarket:
    "Pre-owned performance parts marketplace — engines, turbos, suspension & truck gear from enthusiast sellers.",
  "wheels-tires":
    "BFGoodrich KO2, Toyo Open Country, Falken Wildpeak, Michelin Pilot Sport, Nitto Ridge Grappler, Cooper Discoverer, Yokohama Geolandar and performance SUV tires — plus BMW wheels and spacers.",
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

  /*
   * These promised "fitment specs" and "verified listings". Most listings are
   * bulk imports with no fitment field and the generic description the SEO
   * layer already noindexes, so neither could be supported. Replaced with
   * claims that hold for every listing: the count, shipping and checkout.
   */
  const tail =
    productCount > 0
      ? `${productCount} listing${productCount === 1 ? "" : "s"} with free standard shipping & secure checkout at DrivoraParts.`
      : "Free standard shipping worldwide and secure crypto checkout at DrivoraParts.";

  return truncateSeoDescription(`${base} ${tail}`);
}

export function getCategoryKeywords(slug: string): string[] {
  const phrase = categoryKeywordPhrase(slug, 8);
  return phrase.split(", ").map((s) => s.trim()).filter(Boolean);
}
