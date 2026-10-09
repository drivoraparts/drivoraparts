import type { Product } from "@/lib/inventory/types";
import {
  classifyProductShipping,
  findBracket,
  US_PARCEL_RATE_TABLE,
  type ShippingLabel,
} from "@/lib/shipping/rates";
import { absoluteUrl } from "./urls";

type JsonLd = Record<string, unknown>;

/** Matches app/policies/shipping-policy — processing 1–5 business days, transit 5–15 business days. */
const HANDLING_TIME = { minValue: 1, maxValue: 5, unitCode: "DAY" as const };
const TRANSIT_TIME_US = { minValue: 5, maxValue: 15, unitCode: "DAY" as const };
const TRANSIT_TIME_INTERNATIONAL = { minValue: 7, maxValue: 21, unitCode: "DAY" as const };

function deliveryTime(transitTime: typeof TRANSIT_TIME_US): JsonLd {
  return {
    "@type": "ShippingDeliveryTime",
    handlingTime: {
      "@type": "QuantitativeValue",
      ...HANDLING_TIME,
    },
    transitTime: {
      "@type": "QuantitativeValue",
      ...transitTime,
    },
  };
}

function shippingDetailsForCountry(
  addressCountry: string,
  transitTime: typeof TRANSIT_TIME_US,
  label: ShippingLabel,
  usRateUsd?: number
): JsonLd {
  return {
    "@type": "OfferShippingDetails",
    /*
     * A rate is stated ONLY where one is published: the United States, for a
     * standard parcel item, from the US table in lib/shipping/rate-table.ts --
     * the item's own bracket, which is what Google's price-based table gives
     * for a single unit and what checkout charges for it alone.
     *
     * Everywhere else (freight and multi-box items, which have no published
     * rate yet; every destination outside the US) the rate is omitted rather
     * than guessed. This block once declared a flat "0" USD for four
     * countries on every product, which promised free shipping that the
     * policy did not offer.
     *
     * shippingLabel matches the shipping_label in the Google Merchant feed
     * (lib/feeds/google-merchant.ts), so the label Google reads here and the
     * one in the feed are the same value.
     */
    ...(addressCountry === "US" && usRateUsd !== undefined
      ? {
          shippingRate: {
            "@type": "MonetaryAmount",
            value: usRateUsd.toFixed(2),
            currency: "USD",
          },
        }
      : {}),
    shippingLabel: label,
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry,
    },
    deliveryTime: deliveryTime(transitTime),
  };
}

const SHIPPING_COUNTRIES: Array<{
  country: string;
  transitTime: typeof TRANSIT_TIME_US;
}> = [
  { country: "US", transitTime: TRANSIT_TIME_US },
  { country: "AU", transitTime: TRANSIT_TIME_INTERNATIONAL },
  { country: "CA", transitTime: TRANSIT_TIME_INTERNATIONAL },
  { country: "GB", transitTime: TRANSIT_TIME_INTERNATIONAL },
];

/** Nested inside Product → offers for Google Merchant listings. */
export function productOfferShippingDetails(
  product: Product,
  offerPrice: number
): JsonLd | JsonLd[] {
  const { label } = classifyProductShipping(product);
  const row =
    label === "parcel" && Number.isFinite(offerPrice)
      ? findBracket(US_PARCEL_RATE_TABLE, Math.round(offerPrice * 100))
      : undefined;
  const usRate = row ? row.feeCents / 100 : undefined;

  const regions = SHIPPING_COUNTRIES.map(({ country, transitTime }) =>
    shippingDetailsForCountry(country, transitTime, label, usRate)
  );
  return regions.length === 1 ? regions[0] : regions;
}

const RETURN_POLICY_COUNTRIES = ["US", "AU", "CA", "GB"] as const;

/** Matches app/policies/refund-policy — 30-day window, return by mail, customer pays return shipping. */
export function productOfferReturnPolicy(): JsonLd | JsonLd[] {
  const policies = RETURN_POLICY_COUNTRIES.map((country) => ({
    "@type": "MerchantReturnPolicy",
    applicableCountry: country,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 30,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    merchantReturnLink: absoluteUrl("/policies/refund-policy"),
  }));
  return policies.length === 1 ? policies[0] : policies;
}

/** Offer validFrom: the price is current as of the render, like priceValidUntil. */
export function productOfferValidFrom(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Google merchant listing examples include priceValidUntil on Offer. */
export function productOfferPriceValidUntil(): string {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

const NEW = "https://schema.org/NewCondition";
const USED = "https://schema.org/UsedCondition";
const REFURBISHED = "https://schema.org/RefurbishedCondition";

/**
 * schema.org itemCondition from the listing's stored condition string.
 *
 * This used to look the string up exactly, so any wording the table did not
 * list -- "Used like new", "used - inspected and tested" -- fell through to
 * NewCondition while the page and the Meta feed said Used (#184, #185, #2115).
 * It now classifies the same way resolveProductCondition does, which is what
 * the page badge and the feed use, so the three cannot disagree: refurbished
 * or remanufactured first, then anything "used" (a used-like-new part is
 * used), then new. Anything else is left out rather than defaulted to New.
 */
export function productOfferItemCondition(condition?: string): string | undefined {
  const value = (condition ?? "").toLowerCase().trim();
  if (!value) return undefined;
  if (value.includes("refurbished") || value.includes("remanufactured")) return REFURBISHED;
  if (value.includes("used") || value.includes("mixed")) return USED;
  if (value.includes("new")) return NEW;
  return undefined;
}
