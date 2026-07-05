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
    shippingRate: {
      "@type": "MonetaryAmount",
      value: "0",
      currency: "USD",
    },
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

/** Google merchant listing examples include priceValidUntil on Offer. */
export function productOfferPriceValidUntil(): string {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

const ITEM_CONDITION: Record<string, string> = {
  "brand-new": "https://schema.org/NewCondition",
  new: "https://schema.org/NewCondition",
  used: "https://schema.org/UsedCondition",
  refurbished: "https://schema.org/RefurbishedCondition",
};

export function productOfferItemCondition(condition?: string): string | undefined {
  if (!condition) return ITEM_CONDITION["brand-new"];
  return ITEM_CONDITION[condition.toLowerCase()] ?? ITEM_CONDITION["brand-new"];
}
