export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentProviderId = "manual" | "nowpayments";

export type CreatePaymentSessionInput = {
  orderId: string;
  amount: number;
  currency?: string;
  customerEmail: string;
  /** For the manual provider: which method the customer picked. */
  manualMethod?: string;
  /** For methods that require one (Bank Transfer): the chosen bank/route. */
  manualRoute?: string;
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
