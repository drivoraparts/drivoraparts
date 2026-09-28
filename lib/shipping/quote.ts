/* =========================================================
   DRIVORAPARTS — SHIPPING ASSESSMENT
   ---------------------------------------------------------
   THIS FILE PRICES NOTHING. IT USED TO.

   It previously returned "Free Standard Shipping" at $0 for
   every cart, every destination and every freight class, and
   checkout rendered that as the word "Free". That was not a
   quote, it was a constant -- and it contradicted the actual
   policy, under which Australia and other international
   destinations are charged and a crated engine can carry a
   charge even to a free-eligible one.

   An order's shipping charge is worked out by a person and
   entered when they send the customer their payment details.
   Until that happens the charge is genuinely unknown, and the
   storefront says so rather than showing a zero.

   What remains is the description of the shipment that the
   admin needs in order to quote it: how it physically ships,
   where it is going, and which policy applies there.
========================================================= */

import { getProductById } from "@/lib/inventory";
import { getProductCatalogMeta } from "@/lib/inventory/productEnhancements";
import {
  FREIGHT_CLASS_LABEL,
  isFreeStandardEligibleZone,
  resolveZone,
  zoneLabel,
  ZONE_LABEL,
  type FreightClass,
  type ShippingZone,
} from "./config";

/**
 * Freight class for one product.
 *
 * Prefers the freight notes the catalog already authors, because that is real
 * per-product data rather than a guess. Where a product has no logistics entry
 * -- most of the catalog does -- it falls back to its category, which is the
 * only other honest signal available. Categories are grouped by how the parts
 * physically ship, not by price.
 */
export function resolveFreightClass(productId: number): FreightClass {
  const product = getProductById(productId);
  if (!product) return "parcel";

  const meta = getProductCatalogMeta(product);
  const notes = String(meta?.logistics?.freightNotes ?? "").toLowerCase();

  if (notes) {
    if (notes.includes("pallet") || notes.includes("ltl") || notes.includes("freight")) {
      return "pallet";
    }
    if (notes.includes("multiple") || notes.includes("boxes")) return "multibox";
    if (notes.includes("parcel") || notes.includes("courier")) return "parcel";
  }

  /*
   * No logistics entry -- most of the catalog. Fall back to category, which
   * describes how that kind of part usually ships.
   *
   * Category alone is too coarse on its own: the "engine" category holds
   * complete engines AND fuel pumps, filters and sensors, so a
   * small-component name demotes the item back to parcel regardless of
   * category. This only decides which note the admin sees while quoting, so
   * erring toward parcel costs nothing -- the person still reads the order.
   */
  const name = product.name.toLowerCase();
  const isSmallComponent =
    /\b(pump|filter|sensor|gasket|seal|injector|hose|clamp|bolt|nut|cap|adapter|spacer|bracket|switch|relay|valve|belt|plug|wire|harness|bulb|lug|cover|knob|shirt|sticker|decal)\b/.test(
      name
    );

  if (isSmallComponent) return "parcel";

  switch (product.category) {
    case "engine":
    case "transmission":
    case "canopy":
    case "body-parts":
      return "pallet";
    case "suspension":
    case "bumper":
    case "wheels-tires":
    case "4x4-accessories":
      return "multibox";
    default:
      return "parcel";
  }
}

const CLASS_ORDER: FreightClass[] = ["parcel", "multibox", "pallet"];

/** The heaviest class in a cart decides how the shipment is handled. */
export function resolveCartFreightClass(
  items: { productId: number; quantity: number }[]
): FreightClass {
  let heaviest: FreightClass = "parcel";

  for (const item of items) {
    const cls = resolveFreightClass(item.productId);
    if (CLASS_ORDER.indexOf(cls) > CLASS_ORDER.indexOf(heaviest)) heaviest = cls;
  }

  return heaviest;
}

/**
 * Everything known about a shipment before anyone has priced it.
 *
 * Deliberately carries no amount. The admin payment screen renders this as
 * context beside the box where the real figure is typed.
 */
export type ShippingAssessment = {
  freightClass: FreightClass;
  freightClassLabel: string;
  zone: ShippingZone;
  zoneLabel: string;
  /** Destination where an eligible standard order can ship at no charge. */
  freeStandardEligibleZone: boolean;
  /** Moves as freight, so it can be charged even to a free-eligible zone. */
  movesAsFreight: boolean;
};

export function assessShipping(
  items: { productId: number; quantity: number }[],
  country?: string | null
): ShippingAssessment {
  const zone = resolveZone(country);
  const freightClass = resolveCartFreightClass(items);

  return {
    freightClass,
    freightClassLabel: FREIGHT_CLASS_LABEL[freightClass],
    zone,
    zoneLabel: ZONE_LABEL[zone],
    freeStandardEligibleZone: isFreeStandardEligibleZone(zone),
    movesAsFreight: freightClass === "pallet",
  };
}

/**
 * One sentence an admin can read while deciding what to charge.
 *
 * Guidance for the person quoting, never customer-facing copy.
 *
 * Built from the zone and freight class RECORDED ON THE ORDER at checkout,
 * not re-derived now: the customer record holds no country, and an order's
 * destination should not be able to change under it because someone edited an
 * address later.
 */
export function describeStoredShipment(
  zone: string | null | undefined,
  freightClass: string | null | undefined
): string {
  const destination = zoneLabel(zone);
  const eligible =
    typeof zone === "string" && isFreeStandardEligibleZone(zone as ShippingZone);
  const freight = freightClass === "pallet";

  if (!eligible) {
    return `${destination} — a charged destination, so shipping applies.`;
  }

  if (freight) {
    return `${destination} — standard shipping can be free here, but this order moves as freight, so a charge may still apply.`;
  }

  return `${destination} — standard shipping can be free on an eligible order like this one.`;
}
