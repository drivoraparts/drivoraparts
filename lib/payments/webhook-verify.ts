/**
 * Cryptomus webhook verification wrapper.
 */
import { verifyCryptomusWebhookSignature } from "@/lib/payments/cryptomus/client";
import { getCryptomusPaymentKey } from "@/lib/env";

export function verifyPaymentWebhookSignature(
  provider: "cryptomus",
  rawBody: string,
  sign: string | null
): boolean {
  if (provider !== "cryptomus") return false;

  if (!getCryptomusPaymentKey()) {
    return false;
  }

  return verifyCryptomusWebhookSignature(rawBody, sign);
}
