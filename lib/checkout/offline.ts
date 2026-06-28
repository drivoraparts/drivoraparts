import { emailCustomerOrderInvoice } from "@/lib/checkout/customer-invoice";
import { calculateCartDiscounts } from "@/lib/inventory/discounts";
import { products } from "@/lib/inventory/products";
import { logInfo } from "@/lib/monitoring/logger";
import { logActivity } from "@/lib/monitoring/activity";
import { createAutoOrderInvoice } from "@/lib/payments/nowpayments/client";
import type { CreateOrderItemInput } from "@/lib/db/orders";
import type { CheckoutCustomerInput, CheckoutResult } from "@/lib/checkout/types";

function generateOfflineOrderId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `DP-${stamp}-${suffix}`;
}

function hasCatalogStock(productId: number, quantity: number): boolean {
  const product = products.find((entry) => entry.id === productId);
  if (!product || product.stock === false) return false;
  return (product.stockQty ?? 10) >= quantity;
}

export async function processCheckoutWithoutSupabase(input: {
  items: CreateOrderItemInput[];
  customer: CheckoutCustomerInput;
  shipping?: number;
  requestMeta?: Record<string, unknown>;
}): Promise<CheckoutResult> {
  const lockedItems = input.items;
  const shipping = input.shipping ?? 0;

  for (const item of lockedItems) {
    if (!hasCatalogStock(item.productId, item.quantity)) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  const breakdown = calculateCartDiscounts(
    lockedItems.map((item) => ({
      id: item.productId,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
    })),
    shipping
  );

  const orderId = generateOfflineOrderId();

  logInfo("checkout_offline_attempt", {
    orderId,
    itemCount: lockedItems.length,
    email: input.customer.email,
    total: breakdown.total,
    ...input.requestMeta,
  });

  const checkout = await createAutoOrderInvoice({
    orderId,
    amount: breakdown.total,
    customerEmail: input.customer.email,
  });

  await logActivity("info", "checkout.offline_completed", {
    orderId,
    paymentMode: checkout.mode,
    hasPaymentUrl: Boolean(checkout.paymentUrl),
    ...input.requestMeta,
  });

  await emailCustomerOrderInvoice({
    to: input.customer.email,
    customerName: input.customer.fullName,
    orderId,
    total: breakdown.total,
    paymentUrl: checkout.paymentUrl,
    items: lockedItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  });

  return {
    orderId,
    total: breakdown.total,
    subtotal: breakdown.merchandiseTotal,
    shipping,
    status: "pending",
    redirectUrl: checkout.paymentUrl,
    payment: {
      provider: "nowpayments",
      status: "pending",
      paymentUrl: checkout.paymentUrl,
      transactionId: checkout.transactionId,
      message:
        checkout.mode === "static_invoice_link"
          ? "Complete payment on the NOWPayments page."
          : undefined,
    },
  };
}
