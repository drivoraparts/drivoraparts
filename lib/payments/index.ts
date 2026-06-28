import {
  createOrderInvoice,
  getPaymentProvider,
  handleProviderWebhook,
  manualPaymentProvider,
  nowpaymentsPaymentProvider,
  type PaymentProvider,
} from "./provider";
import type {
  CreatePaymentSessionInput,
  PaymentProviderId,
  PaymentSessionResult,
  PaymentWebhookResult,
} from "./types";

const providers: PaymentProvider[] = [
  nowpaymentsPaymentProvider,
  manualPaymentProvider,
];

export {
  createOrderInvoice,
  getPaymentProvider,
  handleProviderWebhook,
  manualPaymentProvider,
  nowpaymentsPaymentProvider,
} from "./provider";
export type { InvoiceOrder, InvoiceResult } from "./provider";

export function getDefaultPaymentProvider(): PaymentProvider {
  return nowpaymentsPaymentProvider;
}

export async function createCheckoutPayment(
  input: CreatePaymentSessionInput,
  providerId?: PaymentProviderId
): Promise<PaymentSessionResult> {
  const invoice = await createOrderInvoice(
    {
      orderId: input.orderId,
      amount: input.amount,
      currency: input.currency,
      customerEmail: input.customerEmail,
    },
    providerId
  );

  const status =
    invoice.status === "failed"
      ? "failed"
      : invoice.provider === "manual" && invoice.status === "disabled"
        ? "pending"
        : "pending";

  return {
    provider: invoice.provider,
    paymentId: invoice.paymentId,
    status,
    paymentUrl: invoice.paymentUrl,
    transactionId: invoice.transactionId,
    message: invoice.message,
    manualPending:
      invoice.provider === "manual" && invoice.status === "disabled",
  };
}

export async function handlePaymentWebhook(
  providerId: PaymentProviderId,
  rawBody: string,
  headers: Headers
): Promise<PaymentWebhookResult | null> {
  const result = await handleProviderWebhook(providerId, rawBody, headers);
  if (!result) return null;

  return {
    orderId: result.orderId,
    paymentId: result.paymentId,
    status: result.status,
    providerPaymentId: result.providerPaymentId,
    duplicate: result.duplicate,
  };
}

export function listPaymentProviders(): PaymentProvider[] {
  return providers;
}
