/* =========================================================
   DRIVORAPARTS — INVENTORY CORE TYPES
   ---------------------------------------------------------
   Strict master types for the central inventory layer.
   Slugs are ALWAYS kebab-case and are the canonical keys
   used for routing and filtering.
========================================================= */

export type Category = {
  /** Canonical kebab-case slug, e.g. "engine", "body-parts". */
  slug: string;
  /** Human-readable display name, e.g. "Body Parts". */
  name: string;
};

export type Brand = {
  /** Canonical kebab-case slug, e.g. "bmw", "brembo-gt-kits". */
  slug: string;
  /** Human-readable display name, e.g. "BMW". */
  name: string;
  /** Parent category slug (kebab-case). */
  category: string;
};

/** Canonical marketplace condition slugs (resolved at query/display time). */
export type ProductCondition =
  | "brand-new"
  | "used"
  | "refurbished"
  | "aftermarket-used"
  | "aftermarket-mixed";

/**
 * Product is the normalized inventory record.
 *
 * NOTE ON `id`:
 * The Phase-1 spec proposed `id: string`. The existing cart,
 * checkout, product route (`getProductById(Number(id))`) and
 * product cards are all typed to a numeric id. Because Phase 1
 * must NOT change UI/routing/behavior, we keep `id: number` for
 * now. Migrating to string ids is a safe follow-up once UI
 * components are allowed to change.
 *
 * `category` and `brand` reference the canonical kebab-case
 * slugs from categories.ts and brands.ts.
 */
export type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;

  /** Competitor / MSRP anchor shown struck through when a sale price applies. */
  compareAtPrice?: number;

  /** Whether the product is in stock. */
  stock?: boolean;

  /** Optional unit quantity for marketplace stock testing. */
  stockQty?: number;

  /** Engine system only: the engine platform slug this product belongs to. */
  platform?: string;

  /** Primary image (alias supported for forward compatibility). */
  image?: string;
  /** Primary thumbnail used by the current UI. */
  thumbnail?: string;
  /** Gallery images used by the product detail page. */
  images?: string[];

  condition?: string;
  location?: string;
  description?: string;

  /** Display horsepower for engine and performance listings. */
  horsepower?: string;
  /**
   * A power figure the engine can reach with work, shown beside the factory
   * rating. Must read as a build target — the listing sells the engine as
   * supplied, not a modified one.
   */
  buildPotential?: string;
  /** Display mileage (brand-new catalog engines default to 0 Miles). */
  mileage?: string;
  /** Display warranty label shown in quick specs. */
  warranty?: string;
  /** Aggregate product rating (seedable without live reviews). */
  rating?: number;
  /** Aggregate review count (seedable without live reviews). */
  reviewCount?: number;

  /** Optional listing timestamp for sort (e.g. aftermarket feed). */
  createdAt?: number;

  /** Curated high-demand SKU flag for category starter lists. */
  topDemand?: boolean;

  /**
   * The listing's reference price was read from a supplier page that can still
   * be checked. This is all the storefront needs from that provenance: it
   * decides whether a struck-through price and ON SALE badge may be shown.
   * The supplier URL itself is deliberately NOT stored here -- catalog data is
   * bundled into browser JavaScript, so a URL in it is readable by every
   * visitor and names the supplier.
   */
  referencePriceVerified?: boolean;

  /**
   * The authored `price` is the manufacturer's published MSRP, confirmed
   * against the manufacturer. Only then may the storefront strike it through
   * as a list price. `referencePriceVerified` (a supplier page) is not enough:
   * that price may be a retailer's, not the manufacturer's.
   */
  msrpConfirmed?: boolean;

  /**
   * The `location` warehouse label is confirmed for this listing: the unit is
   * held in a warehouse DrivoraParts operates. Unset, a warehouse label is
   * shown as neutral fulfillment wording instead; see fulfillment.ts. Nothing
   * sets it yet, and it does not affect stock or availability.
   */
  shipsFromVerified?: boolean;

  /**
   * Import-time only. New import scripts may still emit a supplier URL; it is
   * honoured by the pricing check but must be converted to
   * `referencePriceVerified` before it is committed (audit-storefront-claims
   * fails the build otherwise).
   */
  sourceUrl?: string;

  /* =======================================================
     STRUCTURED FITMENT & LOGISTICS (OPTIONAL)
     -------------------------------------------------------
     Drive the "Fitment & Logistics" block on the product
     page. Every field is optional — rows only render when a
     value is present, so existing products are unaffected.
  ======================================================= */

  /** Manufacturer / OEM identifier, e.g. "ZF 8HP70", "4L60E", "CD009". */
  partNumber?: string;
  /** What vehicles/chassis/years this part fits, incl. bellhousing notes. */
  fitment?: string;
  /**
   * Verified attributes for this exact part -- micron rating, AN size, CFM,
   * finish and so on. Recovered from the manufacturer's own record during the
   * catalog research, so the product page can state a fact instead of parsing
   * it back out of marketing prose.
   */
  specifications?: Record<string, string | number>;
  /**
   * Every vehicle the manufacturer lists for this part, kept whole rather than
   * flattened into a sentence. `fitment` is the readable summary of it.
   */
  fitmentApplications?: {
    yearFrom: number | null;
    yearTo: number | null;
    make: string;
    model: string;
    submodel?: string | null;
  }[];
  /** The years `fitment` covers, when the source states a range. */
  fitmentYears?: string;
  /** Engine or platform the part is built for, e.g. "Gen V LT", "Coyote". */
  fitmentEngine?: string;
  /**
   * Sold without a vehicle application -- a wastegate, a fan, a seat. Set only
   * where the maker says so, never because fitment could not be found: those
   * two states are different and must not be confused.
   */
  universalFitment?: boolean;
  /** Drivetrain layout this unit is configured for, e.g. "RWD", "AWD". */
  drivetrain?: string;
  /** Physical contents included with the unit. */
  included?: string[];
  /** Structured package contents; see PackageContents. */
  packageContents?: PackageContents;
  /**
   * Swap-oriented package: fitment depends on the buyer's fabrication, so the
   * product page offers fitment assistance rather than claiming the order is
   * verified against their vehicle before dispatch.
   */
  swapPackage?: boolean;
  /** Core charge / core return policy, e.g. "Outright — No Core Required". */
  coreCharge?: string;
  /** Shipping weight, e.g. "185 lbs (crated)". */
  weight?: string;
  /** Heavy-freight handling notes (liftgate, residential vs. commercial). */
  freightNotes?: string;
  /** Warranty liability terms, e.g. "Parts only — no labor covered". */
  warrantyTerms?: string;

  /* =======================================================
     INSTALLATION RESOURCES (OPTIONAL)
     -------------------------------------------------------
     Only render the "Installation Resources" block when at
     least one of these is actually present — never fabricate
     placeholder torque specs, guides, or run times.
  ======================================================= */

  /** Rough difficulty rating for a DIY install, e.g. "Beginner", "Advanced". */
  installDifficulty?: string;
  /** Rough hands-on time, e.g. "2-3 hours". */
  installEstimatedTime?: string;
  /** Key torque specs, e.g. "Head bolts: 22 ft-lb + 90°". */
  installTorqueSpecs?: string;
  /** Link to a written install guide. */
  installGuideUrl?: string;
  /** Link to an install video (YouTube, etc.). */
  installVideoUrl?: string;
};

/**
 * How much of a listing's package contents is established.
 *  - "listed": the contents come from the supplier's own listing text and are
 *    itemized there.
 *  - "partial": some items are established; the rest are not confirmed.
 *  - "unconfirmed": nothing about the contents is established yet.
 * Nothing is ever shown as included merely because that kind of product
 * normally ships with it.
 */
export type ContentsStatus = "listed" | "partial" | "unconfirmed" | "stated";

/** Which shared installation-guidance checklist a listing shows. */
export type RequirementsChecklistId =
  | "engine"
  | "transmission"
  | "turbocharger"
  | "supercharger"
  | "suspension"
  | "brakes"
  | "fuel"
  | "cooling"
  | "drivetrain";

/**
 * What a buyer needs to know about a package. Every list holds only what the
 * listing's own source establishes; general guidance lives in the shared
 * checklists (lib/content/requirements-checklists.ts), never here.
 */
export type PackageContents = {
  status: ContentsStatus;
  checklist?: RequirementsChecklistId;
  /** What's Included. */
  included?: string[];
  /** Stated by the source as not part of the package. */
  notIncluded?: string[];
  /** Stated by the source as needed and sold separately. */
  requiredSeparately?: string[];
  optionalUpgrades?: string[];
  /** Conditions that depend on the vehicle, drivetrain or application. */
  vehicleRequirements?: string[];
  /** Major installation steps or dependencies the source states. */
  installationRequirements?: string[];
  /** Programming, calibration, coding or tuning the source states is needed. */
  programmingRequirements?: string[];
  /** Where the facts above were researched, with the date they were checked. */
  sources?: { label: string; url: string; accessed: string }[];
};

/** Structured fitment & logistics shown on the product page. */
export type ProductLogistics = {
  partNumber?: string;
  fitment?: string;
  drivetrain?: string;
  included?: string[];
  coreCharge?: string;
  weight?: string;
  freightNotes?: string;
  warrantyTerms?: string;
  contents?: PackageContents;
};
