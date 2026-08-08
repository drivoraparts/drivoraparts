import {
  sendAdminNewOrderEmail,
  sendOrderCreatedEmail,
} from "@/lib/email/send";
import { enrichOrderItemsForEmail } from "@/lib/email/order-summary";
import { logActivity } from "@/lib/monitoring/activity";

export type CustomerInvoiceItem = {
  productId: number;
  name: string;
  price: number;
  image: string | null;
  category: string | null;
  brand: string | null;
  quantity: number;
};

export async function emailCustomerOrderInvoice(input: {
  to: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  orderId: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  paymentUrl?: string;
  items: CustomerInvoiceItem[];
}): Promise<boolean> {
  const items = enrichOrderItemsForEmail(
    input.items.map((item) => ({
      product_id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      brand: item.brand,
      quantity: item.quantity,
    }))
  );

  const sent = await sendOrderCreatedEmail({
    to: input.to,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    shippingAddress: input.shippingAddress,
    orderId: input.orderId,
    total: input.total,
    shipping: input.shipping,
    items,
    paymentMethodLabel: "NOWPayments · Cryptocurrency",
  });

  const adminSent = await sendAdminNewOrderEmail({
    orderId: input.orderId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    shippingAddress: input.shippingAddress,
    total: input.total,
    shipping: input.shipping,
    items,
    paymentMethodLabel: "NOWPayments · Cryptocurrency",
  });

  if (!sent) {
    await logActivity("warn", "checkout.invoice_email_skipped", {
      orderId: input.orderId,
      reason: "RESEND_API_KEY not configured",
      hadPaymentUrl: Boolean(input.paymentUrl),
    });
  } else {
    await logActivity("info", "checkout.order_created_email_sent", {
      orderId: input.orderId,
      itemCount: input.items.length,
    });
  }

  if (!adminSent) {
    await logActivity("warn", "checkout.admin_order_email_skipped", {
      orderId: input.orderId,
      reason: "RESEND_API_KEY not configured",
    });
  } else {
    await logActivity("info", "checkout.admin_order_email_sent", {
      orderId: input.orderId,
    });
  }

  return sent;
}
