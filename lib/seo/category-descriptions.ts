import { categoryKeywordPhrase, brandFitmentHint } from "./keywords";
import { truncateSeoDescription } from "./text";

// Toyota-only copy: the storefront lists Toyota parts (lib/inventory/
// toyota-visibility.ts). Each line describes what the public category holds.
const CATEGORY_COPY: Record<string, string> = {
  engine:
    "Toyota engines and engine parts: 2JZ-GTE, 1JZ-GTE and 1UZ-FE V8 engines, plus cold air intakes and engine components for the Tacoma, Tundra, 4Runner and Land Cruiser.",
  transmission:
    "Toyota transmissions and clutches: R154, V160, A750F, AC60F and RA60 units, plus clutch kits for the GR Supra and GR86.",
  turbocharger:
    "Turbochargers and boost upgrades for Toyota engines.",
  suspension:
    "Toyota lift kits and suspension from Old Man Emu, Dobinsons, Bilstein, Fox, King Shocks and Icon for the Tacoma, 4Runner, Tundra, Land Cruiser and Sequoia.",
  brakes:
    "Big brake kits and brake upgrades for Toyota models, including the GR Supra.",
  bumper:
    "Off-road and performance bumpers for the Toyota Tacoma, 4Runner, Tundra and Land Cruiser from ARB, DV8, Dobinsons and more.",
  canopy:
    "Truck canopies and bed caps for the Toyota Tacoma and Hilux.",
  electronics:
    "Electronics and wiring for Toyota models.",
  lighting:
    "Plug-and-play LED headlights and lighting for the Toyota Tacoma, Tundra, 4Runner and Land Cruiser from Morimoto, AlphaRex, Spyder and more.",
  "body-parts":
    "Body parts and aero for Toyota models, including the GR Supra.",
  interior:
    "Interior parts and upgrades for the Toyota Tacoma, Hilux and GR Supra.",
  "4x4-accessories":
    "Snorkels, roof racks, recovery gear and 4x4 accessories for the Toyota Tacoma, 4Runner, Land Cruiser and Hilux.",
  aftermarket:
    "Aftermarket parts for Toyota models.",
  "wheels-tires":
    "Wheels and tires for Toyota models, including the GR Supra.",
};

export function getCategorySeoDescription(slug: string, productCount = 0): string {
  const base =
    CATEGORY_COPY[slug] ??
    `Shop Toyota ${slug.replace(/-/g, " ")} parts at DrivoraParts. ${categoryKeywordPhrase(slug)}.`;

  /*
   * "in-stock listings" went the same way as the brand page's "verified
   * listings" below: just over half the catalog is fulfilled through the
   * supplier network, and nothing verifies a unit is physically held, so the
   * count cannot carry a stock claim.
   *
   * Free shipping came off these descriptions too. It is not true of every
   * listing: Australia and other international destinations are charged, and
   * freight items can be charged anywhere. The count is what survives as a
   * claim that holds for all of them.
   */
  if (productCount > 0) {
    return truncateSeoDescription(
      `${base} ${productCount.toLocaleString()}+ listings at DrivoraParts.`
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
   * claims that hold for every listing -- which is now just the count.
   * "Secure checkout" went too: the site still serves plain http:// without
   * redirecting, so it was not true of every visit. Free shipping followed it
   * once the policy became "USA and UK can be free, elsewhere is charged,
   * freight can be charged anywhere".
   */
  const tail =
    productCount > 0
      ? `${productCount} listing${productCount === 1 ? "" : "s"} at DrivoraParts.`
      : "Parts and accessories at DrivoraParts.";

  return truncateSeoDescription(`${base} ${tail}`);
}

export function getCategoryKeywords(slug: string): string[] {
  const phrase = categoryKeywordPhrase(slug, 8);
  return phrase.split(", ").map((s) => s.trim()).filter(Boolean);
}
