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
      value: 0,
      currency: "USD",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry,
    },
    deliveryTime: deliveryTime(transitTime),
  };
}

/** Nested inside Product → offers for Google Merchant listings. */
export function productOfferShippingDetails(): JsonLd[] {
  return [
    shippingDetailsForCountry("US", TRANSIT_TIME_US),
    shippingDetailsForCountry("AU", TRANSIT_TIME_INTERNATIONAL),
    shippingDetailsForCountry("CA", TRANSIT_TIME_INTERNATIONAL),
    shippingDetailsForCountry("GB", TRANSIT_TIME_INTERNATIONAL),
  ];
}

/** Matches app/policies/refund-policy — 30-day window, return by mail, customer pays return shipping. */
export function productOfferReturnPolicy(): JsonLd {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: ["US", "AU", "CA", "GB"],
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 30,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    merchantReturnLink: absoluteUrl("/policies/refund-policy"),
  };
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
