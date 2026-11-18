export type CheckoutCustomerInput = {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  /** US state, as a two-letter code or full name. */
  state?: string;
  shippingAddress?: string;
};

export type CheckoutResult = {
  orderId: string;
  total: number;
  subtotal: number;
  shipping: number;
  status: string;
  redirectUrl?: string;
  payment: {
    provider: string;
    status: string;
    paymentUrl?: string;
    transactionId?: string;
    message?: string;
    manualPending?: boolean;
  };
};
