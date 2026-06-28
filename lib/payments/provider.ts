import {
  createPaymentRecord,
  findPaymentByOrderId,
  updatePaymentRecord,
} from "@/lib/db/payments";
import { logActivity } from "@/lib/monitoring/activity";
import {
  buildCryptomusUrls,
  createCryptomusInvoice,
  isCryptomusConfigured,
  mapCryptomusPaymentStatus,
  parseCryptomusWebhookPayload,
  verifyCryptomusWebhookSignature,
} from "@/lib/payments/cryptomus/client";
import {
  buildNowPaymentsUrls,
  createNowPaymentsInvoice,
  isNowPaymentsConfigured,
  mapNowPaymentsPaymentStatus,
  parseNowPaymentsWebhookPayload,
  verifyNowPaymentsWebhookSignature,
} from "@/lib/payments/nowpayments/client";
import type { PaymentProviderId, PaymentStatus } from "./types";

export type InvoiceOrder = {
  orderId: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
};

export type InvoiceResult = {
  provider: PaymentProviderId;
  paymentId: string;
  paymentUrl?: string;
  transactionId?: string;
  status: "pending" | "disabled" | "failed";
  message?: string;
};

export type WebhookHandleResult = {
  orderId: string;
  paymentId: string;
  status: PaymentStatus;
  providerPaymentId?: string;
  duplicate?: boolean;
};

export interface PaymentProvider {
  id: PaymentProviderId;
  isEnabled(): boolean;
  createInvoice(order: InvoiceOrder): Promise<InvoiceResult>;
  handleWebhook?(
    rawBody: string,
    headers: Headers
  ): Promise<WebhookHandleResult | null>;
}

export const nowpaymentsPaymentProvider: PaymentProvider = {
  id: "nowpayments",

  isEnabled(): boolean {
    return isNowPaymentsConfigured();
  },

  async createInvoice(order: InvoiceOrder): Promise<InvoiceResult> {
    if (!this.isEnabled()) {
      return {
        provider: "nowpayments",
        paymentId: "",
        status: "disabled",
        message: "NOWPayments is not configured",
      };
    }

    const existing = await findPaymentByOrderId(order.orderId);
    if (existing?.payment_url) {
      return {
        provider: "nowpayments",
        paymentId: existing.id,
        paymentUrl: existing.payment_url,
        transactionId: existing.provider_payment_id ?? undefined,
        status: "pending",
      };
    }

    const urls = buildNowPaymentsUrls(order.orderId);
    const invoice = await createNowPaymentsInvoice({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      callbackUrl: urls.callbackUrl,
      successUrl: urls.successUrl,
      cancelUrl: urls.cancelUrl,
    });

    if (invoice.ok === false) {
      const payment = await createPaymentRecord({
        orderId: order.orderId,
        provider: "nowpayments",
        amount: order.amount,
        currency: order.currency ?? "USD",
        status: "failed",
        metadata: {
          error: invoice.error,
          customerEmail: order.customerEmail,
        },
      });

      return {
        provider: "nowpayments",
        paymentId: payment.id,
        status: "failed",
        message: invoice.error,
      };
    }

    const payment = await createPaymentRecord({
      orderId: order.orderId,
      provider: "nowpayments",
      amount: order.amount,
      currency: order.currency ?? "USD",
      status: "pending",
      paymentUrl: invoice.paymentUrl,
      providerPaymentId: invoice.invoiceId,
      metadata: {
        customerEmail: order.customerEmail,
        payment_method: "nowpayments",
        invoice_id: invoice.invoiceId,
      },
    });

    return {
      provider: "nowpayments",
      paymentId: payment.id,
      paymentUrl: invoice.paymentUrl,
      transactionId: invoice.invoiceId,
      status: "pending",
    };
  },

  async handleWebhook(
    rawBody: string,
    headers: Headers
  ): Promise<WebhookHandleResult | null> {
    const signature = headers.get("x-nowpayments-sig");
    if (!verifyNowPaymentsWebhookSignature(rawBody, signature)) {
      await logActivity("warn", "nowpayments.webhook_invalid_signature", {});
      return null;
    }

    const payload = parseNowPaymentsWebhookPayload(rawBody);
    if (!payload?.order_id) {
      await logActivity("warn", "nowpayments.webhook_invalid_payload", {});
      return null;
    }

    await logActivity("info", "nowpayments.webhook_received", {
      orderId: payload.order_id,
      providerStatus: payload.payment_status,
      invoiceId: payload.invoice_id,
      paymentId: payload.payment_id,
    });

    const mappedStatus = mapNowPaymentsPaymentStatus(payload);
    const existing = await findPaymentByOrderId(payload.order_id);

    if (existing?.status === "paid" && mappedStatus === "paid") {
      await logActivity("warn", "nowpayments.webhook_duplicate", {
        orderId: payload.order_id,
        paymentId: existing.id,
      });
      return {
        orderId: payload.order_id,
        paymentId: existing.id,
        status: "paid",
        providerPaymentId:
          payload.invoice_id != null
            ? String(payload.invoice_id)
            : existing.provider_payment_id ?? undefined,
        duplicate: true,
      };
    }

    if (existing) {
      const paidAt =
        mappedStatus === "paid" ? new Date().toISOString() : undefined;
      const providerPaymentId =
        payload.invoice_id != null
          ? String(payload.invoice_id)
          : payload.payment_id != null
            ? String(payload.payment_id)
            : existing.provider_payment_id;

      await updatePaymentRecord(existing.id, {
        status: mappedStatus,
        provider_payment_id: providerPaymentId,
        metadata: {
          ...(existing.metadata ?? {}),
          payment_method: "nowpayments",
          invoice_id: providerPaymentId,
          ...(paidAt ? { paid_at: paidAt } : {}),
          lastWebhookStatus: payload.payment_status,
        },
      });
    }

    return {
      orderId: payload.order_id,
      paymentId: existing?.id ?? "",
      status: mappedStatus,
      providerPaymentId:
        payload.invoice_id != null
          ? String(payload.invoice_id)
          : payload.payment_id != null
            ? String(payload.payment_id)
            : undefined,
    };
  },
};

export const cryptomusPaymentProvider: PaymentProvider = {
  id: "cryptomus",

  isEnabled(): boolean {
    return isCryptomusConfigured();
  },

  async createInvoice(order: InvoiceOrder): Promise<InvoiceResult> {
    if (!this.isEnabled()) {
      return {
        provider: "cryptomus",
        paymentId: "",
        status: "disabled",
        message: "Cryptomus is not configured",
      };
    }

    const existing = await findPaymentByOrderId(order.orderId);
    if (existing?.payment_url) {
      return {
        provider: "cryptomus",
        paymentId: existing.id,
        paymentUrl: existing.payment_url,
        transactionId: existing.provider_payment_id ?? undefined,
        status: "pending",
      };
    }

    const urls = buildCryptomusUrls(order.orderId);
    const invoice = await createCryptomusInvoice({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      callbackUrl: urls.callbackUrl,
      successUrl: urls.successUrl,
      failUrl: urls.failUrl,
    });

    if (invoice.ok === false) {
      const payment = await createPaymentRecord({
        orderId: order.orderId,
        provider: "cryptomus",
        amount: order.amount,
        currency: order.currency ?? "USD",
        status: "failed",
        metadata: {
          error: invoice.error,
          customerEmail: order.customerEmail,
        },
      });

      return {
        provider: "cryptomus",
        paymentId: payment.id,
        status: "failed",
        message: invoice.error,
      };
    }

    const payment = await createPaymentRecord({
      orderId: order.orderId,
      provider: "cryptomus",
      amount: order.amount,
      currency: order.currency ?? "USD",
      status: "pending",
      paymentUrl: invoice.paymentUrl,
      providerPaymentId: invoice.transactionId,
      metadata: {
        customerEmail: order.customerEmail,
        payment_method: "cryptomus",
        transaction_id: invoice.transactionId,
      },
    });

    return {
      provider: "cryptomus",
      paymentId: payment.id,
      paymentUrl: invoice.paymentUrl,
      transactionId: invoice.transactionId,
      status: "pending",
    };
  },

  async handleWebhook(
    rawBody: string,
    headers: Headers
  ): Promise<WebhookHandleResult | null> {
    const sign = headers.get("sign");
    if (!verifyCryptomusWebhookSignature(rawBody, sign)) {
      await logActivity("warn", "cryptomus.webhook_invalid_signature", {});
      return null;
    }

    const payload = parseCryptomusWebhookPayload(rawBody);
    if (!payload?.order_id) {
      await logActivity("warn", "cryptomus.webhook_invalid_payload", {});
      return null;
    }

    await logActivity("info", "cryptomus.webhook_received", {
      orderId: payload.order_id,
      providerStatus: payload.status ?? payload.payment_status,
      transactionId: payload.uuid,
    });

    const mappedStatus = mapCryptomusPaymentStatus(payload);
    const existing = await findPaymentByOrderId(payload.order_id);

    if (existing?.status === "paid" && mappedStatus === "paid") {
      await logActivity("warn", "cryptomus.webhook_duplicate", {
        orderId: payload.order_id,
        paymentId: existing.id,
      });
      return {
        orderId: payload.order_id,
        paymentId: existing.id,
        status: "paid",
        providerPaymentId: payload.uuid ?? existing.provider_payment_id ?? undefined,
        duplicate: true,
      };
    }

    if (existing) {
      const paidAt =
        mappedStatus === "paid" ? new Date().toISOString() : undefined;

      await updatePaymentRecord(existing.id, {
        status: mappedStatus,
        provider_payment_id: payload.uuid ?? existing.provider_payment_id,
        metadata: {
          ...(existing.metadata ?? {}),
          payment_method: "cryptomus",
          transaction_id: payload.uuid ?? existing.provider_payment_id,
          ...(paidAt ? { paid_at: paidAt } : {}),
          lastWebhookStatus: payload.status ?? payload.payment_status,
        },
      });
    }

    return {
      orderId: payload.order_id,
      paymentId: existing?.id ?? "",
      status: mappedStatus,
      providerPaymentId: payload.uuid,
    };
  },
};

export const manualPaymentProvider: PaymentProvider = {
  id: "manual",

  isEnabled(): boolean {
    return true;
  },

  async createInvoice(order: InvoiceOrder): Promise<InvoiceResult> {
    const payment = await createPaymentRecord({
      orderId: order.orderId,
      provider: "manual",
      amount: order.amount,
      currency: order.currency ?? "USD",
      status: "pending",
      metadata: {
        customerEmail: order.customerEmail,
        mode: "manual_pending",
        payment_method: "manual",
      },
    });

    await logActivity("info", "payment.manual_pending", {
      orderId: order.orderId,
      paymentId: payment.id,
    });

    return {
      provider: "manual",
      paymentId: payment.id,
      status: "disabled",
      message:
        "Order received. Complete payment instructions will be emailed.",
    };
  },
};

const providers: PaymentProvider[] = [
  nowpaymentsPaymentProvider,
  cryptomusPaymentProvider,
  manualPaymentProvider,
];

export function getPaymentProvider(id: PaymentProviderId): PaymentProvider {
  const provider = providers.find((entry) => entry.id === id);
  if (!provider) throw new Error(`Unknown payment provider: ${id}`);
  return provider;
}

export async function createOrderInvoice(
  order: InvoiceOrder,
  preferredProvider?: PaymentProviderId
): Promise<InvoiceResult> {
  if (preferredProvider === "manual") {
    return manualPaymentProvider.createInvoice(order);
  }

  if (preferredProvider === "nowpayments") {
    return nowpaymentsPaymentProvider.createInvoice(order);
  }

  if (preferredProvider === "cryptomus") {
    return cryptomusPaymentProvider.createInvoice(order);
  }

  if (nowpaymentsPaymentProvider.isEnabled()) {
    const result = await nowpaymentsPaymentProvider.createInvoice(order);
    if (result.status !== "disabled" && result.status !== "failed") {
      return result;
    }

    await logActivity("warn", "payment.nowpayments_fallback", {
      orderId: order.orderId,
      reason: result.message ?? result.status,
    });
  }

  if (cryptomusPaymentProvider.isEnabled()) {
    const result = await cryptomusPaymentProvider.createInvoice(order);
    if (result.status !== "disabled" && result.status !== "failed") {
      return result;
    }

    await logActivity("warn", "payment.cryptomus_fallback", {
      orderId: order.orderId,
      reason: result.message ?? result.status,
    });
  }

  return manualPaymentProvider.createInvoice(order);
}

export async function handleProviderWebhook(
  providerId: PaymentProviderId,
  rawBody: string,
  headers: Headers
): Promise<WebhookHandleResult | null> {
  const provider = getPaymentProvider(providerId);
  if (!provider.handleWebhook) return null;
  return provider.handleWebhook(rawBody, headers);
}
