const CATEGORY_COPY: Record<string, string> = {
  engine:
    "Browse performance engines, crate motors, and platform-specific powerplants for BMW, Toyota, Nissan, Honda, and more.",
  transmission:
    "Shop transmissions, swap packages, rebuild kits, and driveline upgrades for street, track, and swap builds.",
  turbocharger:
    "Find turbochargers, twin-scroll kits, and forced-induction upgrades from Garrett, BorgWarner, and top performance brands.",
  suspension:
    "Explore coilovers, sway bars, air suspension, and handling upgrades from Whiteline, BC Racing, KW, and more.",
  brakes:
    "Shop big brake kits, OEM+ brake upgrades, rotors, and pad packages from Brembo, Wilwood, EBC, and ATE.",
  electronics:
    "Buy ECU tuners, wideband gauges, engine management, dash cameras, and performance electronics for modern builds.",
  lighting:
    "Upgrade headlights, LED light bars, fog lights, underglow, and exterior lighting from AlphaRex, Morimoto, Baja Designs, and more.",
  "body-parts":
    "Shop widebody kits, carbon fiber hoods, and vehicle-specific aero for BMW, Ford, Honda, Nissan, Subaru, and Toyota platforms.",
  interior: "Interior performance upgrades and cockpit accessories for street, show, and track builds.",
  aftermarket:
    "Browse aftermarket vehicle listings and performance parts from enthusiast sellers across popular platforms.",
};

export function getCategorySeoDescription(slug: string, productCount = 0): string {
  const base =
    CATEGORY_COPY[slug] ??
    `Shop ${slug.replace(/-/g, " ")} performance parts and upgrades at DrivoraParts.`;

  if (productCount > 0) {
    return `${base} ${productCount}+ listings available with worldwide shipping.`;
  }

  return base;
}

export function getBrandSeoDescription(
  brandName: string,
  categoryName: string,
  productCount: number
): string {
  return truncateOptional(
    `Shop ${brandName} ${categoryName.toLowerCase()} parts at DrivoraParts. ${productCount} listing${productCount === 1 ? "" : "s"} with fitment details, specs, and secure checkout.`
  );
}

function truncateOptional(text: string): string {
  if (text.length <= 160) return text;
  return `${text.slice(0, 157).trim()}…`;
}
