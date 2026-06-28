import { createHmac } from "node:crypto";

import {
  getNowPaymentsApiKey,
  getNowPaymentsIpnSecret,
  getSiteUrl,
} from "@/lib/env";
import { logActivity } from "@/lib/monitoring/activity";

const NOWPAYMENTS_API = "https://api.nowpayments.io/v1/invoice";

export type NowPaymentsInvoiceInput = {
  orderId: string;
  amount: number;
  currency?: string;
  callbackUrl: string;
  successUrl: string;
  cancelUrl: string;
  description?: string;
};

export type NowPaymentsInvoiceResult =
  | {
      ok: true;
      paymentUrl: string;
      invoiceId: string;
      raw: Record<string, unknown>;
    }
  | {
      ok: false;
      error: string;
      raw?: Record<string, unknown>;
    };

export type NowPaymentsWebhookPayload = {
  payment_id?: number | string;
  invoice_id?: number | string;
  order_id?: string;
  payment_status?: string;
  price_amount?: number | string;
  price_currency?: string;
  pay_amount?: number | string;
  pay_currency?: string;
};

export function isNowPaymentsApiConfigured(): boolean {
  return Boolean(getNowPaymentsApiKey());
}

export function getNowPaymentsStaticPaymentUrl(): string {
  const iid = process.env.NOWPAYMENTS_BUTTON_IID ?? "4682099423";
  return `https://nowpayments.io/payment/?iid=${iid}&source=button`;
}

/** @deprecated Use isNowPaymentsApiConfigured for API invoice creation. */
export function isNowPaymentsConfigured(): boolean {
  return isNowPaymentsApiConfigured();
}

export function buildNowPaymentsUrls(orderId: string) {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  return {
    callbackUrl: `${siteUrl}/api/payments/webhook/nowpayments`,
    successUrl: `${siteUrl}/success?orderId=${orderId}`,
    cancelUrl: `${siteUrl}/checkout?payment=failed&orderId=${orderId}`,
  };
}

export async function createNowPaymentsInvoice(
  input: NowPaymentsInvoiceInput
): Promise<NowPaymentsInvoiceResult> {
  const apiKey = getNowPaymentsApiKey();

  if (!apiKey) {
    return { ok: false, error: "NOWPayments is not configured" };
  }

  const body = {
    price_amount: input.amount,
    price_currency: (input.currency ?? "USD").toLowerCase(),
    order_id: input.orderId,
    order_description:
      input.description ?? `DrivoraParts order ${input.orderId}`,
    ipn_callback_url: input.callbackUrl,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };

  try {
    const response = await fetch(NOWPAYMENTS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => null)) as {
      invoice_url?: string;
      id?: number | string;
      message?: string;
    } | null;

    if (!response.ok || !data?.invoice_url || data.id == null) {
      const error = data?.message ?? `NOWPayments API error (${response.status})`;

      await logActivity("error", "nowpayments.invoice_failed", {
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

    const invoiceId = String(data.id);

    await logActivity("info", "nowpayments.invoice_created", {
      orderId: input.orderId,
      invoiceId,
    });

    return {
      ok: true,
      paymentUrl: data.invoice_url,
      invoiceId,
      raw: data as Record<string, unknown>,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "NOWPayments invoice request failed";

    await logActivity("error", "nowpayments.invoice_failed", {
      orderId: input.orderId,
      error: message,
    });

    return { ok: false, error: message };
  }
}

function sortObjectDeep(value: unknown): unknown {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const record = value as Record<string, unknown>;
  return Object.keys(record)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = sortObjectDeep(record[key]);
      return acc;
    }, {});
}

export function verifyNowPaymentsWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const ipnSecret = getNowPaymentsIpnSecret();
  if (!ipnSecret || !signatureHeader) return false;

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return false;
  }

  const sorted = sortObjectDeep(payload);
  const serialized = JSON.stringify(sorted);
  const expected = createHmac("sha512", ipnSecret)
    .update(serialized)
    .digest("hex");

  return expected === signatureHeader;
}

export function parseNowPaymentsWebhookPayload(
  rawBody: string
): NowPaymentsWebhookPayload | null {
  try {
    return JSON.parse(rawBody) as NowPaymentsWebhookPayload;
  } catch {
    return null;
  }
}

export function mapNowPaymentsPaymentStatus(
  payload: NowPaymentsWebhookPayload
): "pending" | "paid" | "failed" {
  const status = (payload.payment_status ?? "").toLowerCase();

  if (status === "finished" || status === "confirmed") {
    return "paid";
  }

  if (
    status === "failed" ||
    status === "refunded" ||
    status === "expired"
  ) {
    return "failed";
  }

  return "pending";
}
