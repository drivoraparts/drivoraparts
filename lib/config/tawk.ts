import {
  getCryptomusMerchantId,
  getCryptomusPaymentKey,
  getSiteUrl,
  getTawkPropertyId,
  getTawkWidgetId,
} from "@/lib/env";

/** Tawk.to embed configuration — property ID from environment only. */
export const TAWK_PROPERTY_ID = getTawkPropertyId();
export const TAWK_WIDGET_ID = getTawkWidgetId();
export const TAWK_EMBED_SRC = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;

export function getCryptomusPublicConfig() {
  const merchantId = getCryptomusMerchantId();
  const siteUrl = getSiteUrl();

  return {
    enabled: Boolean(merchantId && getCryptomusPaymentKey()),
    callbackUrl: `${siteUrl}/api/payments/webhook/cryptomus`,
    returnUrl: `${siteUrl}/success`,
  };
}
