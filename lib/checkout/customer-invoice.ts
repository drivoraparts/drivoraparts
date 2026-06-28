import {
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
  orderId: string;
  total: number;
  paymentUrl?: string;
  items: CustomerInvoiceItem[];
}): Promise<boolean> {
  const lines: OrderInvoiceLine[] = input.items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.price,
  }));

  let sent = false;

  sent = await sendOrderCreatedEmail({
    to: input.to,
    customerName: input.customerName,
    orderId: input.orderId,
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

  return sent;
}
