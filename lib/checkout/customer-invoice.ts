import {
  sendAdminNewOrderEmail,
  sendOrderCreatedEmail,
  type OrderInvoiceLine,
} from "@/lib/email/send";
import { logActivity } from "@/lib/monitoring/activity";

export type CustomerInvoiceItem = {
  name: string;
  quantity: number;
  price: number;
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
  const lines: OrderInvoiceLine[] = input.items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.price,
  }));

  const sent = await sendOrderCreatedEmail({
    to: input.to,
    customerName: input.customerName,
    orderId: input.orderId,
    total: input.total,
    subtotal: input.subtotal,
    shipping: input.shipping,
    items: lines,
  });

  const adminSent = await sendAdminNewOrderEmail({
    orderId: input.orderId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    shippingAddress: input.shippingAddress,
    total: input.total,
    items: lines,
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
