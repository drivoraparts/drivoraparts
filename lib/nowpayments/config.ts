import {
  getNowPaymentsApiKey,
  getNowPaymentsIpnSecret,
  getSiteUrl,
} from "@/lib/env";
import { getNowPaymentsStaticPaymentUrl } from "@/lib/payments/nowpayments/client";

export type NowPaymentsConfig = {
  enabled: boolean;
  apiConfigured: boolean;
  staticPaymentUrl: string;
  callbackUrl: string;
  returnUrl: string;
};

export function getNowPaymentsConfig(): NowPaymentsConfig {
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  return {
    enabled: true,
    apiConfigured: Boolean(getNowPaymentsApiKey() && getNowPaymentsIpnSecret()),
    staticPaymentUrl: getNowPaymentsStaticPaymentUrl(),
    callbackUrl: `${siteUrl}/api/payments/webhook/nowpayments`,
    returnUrl: `${siteUrl}/success`,
  };
}
