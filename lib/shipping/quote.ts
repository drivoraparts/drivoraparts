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

import { classifyProductIdShipping } from "./rates";
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
 * Delegates to classifyProductShipping in ./rates, which is also what prices
 * checkout and labels the Google feed, so the admin screen, the charge and
 * Merchant Center cannot disagree about how an item ships. ("freight" there is
 * "pallet" here -- the stored order column predates the shared labels.)
 *
 * This used to test the notes for "freight" before "parcel", so the catalog's
 * standard note -- "Ships via standard insured parcel/courier -- no special
 * freight handling required" -- classed a parcel as palletized freight.
 */
export function resolveFreightClass(productId: number): FreightClass {
  const classification = classifyProductIdShipping(productId);
  if (!classification) return "parcel";
  return classification.label === "freight" ? "pallet" : classification.label;
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
