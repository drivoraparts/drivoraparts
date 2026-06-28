import { getEmailFrom, getResendApiKey, getSiteUrl } from "@/lib/env";
import { logError } from "@/lib/monitoring/logger";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not configured — skipping send", payload.subject);
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getEmailFrom(),
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      logError("email_send_failed", new Error(text), { subject: payload.subject });
      return false;
    }

    return true;
  } catch (error) {
    logError("email_send_error", error, { subject: payload.subject });
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(content: string): string {
  return `
    <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:32px;">
      <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #333;border-radius:12px;padding:24px;">
        <p style="color:#ef4444;font-size:12px;letter-spacing:2px;text-transform:uppercase;">DrivoraParts</p>
        ${content}
        <p style="margin-top:24px;font-size:12px;color:#888;">${getSiteUrl()}</p>
      </div>
    </div>
  `;
}

export type OrderInvoiceLine = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export async function sendOrderInvoiceEmail(input: {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
  paymentUrl: string;
  items: OrderInvoiceLine[];
}): Promise<boolean> {
  const rows = input.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #333;color:#e5e5e5;">${escapeHtml(item.name)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #333;color:#e5e5e5;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #333;color:#e5e5e5;text-align:right;">$${(item.unitPrice * item.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join("");

  return sendEmail({
    to: input.to,
    subject: `Your invoice — Order ${input.orderId.slice(0, 8).toUpperCase()}`,
    html: layout(`
      <h1 style="font-size:22px;">Your order invoice</h1>
      <p>Hi ${escapeHtml(input.customerName)},</p>
      <p>We created your order and payment invoice. Complete checkout with crypto using the button below.</p>
      <p><strong>Order ID:</strong> ${escapeHtml(input.orderId)}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
        <thead>
          <tr>
            <th align="left" style="color:#888;padding-bottom:8px;">Item</th>
            <th style="color:#888;padding-bottom:8px;">Qty</th>
            <th align="right" style="color:#888;padding-bottom:8px;">Line total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-size:18px;margin-top:16px;"><strong>Total due: $${input.total.toFixed(2)} USD</strong></p>
      <p style="margin:28px 0;text-align:center;">
        <a href="${input.paymentUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Pay now with crypto</a>
      </p>
      <p style="font-size:12px;color:#888;">If you already paid on the payment page, you can ignore this email. We will email you again when payment is confirmed.</p>
    `),
  });
}

export async function sendOrderReceivedEmail(input: {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
}): Promise<boolean> {
  return sendEmail({
    to: input.to,
    subject: `Order received — ${input.orderId.slice(0, 8).toUpperCase()}`,
    html: layout(`
      <h1 style="font-size:22px;">Thanks, ${input.customerName}!</h1>
      <p>We received your order <strong>${input.orderId}</strong>.</p>
      <p>Total: <strong>$${input.total.toFixed(2)}</strong></p>
      <p>We will notify you when payment is confirmed.</p>
    `),
  });
}

export async function sendPaymentReceivedEmail(input: {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
}): Promise<boolean> {
  return sendEmail({
    to: input.to,
    subject: `Payment confirmed — Order ${input.orderId.slice(0, 8).toUpperCase()}`,
    html: layout(`
      <h1 style="font-size:22px;">Payment received</h1>
      <p>Hi ${input.customerName}, payment for order <strong>${input.orderId}</strong> is confirmed.</p>
      <p>Amount: <strong>$${input.total.toFixed(2)}</strong></p>
      <p>Your order is now being processed.</p>
    `),
  });
}

export async function sendOrderShippedEmail(input: {
  to: string;
  customerName: string;
  orderId: string;
}): Promise<boolean> {
  return sendEmail({
    to: input.to,
    subject: `Your order has shipped — ${input.orderId.slice(0, 8).toUpperCase()}`,
    html: layout(`
      <h1 style="font-size:22px;">Order shipped</h1>
      <p>Hi ${input.customerName}, order <strong>${input.orderId}</strong> is on its way.</p>
      <p>Tracking details will follow if applicable.</p>
    `),
  });
}

export async function sendOrderDeliveredEmail(input: {
  to: string;
  customerName: string;
  orderId: string;
}): Promise<boolean> {
  return sendEmail({
    to: input.to,
    subject: `Order delivered — ${input.orderId.slice(0, 8).toUpperCase()}`,
    html: layout(`
      <h1 style="font-size:22px;">Delivered</h1>
      <p>Hi ${input.customerName}, order <strong>${input.orderId}</strong> has been marked delivered.</p>
      <p>Thank you for choosing DrivoraParts.</p>
    `),
  });
}
