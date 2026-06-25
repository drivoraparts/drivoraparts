import {
  getCryptomusMerchantId,
  getCryptomusPaymentKey,
  getSiteUrl,
} from "@/lib/env";

/** Tawk.to embed configuration for the DrivoraParts storefront. */
export const TAWK_PROPERTY_ID = "6a392868452f781d473b4ceb";
export const TAWK_WIDGET_ID = "1jrs9hdba";
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
