import { getCryptomusMerchantId, getCryptomusPaymentKey, getSiteUrl } from "@/lib/env";
import { md5 } from "@/lib/cryptomus/md5";
import { logActivity } from "@/lib/monitoring/activity";

const CRYPTOMUS_API = "https://api.cryptomus.com/v1/payment";
const CRYPTOMUS_INFO_API = "https://api.cryptomus.com/v1/payment/info";

export type CryptomusInvoiceInput = {
  orderId: string;
  amount: number;
  currency?: string;
  callbackUrl: string;
  successUrl: string;
  failUrl: string;
};

export type CryptomusInvoiceResult =
  | {
      ok: true;
      paymentUrl: string;
      transactionId: string;
      raw: Record<string, unknown>;
    }
  | {
      ok: false;
      error: string;
      raw?: Record<string, unknown>;
    };

export type CryptomusWebhookPayload = {
  uuid?: string;
  order_id?: string;
  status?: string;
  payment_status?: string;
  amount?: string;
  currency?: string;
};

function signPayload(payload: string, apiKey: string): string {
  return md5(`${btoa(payload)}${apiKey}`);
}

function buildWebhookPayloadCandidates(
  dataWithoutSign: Record<string, unknown>
): string[] {
  const plain = JSON.stringify(dataWithoutSign);
  const escapedSlashes = plain.replace(/\//g, "\\/");
  return plain === escapedSlashes ? [plain] : [plain, escapedSlashes];
}

export function isCryptomusConfigured(): boolean {
  return Boolean(getCryptomusMerchantId() && getCryptomusPaymentKey());
}

export function buildCryptomusUrls(orderId: string) {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  return {
    callbackUrl: `${siteUrl}/api/payments/webhook/cryptomus`,
    successUrl: `${siteUrl}/success?orderId=${orderId}`,
    failUrl: `${siteUrl}/checkout?payment=failed&orderId=${orderId}`,
  };
}

export async function createCryptomusInvoice(
  input: CryptomusInvoiceInput
): Promise<CryptomusInvoiceResult> {
  const merchantId = getCryptomusMerchantId();
  const apiKey = getCryptomusPaymentKey();

  if (!merchantId || !apiKey) {
    return { ok: false, error: "Cryptomus is not configured" };
  }

  const body = {
    amount: input.amount.toFixed(2),
    currency: input.currency ?? "USD",
    order_id: input.orderId,
    url_callback: input.callbackUrl,
    url_return: input.successUrl,
    url_fail: input.failUrl,
    is_payment_multiple: false,
    lifetime: 3600,
  };

  const payload = JSON.stringify(body);
  const sign = signPayload(payload, apiKey);

  try {
    const response = await fetch(CRYPTOMUS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant: merchantId,
        sign,
      },
      body: payload,
    });

    const data = (await response.json().catch(() => null)) as {
      result?: { url?: string; uuid?: string };
      message?: string;
      state?: number;
    } | null;

    if (!response.ok || !data?.result?.url || !data.result.uuid) {
      const error = data?.message ?? `Cryptomus API error (${response.status})`;

      await logActivity("error", "cryptomus.invoice_failed", {
        orderId: input.orderId,
        error,
        status: response.status,
      });

      return {
        ok: false,
        error,
        raw: (data ?? {}) as Record<string, unknown>,
      };
    }

    await logActivity("info", "cryptomus.invoice_created", {
      orderId: input.orderId,
      transactionId: data.result.uuid,
    });

    return {
      ok: true,
      paymentUrl: data.result.url,
      transactionId: data.result.uuid,
      raw: data as Record<string, unknown>,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Cryptomus invoice request failed";

    await logActivity("error", "cryptomus.invoice_failed", {
      orderId: input.orderId,
      error: message,
    });

    return { ok: false, error: message };
  }
}

// Flat shape (not a discriminated union): the project runs with `strict: false`,
// so literal-discriminant narrowing is unreliable. Optional fields keep access safe.
export type CryptomusPaymentInfoResult = {
  ok: boolean;
  status?: "pending" | "paid" | "failed";
  providerPaymentId?: string;
  error?: string;
  notFound?: boolean;
  raw?: Record<string, unknown>;
};

/**
 * Server-authoritative status lookup used by the reconciliation safety net.
 * Queries Cryptomus directly for an order so missed/delayed webhooks can be
 * recovered. Never trusts client input.
 */
export async function getCryptomusPaymentInfo(
  orderId: string
): Promise<CryptomusPaymentInfoResult> {
  const merchantId = getCryptomusMerchantId();
  const apiKey = getCryptomusPaymentKey();

  if (!merchantId || !apiKey) {
    return { ok: false, error: "Cryptomus is not configured" };
  }

  const payload = JSON.stringify({ order_id: orderId });
  const sign = signPayload(payload, apiKey);

  try {
    const response = await fetch(CRYPTOMUS_INFO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant: merchantId,
        sign,
      },
      body: payload,
    });

    const data = (await response.json().catch(() => null)) as {
      result?: CryptomusWebhookPayload & { uuid?: string };
      message?: string;
      state?: number;
    } | null;

    if (!response.ok || !data?.result) {
      return {
        ok: false,
        error: data?.message ?? `Cryptomus info error (${response.status})`,
        notFound: response.status === 404,
      };
    }

    return {
      ok: true,
      status: mapCryptomusPaymentStatus(data.result),
      providerPaymentId: data.result.uuid,
      raw: data as Record<string, unknown>,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Cryptomus info request failed",
    };
  }
}

export function verifyCryptomusWebhookSignature(
  rawBody: string,
  signHeader: string | null
): boolean {
  const apiKey = getCryptomusPaymentKey();
  if (!apiKey) return false;

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return signHeader ? signPayload(rawBody, apiKey) === signHeader : false;
  }

  const bodySign =
    typeof payload.sign === "string" ? payload.sign : signHeader ?? null;
  if (!bodySign) return false;

  const { sign: _ignored, ...dataWithoutSign } = payload;

  for (const candidate of buildWebhookPayloadCandidates(dataWithoutSign)) {
    if (signPayload(candidate, apiKey) === bodySign) {
      return true;
    }
  }

  if (signHeader && signPayload(rawBody, apiKey) === signHeader) {
    return true;
  }

  return false;
}

export function parseCryptomusWebhookPayload(
  rawBody: string
): CryptomusWebhookPayload | null {
  try {
    return JSON.parse(rawBody) as CryptomusWebhookPayload;
  } catch {
    return null;
  }
}

export function mapCryptomusPaymentStatus(
  payload: CryptomusWebhookPayload
): "pending" | "paid" | "failed" {
  const status = payload.status ?? payload.payment_status ?? "";

  if (status === "paid" || status === "paid_over") {
    return "paid";
  }

  if (
    status === "cancel" ||
    status === "fail" ||
    status === "failed" ||
    status === "wrong_amount" ||
    status === "system_fail"
  ) {
    return "failed";
  }

  return "pending";
}
