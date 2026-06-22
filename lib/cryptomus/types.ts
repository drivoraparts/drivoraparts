export type CryptomusPaymentStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "expired";

export type CryptomusPaymentRecord = {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: CryptomusPaymentStatus;
  paymentUrl?: string;
  uuid?: string;
  createdAt: number;
  updatedAt: number;
};

export type CryptomusInvoiceResponse = {
  enabled: boolean;
  paymentUrl?: string;
  uuid?: string;
  orderId: string;
  message?: string;
};

export type CryptomusConfig = {
  enabled: boolean;
  merchantId?: string;
  apiKey?: string;
  callbackUrl?: string;
  returnUrl?: string;
};
