import { insertAnalyticsEvent } from "@/lib/db/analytics";

import { upsertCustomerByEmail } from "@/lib/db/customers";

import { hasInventory } from "@/lib/db/inventory";

import {

  createOrderRecord,

  failOrderIfUnpaid,

  finalizeOrderPaid,

  forceUpdateOrderStatus,

  getOrderById,
  claimConfirmationSend,

  transitionOrderStatus,

  type CreateOrderItemInput,

} from "@/lib/db/orders";

import {

  sendPaymentReceivedEmail,
  sendAdminPaymentConfirmedEmail,
  sendAdminNewOrderEmail,
  sendPaymentIncompleteEmail,

} from "@/lib/email/send";

import { sendMetaCapIPurchase } from "@/lib/analytics/meta-capi";

import { logError, logInfo, logWarn } from "@/lib/monitoring/logger";

import { logActivity } from "@/lib/monitoring/activity";

import { createCheckoutPayment } from "@/lib/payments";

import type { PaymentProviderId } from "@/lib/payments/types";

import { commitOrderInventory, restoreOrderInventory } from "@/lib/checkout/inventory-order";
import { lockOrderItemsFromCatalog } from "@/lib/checkout/validate-items";
import { processCheckoutWithoutSupabase } from "@/lib/checkout/offline";
import type { CheckoutCustomerInput, CheckoutResult } from "@/lib/checkout/types";
import { isSupabaseConfigured } from "@/lib/env";
import { findPaymentByOrderId, updatePaymentRecord } from "@/lib/db/payments";

export type { CheckoutCustomerInput, CheckoutResult } from "@/lib/checkout/types";



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

  if (!input.address?.trim() || input.address.length > 200) {
    throw new Error("Invalid address");
  }

  if (!input.city?.trim() || input.city.length > 120) {
    throw new Error("Invalid city");
  }

  if (!input.zip?.trim() || input.zip.length > 20) {
    throw new Error("Invalid ZIP code");
  }

  if (input.country && input.country.length > 120) {
    throw new Error("Invalid country");
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

  /** Which option the customer chose. Priced server-side, never client-sent. */
  shippingMethod?: "standard" | "express";

  freightClass?: string;

  shippingZone?: string;

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



  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Orders cannot be saved — Supabase is not configured on production. Add Supabase env vars in Cloudflare and redeploy."
      );
    }

    return processCheckoutWithoutSupabase({

      items: lockedItems,

      customer: input.customer,

      shipping: input.shipping,

      requestMeta: input.requestMeta,

    });

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



  const customer = await upsertCustomerByEmail({

    fullName: input.customer.fullName,

    email: input.customer.email,

    phone: input.customer.phone,

    shippingAddress: input.customer.shippingAddress,

  });



  const order = await createOrderRecord({

    customerId: customer.id,

    items: lockedItems,

    shipping: input.shipping ?? 0,

    shippingMethod: input.shippingMethod ?? "standard",

    freightClass: input.freightClass,

    shippingZone: input.shippingZone,

    customerEmail: customer.email,

    // Snapshot the address on the order itself. The customer record now

    // carries the latest address, so it cannot be used as the historical one.

    shipmentDestination: input.customer.shippingAddress,

  });



  for (const item of lockedItems) {

    const available = await hasInventory(item.productId, item.quantity);

    if (!available) {

      await transitionOrderStatus(order.id, "cancelled");

      throw new Error(`Stock changed during checkout for ${item.name}`);

    }

  }



  // No order_completed event here either. This ran before the invoice was
  // even created, so it counted a completion for every checkout that reached
  // this line -- and the storefront fired a second one of its own, meaning a
  // single unpaid checkout produced two "completed order" events. It is now
  // emitted once, from applyOrderPaidSideEffects, when payment is confirmed.



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



  // Reaching this point means an order and a NOWPayments invoice exist
  // ("pending") -- not that payment happened. That distinction is why the
  // CONFIRMATION emails still live elsewhere: sendPaymentReceivedEmail and
  // sendAdminPaymentConfirmedEmail fire from applyOrderPaidSideEffects()
  // below, which only runs once the webhook confirms payment (see
  // handlePaidWebhook / finalizeOrderPaid). What is sent here is the opposite
  // of a confirmation -- it says the money has not arrived.
  /*
   * Tell the store owner an order exists.
   *
   * The comment above is right that this is not a confirmation, and nothing
   * here tells the customer otherwise -- they still get no email until payment
   * lands. But "do not send a confirmation" had been implemented as "send
   * nothing at all", and the admin half of that was a mistake: with the
   * NOWPayments flow, an order that is never paid never reaches
   * applyOrderPaidSideEffects, so the owner was never told it happened. One
   * customer placed the same $9,756.50 order on 27 Aug, 29 Aug and 1 Sep and
   * nobody found out until the orders table was read by hand.
   *
   * The customer gets sendPaymentIncompleteEmail, NOT the receipt. An earlier
   * version of this block sent sendOrderCreatedEmail with a payment link, which
   * renders the two-page receipt-and-invoice document -- a reasonable thing to
   * send someone who has paid and a misleading thing to send someone who has
   * not. The receipt now belongs exclusively to confirmed payment, and is sent
   * from applyOrderPaidSideEffects.
   *
   * Its button points at /success?orderId=..., not at the raw NOWPayments
   * invoice, so the link keeps telling the truth: the page asks the server what
   * the payment is doing before it renders, and offers to resume the stored
   * invoice from there.
   *
   * Fire-and-forget: the order is already written, and a mail failure must
   * never cost an order that exists.
   */
  try {
    await sendPaymentIncompleteEmail({
      to: customer.email,
      customerName: customer.full_name,
      orderId: order.id,
      orderNumber: order.order_number,
      total: Number(order.total),
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        image: item.image,
      })),
    });
    await sendAdminNewOrderEmail({
      orderNumber: order.order_number,
      customerName: customer.full_name,
      customerEmail: customer.email,
      customerPhone: customer.phone ?? undefined,
      shippingAddress: input.customer.shippingAddress,
      total: Number(order.total),
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        image: item.image,
      })),
    });
  } catch (error) {
    logWarn("pending_order_email_failed", {
      orderId: order.id,
      message: error instanceof Error ? error.message : String(error),
    });
  }
  await logActivity("info", "checkout.order_pending_created", {
    orderId: order.id,
    itemCount: order.items.length,
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



  await applyOrderPaidSideEffects(orderId);

}



export async function adminMarkOrderPaid(orderId: string): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "paid") {
    await forceUpdateOrderStatus(orderId, "paid");
  }

  await applyOrderPaidSideEffects(orderId);
}



async function applyOrderPaidSideEffects(orderId: string): Promise<void> {
  await commitOrderInventory(orderId);

  const payment = await findPaymentByOrderId(orderId);

  if (payment && payment.status !== "paid") {

    await updatePaymentRecord(payment.id, {

      status: "paid",

      metadata: {

        ...(payment.metadata ?? {}),

        paid_at: new Date().toISOString(),

        payment_method:
          payment.provider === "nowpayments" ? "nowpayments" : "manual",

      },

    });

  }



  const updated = await getOrderById(orderId);

  /*
   * Record the completion here, where payment is actually confirmed.
   *
   * The storefront used to emit this the moment an invoice was created, so
   * every abandoned checkout counted as a completed order. Emitting from the
   * webhook means the event fires once, for money actually received, and
   * carries its line items so per-product reporting can attribute the sale.
   */
  if (updated) {
    try {
      await insertAnalyticsEvent("order_completed", {
        orderId: updated.id,
        orderNumber: updated.order_number,
        total: Number(updated.total),
        itemCount: updated.items.reduce((sum, item) => sum + item.quantity, 0),
        items: updated.items.map((item) => ({
          id: item.product_id,
          quantity: item.quantity,
        })),
      });
    } catch (error) {
      logWarn("order_completed_analytics_failed", {
        orderId,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /*
   * The receipt goes out once per order, ever.
   *
   * The webhook route already returns early on a duplicate delivery or an
   * order that is already paid, but that is a read-then-write check: two IPNs
   * arriving together can both pass it and both send a receipt.
   * claimConfirmationSend is the atomic version -- an UPDATE ... WHERE
   * confirmation_sent_at IS NULL that only one caller can win, whatever the
   * ordering.
   *
   * markConfirmationSent has existed for this since it was written and had no
   * callers, so nothing was using it and the guarantee it offers was never
   * actually in force.
   */
  const mayEmailReceipt = updated?.customer
    ? await claimConfirmationSend(orderId)
    : false;

  if (updated?.customer && mayEmailReceipt) {

    await sendPaymentReceivedEmail({

      to: updated.customer.email,

      customerName: updated.customer.full_name,

      orderNumber: updated.order_number,

      total: Number(updated.total),

      items: updated.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        image: item.image,
      })),
      subtotal: Number(updated.subtotal),
      shipping: Number(updated.shipping),

    });

    await sendAdminPaymentConfirmedEmail({
      orderNumber: updated.order_number,
      customerName: updated.customer.full_name,
      customerEmail: updated.customer.email,
      customerPhone: updated.customer.phone ?? undefined,
      shippingAddress: updated.customer.shipping_address ?? undefined,
      total: Number(updated.total),
      items: updated.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        image: item.image,
      })),
      transactionId: payment?.provider_payment_id ?? undefined,
    });

  }

  // Server-side Purchase for Meta — fires even when the buyer stays on NOWPayments
  // and never returns to /success (browser pixel cannot track the payment page).
  if (updated) {
    try {
      await sendMetaCapIPurchase({
        orderId,
        value: Number(updated.total),
        email: updated.customer?.email ?? null,
        phone: updated.customer?.phone ?? null,
        items: updated.items.map((item) => ({
          id: item.product_id,
          quantity: item.quantity,
          item_price: Number(item.price),
        })),
      });
    } catch (error) {
      logError("meta_capi_side_effect_failed", error, { orderId });
    }
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

  await restoreOrderInventory(orderId);



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


