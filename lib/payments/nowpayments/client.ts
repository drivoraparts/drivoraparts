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

export function mapNowPaymentsStatusString(
  status: string | null | undefined
): "pending" | "paid" | "failed" {
  const normalized = (status ?? "").toLowerCase();

  if (normalized === "finished" || normalized === "confirmed" || normalized === "sending") {
    return "paid";
  }

  if (
    normalized === "failed" ||
    normalized === "refunded" ||
    normalized === "expired"
  ) {
    return "failed";
  }

  return "pending";
}

export function mapNowPaymentsPaymentStatus(
  payload: NowPaymentsWebhookPayload
): "pending" | "paid" | "failed" {
  return mapNowPaymentsStatusString(payload.payment_status);
}

export type NowPaymentsRemoteStatus = {
  paymentStatus: string;
  orderId: string | null;
  paymentId: string | null;
  source: "payment" | "invoice";
};

type NowPaymentsPaymentRow = {
  payment_id?: number | string;
  payment_status?: string | null;
  order_id?: string | null;
  invoice_id?: number | string | null;
};

function rowToRemoteStatus(row: NowPaymentsPaymentRow): NowPaymentsRemoteStatus | null {
  if (!row.payment_status) return null;
  return {
    paymentStatus: row.payment_status,
    orderId: row.order_id ?? null,
    paymentId: row.payment_id != null ? String(row.payment_id) : null,
    source: "payment",
  };
}

function preferRemoteStatus(
  current: NowPaymentsRemoteStatus | undefined,
  next: NowPaymentsRemoteStatus
): NowPaymentsRemoteStatus {
  if (!current) return next;
  const score = (status: string) => {
    const mapped = mapNowPaymentsStatusString(status);
    if (mapped === "paid") return 3;
    if (mapped === "pending") return 2;
    return 1;
  };
  return score(next.paymentStatus) >= score(current.paymentStatus) ? next : current;
}

function parseNowPaymentsPaymentList(
  payload: unknown
): NowPaymentsPaymentRow[] {
  if (Array.isArray(payload)) return payload as NowPaymentsPaymentRow[];
  if (payload && typeof payload === "object") {
    const record = payload as { data?: NowPaymentsPaymentRow[] };
    if (Array.isArray(record.data)) return record.data;
  }
  return [];
}

function pickBestPaymentStatus(
  payments: NowPaymentsPaymentRow[]
): NowPaymentsRemoteStatus | null {
  if (!payments.length) return null;

  const ranked = [...payments].sort((a, b) => {
    const score = (status: string | null | undefined) => {
      const mapped = mapNowPaymentsStatusString(status);
      if (mapped === "paid") return 3;
      if (mapped === "pending") return 2;
      return 1;
    };
    return score(b.payment_status) - score(a.payment_status);
  });

  const best = ranked[0];
  return rowToRemoteStatus(best);
}

export type NowPaymentsPaymentIndex = {
  byOrderId: Map<string, NowPaymentsRemoteStatus>;
  byInvoiceId: Map<string, NowPaymentsRemoteStatus>;
};

/** One API call — index recent NOWPayments rows by order_id and invoice_id. */
export async function fetchNowPaymentsPaymentIndex(
  limit = 100
): Promise<NowPaymentsPaymentIndex> {
  const apiKey = getNowPaymentsApiKey();
  const byOrderId = new Map<string, NowPaymentsRemoteStatus>();
  const byInvoiceId = new Map<string, NowPaymentsRemoteStatus>();

  if (!apiKey) return { byOrderId, byInvoiceId };

  const payload = await fetchNowPaymentsJson(
    apiKey,
    `https://api.nowpayments.io/v1/payment/?limit=${limit}&sortBy=updated_at&orderBy=desc`
  );

  for (const row of parseNowPaymentsPaymentList(payload)) {
    const remote = rowToRemoteStatus(row);
    if (!remote) continue;

    if (row.order_id) {
      byOrderId.set(row.order_id, preferRemoteStatus(byOrderId.get(row.order_id), remote));
    }

    if (row.invoice_id != null) {
      const key = String(row.invoice_id);
      byInvoiceId.set(key, preferRemoteStatus(byInvoiceId.get(key), remote));
    }
  }

  return { byOrderId, byInvoiceId };
}

async function fetchNowPaymentsJson(
  apiKey: string,
  url: string
): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      headers: { "x-api-key": apiKey },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return response.json().catch(() => null);
  } catch {
    return null;
  }
}

/** Poll NOWPayments for invoice/payment status (reconciliation + success page). */
export async function fetchNowPaymentsRemoteStatus(
  ref: string,
  orderId?: string | null,
  index?: NowPaymentsPaymentIndex
): Promise<NowPaymentsRemoteStatus | null> {
  const apiKey = getNowPaymentsApiKey();
  if (!apiKey) return null;

  if (orderId && index?.byOrderId.has(orderId)) {
    return index.byOrderId.get(orderId) ?? null;
  }

  if (ref && index?.byInvoiceId.has(ref)) {
    return index.byInvoiceId.get(ref) ?? null;
  }

  if (!ref) return null;

  const direct = await fetchNowPaymentsJson(
    apiKey,
    `https://api.nowpayments.io/v1/payment/${encodeURIComponent(ref)}`
  );

  if (direct && typeof direct === "object" && direct !== null) {
    const row = direct as NowPaymentsPaymentRow;
    if (row.payment_status) {
      return {
        paymentStatus: row.payment_status,
        orderId: row.order_id ?? null,
        paymentId:
          row.payment_id != null ? String(row.payment_id) : ref,
        source: "payment",
      };
    }
  }

  const byInvoice = await fetchNowPaymentsJson(
    apiKey,
    `https://api.nowpayments.io/v1/payment/?invoiceid=${encodeURIComponent(ref)}&limit=10&sortBy=updated_at&orderBy=desc`
  );
  const fromInvoice = pickBestPaymentStatus(parseNowPaymentsPaymentList(byInvoice));
  if (fromInvoice) return fromInvoice;

  const invoice = await fetchNowPaymentsJson(
    apiKey,
    `https://api.nowpayments.io/v1/invoice/${encodeURIComponent(ref)}`
  );

  if (invoice && typeof invoice === "object" && invoice !== null) {
    const row = invoice as NowPaymentsPaymentRow;
    if (row.payment_status) {
      return {
        paymentStatus: row.payment_status,
        orderId: row.order_id ?? null,
        paymentId: null,
        source: "invoice",
      };
    }
  }

  return null;
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
