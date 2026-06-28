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
  customerEmail?: string;
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

/** Creates a NOWPayments invoice for the order amount (API when configured). */
export async function createAutoOrderInvoice(input: {
  orderId: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
}): Promise<{
  paymentUrl: string;
  transactionId: string;
  mode: "api_invoice" | "static_invoice_link";
}> {
  return resolveNowPaymentsCheckoutUrl(input);
}

export async function resolveNowPaymentsCheckoutUrl(input: {
  orderId: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
}): Promise<{
  paymentUrl: string;
  transactionId: string;
  mode: "api_invoice" | "static_invoice_link";
}> {
  if (isNowPaymentsApiConfigured()) {
    const urls = buildNowPaymentsUrls(input.orderId);
    const invoice = await createNowPaymentsInvoice({
      orderId: input.orderId,
      amount: input.amount,
      currency: input.currency,
      customerEmail: input.customerEmail,
      callbackUrl: urls.callbackUrl,
      successUrl: urls.successUrl,
      cancelUrl: urls.cancelUrl,
    });

    if (!invoice.ok) {
      const error = "error" in invoice ? invoice.error : "API invoice failed";
      await logActivity("error", "nowpayments.auto_invoice_failed", {
        orderId: input.orderId,
        error,
      });

      if (process.env.NODE_ENV === "production") {
        throw new Error(
          `Could not create payment invoice: ${error}. Check NOWPAYMENTS_API_KEY and order amount meets the minimum.`
        );
      }

      await logActivity("warn", "nowpayments.api_fallback_static", {
        orderId: input.orderId,
        error,
      });
    } else {
      return {
        paymentUrl: invoice.paymentUrl,
        transactionId: invoice.invoiceId,
        mode: "api_invoice",
      };
    }
  } else if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NOWPAYMENTS_API_KEY is required in production to create customer invoices."
    );
  }

  const invoiceId = process.env.NOWPAYMENTS_BUTTON_IID ?? "4682099423";
  return {
    paymentUrl: getNowPaymentsStaticPaymentUrl(),
    transactionId: invoiceId,
    mode: "static_invoice_link",
  };
}

export async function createNowPaymentsInvoice(
  input: NowPaymentsInvoiceInput
): Promise<NowPaymentsInvoiceResult> {
  const apiKey = getNowPaymentsApiKey();

  if (!apiKey) {
    return { ok: false, error: "NOWPayments is not configured" };
  }

  const body: Record<string, string | number> = {
    price_amount: input.amount,
    price_currency: (input.currency ?? "USD").toLowerCase(),
    order_id: input.orderId,
    order_description:
      input.description ?? `DrivoraParts order ${input.orderId}`,
    ipn_callback_url: input.callbackUrl,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };

  if (input.customerEmail) {
    body.customer_email = input.customerEmail;
  }

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

    if (!response.ok || data.id == null) {
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
    const paymentUrl =
      data.invoice_url ??
      `https://nowpayments.io/payment/?iid=${encodeURIComponent(invoiceId)}`;

    await logActivity("info", "nowpayments.invoice_created", {
      orderId: input.orderId,
      invoiceId,
    });

    return {
      ok: true,
      paymentUrl,
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

/** Resolve merchant order_id from a NOWPayments payment or invoice reference (e.g. NP_id). */
export async function fetchNowPaymentsOrderId(
  ref: string
): Promise<string | null> {
  const apiKey = getNowPaymentsApiKey();
  if (!apiKey || !ref) return null;

  const endpoints = [
    `https://api.nowpayments.io/v1/payment/${encodeURIComponent(ref)}`,
    `https://api.nowpayments.io/v1/invoice/${encodeURIComponent(ref)}`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: { "x-api-key": apiKey },
        cache: "no-store",
      });
      if (!response.ok) continue;

      const data = (await response.json().catch(() => null)) as {
        order_id?: string | null;
      } | null;

      if (data?.order_id) return data.order_id;
    } catch {
      // try next endpoint
    }
  }

  return null;
}
