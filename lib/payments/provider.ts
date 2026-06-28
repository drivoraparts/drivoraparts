import {
  createPaymentRecord,
  findPaymentByOrderId,
  updatePaymentRecord,
} from "@/lib/db/payments";
import { logActivity } from "@/lib/monitoring/activity";
import {
  mapNowPaymentsPaymentStatus,
  parseNowPaymentsWebhookPayload,
  resolveNowPaymentsCheckoutUrl,
  verifyNowPaymentsWebhookSignature,
} from "@/lib/payments/nowpayments/client";
import { isSupabaseConfigured } from "@/lib/env";
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

async function createStaticNowPaymentsInvoice(
  order: InvoiceOrder
): Promise<InvoiceResult> {
  const checkout = await resolveNowPaymentsCheckoutUrl({
    orderId: order.orderId,
    amount: order.amount,
    currency: order.currency,
    customerEmail: order.customerEmail,
  });

  let paymentId = `offline-${order.orderId}`;

  if (isSupabaseConfigured()) {
    const payment = await createPaymentRecord({
      orderId: order.orderId,
      provider: "nowpayments",
      amount: order.amount,
      currency: order.currency ?? "USD",
      status: "pending",
      paymentUrl: checkout.paymentUrl,
      providerPaymentId: checkout.transactionId,
      metadata: {
        customerEmail: order.customerEmail,
        payment_method: "nowpayments",
        mode: checkout.mode,
        invoice_id: checkout.transactionId,
      },
    });
    paymentId = payment.id;
  }

  await logActivity("info", "nowpayments.static_invoice_created", {
    orderId: order.orderId,
    invoiceId: checkout.transactionId,
    mode: checkout.mode,
  });

  return {
    provider: "nowpayments",
    paymentId,
    paymentUrl: checkout.paymentUrl,
    transactionId: checkout.transactionId,
    status: "pending",
  };
}

export const nowpaymentsPaymentProvider: PaymentProvider = {
  id: "nowpayments",

  isEnabled(): boolean {
    return true;
  },

  async createInvoice(order: InvoiceOrder): Promise<InvoiceResult> {
    if (isSupabaseConfigured()) {
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
    }

    return createStaticNowPaymentsInvoice(order);
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

  return nowpaymentsPaymentProvider.createInvoice(order);
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
