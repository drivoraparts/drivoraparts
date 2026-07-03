export type CheckoutCustomerInput = {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
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
