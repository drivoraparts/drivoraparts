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

function formatOrderRef(orderId: string): string {
  return orderId.slice(0, 8).toUpperCase();
}

function layout(content: string, preheader = ""): string {
  const siteUrl = getSiteUrl();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DrivoraParts</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#111111;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 16px;border-bottom:1px solid #2a2a2a;">
              <p style="margin:0;color:#ef4444;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">DrivoraParts</p>
              <p style="margin:8px 0 0;font-size:13px;color:#a3a3a3;">Performance parts · Secure checkout</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;border-top:1px solid #2a2a2a;background:#0d0d0d;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#737373;">
                Questions about your order? Reply to this email or visit
                <a href="${siteUrl}/contact" style="color:#ef4444;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function receiptLayout(content: string, preheader = ""): string {
  const siteUrl = getSiteUrl();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DrivoraParts</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;color:#111827;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:28px 28px 16px;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;color:#dc2626;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">DrivoraParts</p>
              <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Invoice & receipt</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;border-top:1px solid #e5e7eb;background:#f9fafb;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
                Questions about your order? Reply to this email or visit
                <a href="${siteUrl}/contact" style="color:#dc2626;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type OrderInvoiceLine = {
  name: string;
  quantity: number;
  unitPrice: number;
};

function renderOrderLinesRows(items: OrderInvoiceLine[]): string {
  return items
    .map(
      (item) => `
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid #262626;color:#f5f5f5;font-size:14px;">${escapeHtml(item.name)}</td>
            <td style="padding:14px 8px;border-bottom:1px solid #262626;color:#d4d4d4;font-size:14px;text-align:center;">${item.quantity}</td>
            <td style="padding:14px 0;border-bottom:1px solid #262626;color:#f5f5f5;font-size:14px;text-align:right;">$${(item.unitPrice * item.quantity).toFixed(2)}</td>
          </tr>`
    )
    .join("");
}

function renderOrderLinesTable(items: OrderInvoiceLine[]): string {
  return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 8px;">
        <thead>
          <tr>
            <th align="left" style="padding:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#737373;">Item</th>
            <th style="padding:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#737373;">Qty</th>
            <th align="right" style="padding:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#737373;">Amount</th>
          </tr>
        </thead>
        <tbody>${renderOrderLinesRows(items)}</tbody>
      </table>`;
}

function renderOrderTotalRow(total: number, label: string): string {
  return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
        <tr>
          <td style="padding-top:12px;border-top:2px solid #2a2a2a;font-size:18px;font-weight:700;color:#ffffff;">${label}</td>
          <td align="right" style="padding-top:12px;border-top:2px solid #2a2a2a;font-size:18px;font-weight:700;color:#ffffff;">$${total.toFixed(2)} USD</td>
        </tr>
      </table>`;
}

function renderReceiptLinesRows(items: OrderInvoiceLine[]): string {
  return items
    .map(
      (item) => `
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">${escapeHtml(item.name)}</td>
            <td style="padding:14px 8px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;text-align:center;">${item.quantity}</td>
            <td style="padding:14px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;text-align:right;">$${(item.unitPrice * item.quantity).toFixed(2)}</td>
          </tr>`
    )
    .join("");
}

function renderReceiptLinesTable(items: OrderInvoiceLine[]): string {
  return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 8px;">
        <thead>
          <tr>
            <th align="left" style="padding:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Item</th>
            <th style="padding:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Qty</th>
            <th align="right" style="padding:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Amount</th>
          </tr>
        </thead>
        <tbody>${renderReceiptLinesRows(items)}</tbody>
      </table>`;
}

function renderReceiptTotalRow(total: number, label: string): string {
  return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
        <tr>
          <td style="padding-top:12px;border-top:2px solid #111827;font-size:18px;font-weight:700;color:#111827;">${label}</td>
          <td align="right" style="padding-top:12px;border-top:2px solid #111827;font-size:18px;font-weight:700;color:#111827;">$${total.toFixed(2)} USD</td>
        </tr>
      </table>`;
}

/** Sent immediately after checkout while payment is still pending. No payment link in email. */
export async function sendOrderCreatedEmail(input: {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
  items: OrderInvoiceLine[];
}): Promise<boolean> {
  const orderRef = formatOrderRef(input.orderId);

  return sendEmail({
    to: input.to,
    subject: `Order confirmed — #${orderRef}`,
    html: layout(
      `
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#fbbf24;">Awaiting payment</p>
      <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#ffffff;">Thanks, ${escapeHtml(input.customerName)}</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#d4d4d4;">
        Your order is saved as <strong>#${orderRef}</strong>. Complete payment on the checkout page — your receipt will be emailed once payment is confirmed.
      </p>

      ${renderOrderLinesTable(input.items)}
      ${renderOrderTotalRow(input.total, "Total due")}

      <p style="margin:0;font-size:13px;line-height:1.6;color:#737373;">
        This email is your order confirmation only, not a payment request.
      </p>
    `,
      `Order #${orderRef} confirmed — $${input.total.toFixed(2)} total.`
    ),
  });
}

/** Paid invoice / receipt — no payment button. */
export async function sendOrderReceiptEmail(input: {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
  items: OrderInvoiceLine[];
}): Promise<boolean> {
  const orderRef = formatOrderRef(input.orderId);

  return sendEmail({
    to: input.to,
    subject: `Invoice & receipt — Order #${orderRef}`,
    html: receiptLayout(
      `
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#16a34a;">Paid</p>
      <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#111827;">Invoice & receipt</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">
        Hi ${escapeHtml(input.customerName)}, payment for order <strong>#${orderRef}</strong> is confirmed. Keep this email for your records.
      </p>

      ${renderReceiptLinesTable(input.items)}
      ${renderReceiptTotalRow(input.total, "Amount paid")}

      <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">Your order is now being processed. We will notify you when it ships.</p>
    `,
      `Invoice and receipt for paid order #${orderRef}.`
    ),
  });
}

/** @deprecated Use sendOrderCreatedEmail or sendOrderReceiptEmail. */
export async function sendOrderInvoiceEmail(input: {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
  paymentUrl?: string;
  items: OrderInvoiceLine[];
}): Promise<boolean> {
  return sendOrderCreatedEmail(input);
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
  items?: OrderInvoiceLine[];
}): Promise<boolean> {
  if (input.items?.length) {
    return sendOrderReceiptEmail({
      to: input.to,
      customerName: input.customerName,
      orderId: input.orderId,
      total: input.total,
      items: input.items,
    });
  }

  const orderRef = formatOrderRef(input.orderId);
  return sendEmail({
    to: input.to,
    subject: `Invoice & receipt — Order #${orderRef}`,
    html: receiptLayout(
      `
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#16a34a;">Paid</p>
      <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#111827;">Thank you, ${escapeHtml(input.customerName)}</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">
        Payment for order <strong>#${orderRef}</strong> is confirmed. Amount paid: <strong>$${input.total.toFixed(2)} USD</strong>.
      </p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">Your order is now being processed.</p>
    `,
      `Payment confirmed for order #${orderRef}.`
    ),
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
