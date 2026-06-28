import {
  getNowPaymentsApiKey,
  getNowPaymentsIpnSecret,
  getSiteUrl,
} from "@/lib/env";

export type NowPaymentsConfig = {
  enabled: boolean;
  callbackUrl: string;
  returnUrl: string;
};

export function getNowPaymentsConfig(): NowPaymentsConfig {
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  return {
    enabled: Boolean(getNowPaymentsApiKey() && getNowPaymentsIpnSecret()),
    callbackUrl: `${siteUrl}/api/payments/webhook/nowpayments`,
    returnUrl: `${siteUrl}/success`,
  };
}
