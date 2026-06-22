import {
  getCryptomusMerchantId,
  getCryptomusPaymentKey,
  getSiteUrl,
} from "@/lib/env";
import type { CryptomusConfig } from "./types";

export function getCryptomusConfig(): CryptomusConfig {
  const merchantId = getCryptomusMerchantId();
  const apiKey = getCryptomusPaymentKey();
  const siteUrl = getSiteUrl();

  return {
    enabled: Boolean(merchantId && apiKey),
    merchantId: merchantId ?? undefined,
    apiKey: apiKey ?? undefined,
    callbackUrl: `${siteUrl}/api/payments/webhook/cryptomus`,
    returnUrl: `${siteUrl}/success`,
  };
}
