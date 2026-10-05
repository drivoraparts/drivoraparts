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
  transitTime: typeof TRANSIT_TIME_US
): JsonLd {
  return {
    "@type": "OfferShippingDetails",
    /*
     * No shippingRate. There is no rate to state.
     *
     * This block used to declare a flat "0" USD for all four countries, on
     * every product, which made each listing carry a machine-readable promise
     * of free shipping to the US, UK, Canada AND Australia. Australia and
     * Canada are charged destinations, and even in the US and UK free standard
     * shipping is only ever an eligibility (see lib/shipping/config.ts) that a
     * crated engine or any freight consignment can lose.
     *
     * So the number was wrong in two of the four countries outright and
     * unguaranteed in the other two, while the page beside it correctly said
     * shipping is calculated per order. Shipping here is quoted by hand and is
     * genuinely unknown until an admin works it out, so the rate is omitted
     * rather than guessed. Handling and transit times stay -- those are real,
     * and they match the Shipping Policy.
     */
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
export function productOfferShippingDetails(): JsonLd | JsonLd[] {
  const regions = SHIPPING_COUNTRIES.map(({ country, transitTime }) =>
    shippingDetailsForCountry(country, transitTime)
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
