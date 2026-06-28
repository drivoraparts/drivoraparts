import { verifyNowPaymentsWebhookSignature } from "@/lib/payments/nowpayments/client";

export function verifyPaymentWebhookSignature(
  provider: "nowpayments",
  rawBody: string,
  sign: string | null
): boolean {
  if (provider !== "nowpayments") return false;
  return verifyNowPaymentsWebhookSignature(rawBody, sign);
}
