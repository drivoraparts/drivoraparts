/* =========================================================
   DRIVORAPARTS — SHIPPING QUOTES
   ---------------------------------------------------------
   Standard is free. Express is priced from the rate table in
   ./config.ts, using the freight class the catalog already
   records per product and the destination country checkout
   already collects.

   Quotes are computed SERVER-SIDE from the product id and
   the chosen method. The customer picks a method, never a
   price -- a client cannot submit a shipping amount.
========================================================= */

import { getProductById } from "@/lib/inventory";
import { getProductCatalogMeta } from "@/lib/inventory/productEnhancements";
import {
  EXPRESS_RATES,
  EXTRA_ITEM_SURCHARGE,
  FREIGHT_CLASS_LABEL,
  isExpressConfigured,
  resolveZone,
  type FreightClass,
  type ShippingZone,
} from "./config";

export type ShippingMethod = "standard" | "express";

export type ShippingQuote = {
  method: ShippingMethod;
  label: string;
  /** USD. Always 0 for standard. */
  amount: number;
  /** Heaviest class in the cart — what the express price is based on. */
  freightClass: FreightClass;
  freightClassLabel: string;
  zone: ShippingZone;
  /** Set when express cannot be offered, so the UI can say why. */
  unavailableReason?: string;
};

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
   * complete engines AND fuel pumps, filters and sensors, and pricing a
   * $60 fuel pump as palletized freight would overcharge badly. So a
   * small-component name demotes the item back to parcel regardless of
   * category. Erring toward the cheaper class is the right direction to be
   * wrong in -- it undercharges us, never the customer.
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

/** The heaviest class in a cart decides the shipment's handling. */
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
 * Every shipping option for a cart going to a destination.
 *
 * Standard is always present and always free. Express appears only when the
 * rate table prices that class-and-zone combination -- an unpriced cell means
 * we genuinely do not offer it, and saying so is better than quoting a number
 * nobody stands behind.
 */
export function quoteShipping(
  items: { productId: number; quantity: number }[],
  country?: string | null
): ShippingQuote[] {
  const zone = resolveZone(country);
  const freightClass = resolveCartFreightClass(items);
  const freightClassLabel = FREIGHT_CLASS_LABEL[freightClass];

  const standard: ShippingQuote = {
    method: "standard",
    label: "Free Standard Shipping",
    amount: 0,
    freightClass,
    freightClassLabel,
    zone,
  };

  if (!isExpressConfigured()) return [standard];

  const base = EXPRESS_RATES[zone]?.[freightClass] ?? null;

  if (base == null || base <= 0) {
    return [
      standard,
      {
        method: "express",
        label: "Express Shipping",
        amount: 0,
        freightClass,
        freightClassLabel,
        zone,
        unavailableReason:
          "Express is not available for this item and destination. Contact us for a freight quote.",
      },
    ];
  }

  const totalUnits = items.reduce((sum, item) => sum + Math.max(1, item.quantity), 0);
  const surcharge = EXTRA_ITEM_SURCHARGE[zone];
  const extras = Math.max(0, totalUnits - 1);
  const amount =
    Math.round((base + (surcharge ? surcharge * extras : 0)) * 100) / 100;

  return [
    standard,
    {
      method: "express",
      label: "Express Shipping",
      amount,
      freightClass,
      freightClassLabel,
      zone,
    },
  ];
}

/**
 * The authoritative price for a chosen method. Checkout calls this instead of
 * trusting any amount from the browser -- the client sends a method name, and
 * the fee is recomputed here from the same catalog data every time.
 */
export function priceShippingMethod(
  items: { productId: number; quantity: number }[],
  country: string | null | undefined,
  method: ShippingMethod
): { amount: number; method: ShippingMethod; freightClass: FreightClass; zone: ShippingZone } {
  const quotes = quoteShipping(items, country);
  const chosen = quotes.find((quote) => quote.method === method);

  // An express selection we cannot price falls back to free standard rather
  // than failing the order or charging a guessed amount.
  if (!chosen || chosen.unavailableReason || chosen.amount < 0) {
    const standard = quotes[0];
    return {
      amount: 0,
      method: "standard",
      freightClass: standard.freightClass,
      zone: standard.zone,
    };
  }

  return {
    amount: chosen.amount,
    method: chosen.method,
    freightClass: chosen.freightClass,
    zone: chosen.zone,
  };
}
