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
  /** Drivetrain layout this unit is configured for, e.g. "RWD", "AWD". */
  drivetrain?: string;
  /** Physical contents included with the unit. */
  included?: string[];
  /** Core charge / core return policy, e.g. "Outright — No Core Required". */
  coreCharge?: string;
  /** Heavy-freight handling notes (liftgate, residential vs. commercial). */
  freightNotes?: string;
  /** Warranty liability terms, e.g. "Parts only — no labor covered". */
  warrantyTerms?: string;
};
