import { insertAnalyticsEvent } from "@/lib/db/analytics";

import { createCustomer } from "@/lib/db/customers";

import { hasInventory, reduceInventory } from "@/lib/db/inventory";

import {

  createOrderRecord,

  failOrderIfUnpaid,

  finalizeOrderPaid,

  getOrderById,

  transitionOrderStatus,

  type CreateOrderItemInput,

} from "@/lib/db/orders";

import {

  sendOrderReceivedEmail,

  sendPaymentReceivedEmail,

} from "@/lib/email/send";

import { logError, logInfo, logWarn } from "@/lib/monitoring/logger";

import { logActivity } from "@/lib/monitoring/activity";

import { createCheckoutPayment } from "@/lib/payments";

import type { PaymentProviderId } from "@/lib/payments/types";

import { lockOrderItemsFromCatalog } from "@/lib/checkout/validate-items";

import { findPaymentByOrderId, updatePaymentRecord } from "@/lib/db/payments";



export type CheckoutCustomerInput = {

  fullName: string;

  email: string;

  phone?: string;

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



const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



function validateCustomer(input: CheckoutCustomerInput): void {

  if (!input.fullName.trim() || input.fullName.length > 120) {

    throw new Error("Invalid customer name");

  }



  if (!EMAIL_PATTERN.test(input.email) || input.email.length > 254) {

    throw new Error("Invalid customer email");

  }



  if (input.phone && input.phone.length > 40) {

    throw new Error("Invalid phone number");

  }



  if (input.shippingAddress && input.shippingAddress.length > 500) {

    throw new Error("Invalid shipping address");

  }

}



export async function processCheckout(input: {

  items: CreateOrderItemInput[];

  customer: CheckoutCustomerInput;

  providerId?: PaymentProviderId;

  shipping?: number;

  requestMeta?: Record<string, unknown>;

}): Promise<CheckoutResult> {

  validateCustomer(input.customer);



  const lockedItems = lockOrderItemsFromCatalog(

    input.items.map((item) => ({

      productId: item.productId,

      quantity: item.quantity,

    }))

  );



  if (!lockedItems.length) {

    throw new Error("Cart is empty");

  }



  logInfo("checkout_attempt", {

    itemCount: lockedItems.length,

    email: input.customer.email,

    ...input.requestMeta,

  });



  for (const item of lockedItems) {

    const available = await hasInventory(item.productId, item.quantity);

    if (!available) {

      logWarn("checkout_stock_denied", {

        productId: item.productId,

        name: item.name,

        ...input.requestMeta,

      });

      throw new Error(`Insufficient stock for ${item.name}`);

    }

  }



  const customer = await createCustomer({

    fullName: input.customer.fullName,

    email: input.customer.email,

    phone: input.customer.phone,

    shippingAddress: input.customer.shippingAddress,

  });



  const order = await createOrderRecord({

    customerId: customer.id,

    items: lockedItems,

    shipping: input.shipping ?? 0,

  });



  for (const item of lockedItems) {

    const reduced = await reduceInventory(item.productId, item.quantity);

    if (!reduced) {

      await transitionOrderStatus(order.id, "failed");

      throw new Error(`Stock changed during checkout for ${item.name}`);

    }

  }



  await insertAnalyticsEvent("order_completed", {

    orderId: order.id,

    total: order.total,

    itemCount: lockedItems.reduce((sum, item) => sum + item.quantity, 0),

    products: lockedItems.map((item) => ({

      productId: item.productId,

      productName: item.name,

      quantity: item.quantity,

      price: item.price,

    })),

  });



  const payment = await createCheckoutPayment(

    {

      orderId: order.id,

      amount: Number(order.total),

      customerEmail: customer.email,

    },

    input.providerId

  );



  await logActivity("info", "checkout.payment_attached", {

    orderId: order.id,

    provider: payment.provider,

    transactionId: payment.transactionId,

    hasPaymentUrl: Boolean(payment.paymentUrl),

    manualPending: payment.manualPending ?? false,

  });



  await sendOrderReceivedEmail({

    to: customer.email,

    customerName: customer.full_name,

    orderId: order.id,

    total: Number(order.total),

  });



  logInfo("checkout_completed", {

    orderId: order.id,

    provider: payment.provider,

    total: order.total,

    ...input.requestMeta,

  });



  const redirectUrl = payment.paymentUrl;



  return {

    orderId: order.id,

    total: Number(order.total),

    subtotal: Number(order.subtotal),

    shipping: Number(order.shipping),

    status: order.status,

    redirectUrl,

    payment: {

      provider: payment.provider,

      status: payment.manualPending ? "manual_pending" : payment.status,

      paymentUrl: payment.paymentUrl,

      transactionId: payment.transactionId,

      message: payment.message,

      manualPending: payment.manualPending,

    },

  };

}



export async function markOrderPaid(orderId: string): Promise<void> {

  // Atomic compare-and-set: only ONE concurrent/duplicate webhook wins this
  // transition. A null result means the order was already paid (or not in a
  // payable state) — an idempotent no-op, so we skip all paid side-effects.

  const transitioned = await finalizeOrderPaid(orderId);

  if (!transitioned) {

    await logActivity("warn", "payment.mark_paid_noop", { orderId });

    return;

  }



  const payment = await findPaymentByOrderId(orderId);

  if (payment && payment.status !== "paid") {

    await updatePaymentRecord(payment.id, {

      status: "paid",

      metadata: {

        ...(payment.metadata ?? {}),

        paid_at: new Date().toISOString(),

        payment_method: payment.provider === "cryptomus" ? "cryptomus" : "manual",

      },

    });

  }



  const updated = await getOrderById(orderId);

  if (updated?.customer) {

    await sendPaymentReceivedEmail({

      to: updated.customer.email,

      customerName: updated.customer.full_name,

      orderId,

      total: Number(updated.total),

    });

  }



  await logActivity("info", "payment.verified_success", { orderId });

  logInfo("payment_paid", { orderId });

}



export async function markOrderFailed(orderId: string): Promise<void> {

  // Atomic + non-clobbering: never overwrite a paid order, and stay idempotent
  // for duplicate failure webhooks.

  const failed = await failOrderIfUnpaid(orderId);

  if (!failed) {

    await logActivity("warn", "payment.mark_failed_noop", { orderId });

    return;

  }



  const payment = await findPaymentByOrderId(orderId);

  if (payment && payment.status !== "failed" && payment.status !== "paid") {

    await updatePaymentRecord(payment.id, { status: "failed" });

  }



  await logActivity("warn", "payment.verified_failed", { orderId });

  logWarn("payment_failed", { orderId });

}



export async function handlePaidWebhook(

  orderId: string,

  options?: { duplicate?: boolean }

): Promise<void> {

  if (options?.duplicate) {

    await logActivity("warn", "payment.webhook_duplicate", { orderId });

    return;

  }



  try {

    const order = await getOrderById(orderId);

    if (order?.status === "paid") {

      await logActivity("warn", "payment.webhook_duplicate", { orderId });

      return;

    }



    await markOrderPaid(orderId);

  } catch (error) {

    await logActivity("error", "payment.verification_failed", {

      orderId,

      message: error instanceof Error ? error.message : String(error),

    });

    logError("payment_webhook_failed", error, { orderId });

    throw error;

  }

}


