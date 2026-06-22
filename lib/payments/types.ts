export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentProviderId = "manual" | "cryptomus";

export type CreatePaymentSessionInput = {
  orderId: string;
  amount: number;
  currency?: string;
  customerEmail: string;
};

export type PaymentSessionResult = {
  provider: PaymentProviderId;
  paymentId: string;
  status: PaymentStatus;
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
  manualPending?: boolean;
};

export type PaymentWebhookResult = {
  orderId: string;
  paymentId: string;
  status: PaymentStatus;
  providerPaymentId?: string;
  duplicate?: boolean;
};
