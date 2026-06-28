import { getEmailFrom, getResendApiKey, getSiteUrl } from "@/lib/env";
import { getAdminEmail } from "@/lib/auth/admin";
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

function formatDocumentDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function documentLayout(content: string, preheader = "", headerSubtitle = "Order documents"): string {
  const siteUrl = getSiteUrl();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DrivoraParts</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;color:#111827;font-family:Georgia,'Times New Roman',Times,serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #d1d5db;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:32px 32px 20px;border-bottom:2px solid #111827;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin:0;color:#dc2626;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">DrivoraParts</p>
                    <p style="margin:6px 0 0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(headerSubtitle)}</p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${siteUrl.replace(/^https?:\/\//, "")}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #e5e7eb;background:#f9fafb;">
              <p style="margin:0;font-size:11px;line-height:1.6;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">
                DrivoraParts · Performance automotive parts · Questions? Reply to this email or visit
                <a href="${siteUrl}/contact" style="color:#dc2626;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}/contact</a>
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

function renderReceiptMetaRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:#6b7280;width:140px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:13px;color:#111827;font-weight:600;">${value}</td>
    </tr>`;
}

function renderReceiptMetaTable(rows: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 28px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;">
      <tr><td style="padding:16px 18px;">${rows}</td></tr>
    </table>`;
}

type OrderDocumentInput = {
  customerName: string;
  orderId: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  items: OrderInvoiceLine[];
  documentDate: string;
  paid: boolean;
};

function buildReceiptPage(input: OrderDocumentInput): string {
  const orderRef = formatOrderRef(input.orderId);
  const statusLabel = input.paid ? "Payment confirmed" : "Order placed";
  const statusColor = input.paid ? "#16a34a" : "#2563eb";
  const headline = input.paid ? "Payment receipt" : "Order successfully placed";
  const intro = input.paid
    ? `Hi ${escapeHtml(input.customerName)}, this receipt confirms payment for your order. Please retain it for your records.`
    : `Hi ${escapeHtml(input.customerName)}, thank you for shopping with DrivoraParts. Your order has been received and recorded in our system.`;
  const totalLabel = input.paid ? "Amount paid" : "Order total";

  return `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${statusColor};font-family:Arial,Helvetica,sans-serif;">Page 1 · Receipt</p>
    <h1 style="margin:0 0 8px;font-size:30px;line-height:1.15;color:#111827;font-family:Georgia,'Times New Roman',Times,serif;">${headline}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#374151;font-family:Arial,Helvetica,sans-serif;">${intro}</p>

    ${renderReceiptMetaTable(`
      ${renderReceiptMetaRow("Status", `<span style="color:${statusColor};">${statusLabel}</span>`)}
      ${renderReceiptMetaRow("Receipt #", orderRef)}
      ${renderReceiptMetaRow("Order #", orderRef)}
      ${renderReceiptMetaRow("Date", escapeHtml(input.documentDate))}
      ${renderReceiptMetaRow("Customer", escapeHtml(input.customerName))}
    `)}

    ${renderReceiptLinesTable(input.items)}
    ${renderReceiptTotalRow(input.total, totalLabel)}

    <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">
      ${input.paid ? "Your order is now being prepared for fulfillment." : "We will email your paid invoice once payment is confirmed on our payment processor."}
    </p>`;
}

function buildInvoiceAgreementPage(input: OrderDocumentInput): string {
  const orderRef = formatOrderRef(input.orderId);
  const subtotal =
    input.subtotal ??
    input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = input.shipping ?? Math.max(0, input.total - subtotal);

  return `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">Page 2 · Invoice &amp; agreement</p>
    <h2 style="margin:0 0 8px;font-size:24px;line-height:1.2;color:#111827;font-family:Georgia,'Times New Roman',Times,serif;">Tax invoice &amp; sales agreement</h2>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#374151;font-family:Arial,Helvetica,sans-serif;">
      This document constitutes the invoice and binding agreement between DrivoraParts and the customer named below.
    </p>

    ${renderReceiptMetaTable(`
      ${renderReceiptMetaRow("Invoice #", `INV-${orderRef}`)}
      ${renderReceiptMetaRow("Order #", orderRef)}
      ${renderReceiptMetaRow("Invoice date", escapeHtml(input.documentDate))}
      ${renderReceiptMetaRow("Bill to", escapeHtml(input.customerName))}
      ${renderReceiptMetaRow("Payment status", input.paid ? "Paid in full" : "Pending confirmation")}
    `)}

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px;font-size:13px;font-family:Arial,Helvetica,sans-serif;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;">Merchandise subtotal</td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#111827;">$${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;">Shipping &amp; handling</td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#111827;">$${shipping.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;font-size:15px;font-weight:700;color:#111827;">Total ${input.paid ? "paid" : "due"}</td>
        <td align="right" style="padding:12px 0;font-size:15px;font-weight:700;color:#111827;">$${input.total.toFixed(2)} USD</td>
      </tr>
    </table>

    ${renderReceiptLinesTable(input.items)}

    <div style="margin:28px 0;padding:18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#374151;font-family:Arial,Helvetica,sans-serif;">Terms &amp; conditions</p>
      <p style="margin:0;font-size:12px;line-height:1.7;color:#4b5563;font-family:Arial,Helvetica,sans-serif;">
        By placing this order, the customer agrees to DrivoraParts Terms of Sale, Shipping Policy, and Refund Policy
        published at drivoraparts.com/policies. All sales of performance parts are subject to fitment verification by
        the customer. DrivoraParts will fulfill this order upon confirmed payment and available inventory.
      </p>
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;">
      <tr>
        <td style="width:50%;padding-right:16px;vertical-align:top;">
          <p style="margin:0 0 28px;font-size:12px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">Authorized customer signature</p>
          <p style="margin:0 0 6px;font-size:26px;line-height:1.2;color:#111827;font-family:'Brush Script MT','Segoe Script',cursive;">${escapeHtml(input.customerName)}</p>
          <div style="border-top:1px solid #111827;width:220px;margin-bottom:8px;"></div>
          <p style="margin:0;font-size:11px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">Electronically signed · ${escapeHtml(input.documentDate)}</p>
        </td>
        <td style="width:50%;padding-left:16px;vertical-align:top;">
          <p style="margin:0 0 28px;font-size:12px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">DrivoraParts authorized representative</p>
          <p style="margin:0 0 6px;font-size:26px;line-height:1.2;color:#111827;font-family:'Brush Script MT','Segoe Script',cursive;">DrivoraParts</p>
          <div style="border-top:1px solid #111827;width:220px;margin-bottom:8px;"></div>
          <p style="margin:0;font-size:11px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">Issued · ${escapeHtml(input.documentDate)}</p>
        </td>
      </tr>
    </table>`;
}

function buildTwoPageOrderDocument(input: OrderDocumentInput): string {
  return `
    ${buildReceiptPage(input)}
    <div style="margin:48px 0 0;padding-top:48px;border-top:3px double #d1d5db;">
      ${buildInvoiceAgreementPage(input)}
    </div>`;
}

/** Sent immediately after checkout. Two-page receipt + invoice agreement. */
export async function sendOrderCreatedEmail(input: {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  items: OrderInvoiceLine[];
}): Promise<boolean> {
  const orderRef = formatOrderRef(input.orderId);
  const documentDate = formatDocumentDate();

  return sendEmail({
    to: input.to,
    subject: `Order successfully placed — #${orderRef}`,
    html: documentLayout(
      buildTwoPageOrderDocument({
        customerName: input.customerName,
        orderId: input.orderId,
        total: input.total,
        subtotal: input.subtotal,
        shipping: input.shipping,
        items: input.items,
        documentDate,
        paid: false,
      }),
      `Order #${orderRef} successfully placed — $${input.total.toFixed(2)} total.`,
      "Order receipt & invoice"
    ),
  });
}

/** Paid invoice / receipt — two pages, no payment button. */
export async function sendOrderReceiptEmail(input: {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  items: OrderInvoiceLine[];
}): Promise<boolean> {
  const orderRef = formatOrderRef(input.orderId);
  const documentDate = formatDocumentDate();

  return sendEmail({
    to: input.to,
    subject: `Paid invoice & receipt — Order #${orderRef}`,
    html: documentLayout(
      buildTwoPageOrderDocument({
        customerName: input.customerName,
        orderId: input.orderId,
        total: input.total,
        subtotal: input.subtotal,
        shipping: input.shipping,
        items: input.items,
        documentDate,
        paid: true,
      }),
      `Paid invoice and receipt for order #${orderRef}.`,
      "Paid invoice & receipt"
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
  subtotal?: number;
  shipping?: number;
  items?: OrderInvoiceLine[];
}): Promise<boolean> {
  if (input.items?.length) {
    return sendOrderReceiptEmail({
      to: input.to,
      customerName: input.customerName,
      orderId: input.orderId,
      total: input.total,
      subtotal: input.subtotal,
      shipping: input.shipping,
      items: input.items,
    });
  }

  const orderRef = formatOrderRef(input.orderId);
  return sendEmail({
    to: input.to,
    subject: `Paid invoice & receipt — Order #${orderRef}`,
    html: documentLayout(
      buildTwoPageOrderDocument({
        customerName: input.customerName,
        orderId: input.orderId,
        total: input.total,
        items: [],
        documentDate: formatDocumentDate(),
        paid: true,
      }),
      `Payment confirmed for order #${orderRef}.`,
      "Paid invoice & receipt"
    ),
  });
}

export async function sendAdminNewOrderEmail(input: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  total: number;
  items: OrderInvoiceLine[];
}): Promise<boolean> {
  const orderRef = formatOrderRef(input.orderId);
  const siteUrl = getSiteUrl();
  const adminUrl = `${siteUrl}/admin/orders`;
  const itemRows = input.items
    .map(
      (item) =>
        `<li style="margin:0 0 6px;">${escapeHtml(item.name)} × ${item.quantity} — $${(item.unitPrice * item.quantity).toFixed(2)}</li>`
    )
    .join("");

  return sendEmail({
    to: getAdminEmail(),
    subject: `New order #${orderRef} — $${input.total.toFixed(2)} from ${input.customerName}`,
    html: documentLayout(
      `
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#dc2626;font-family:Arial,Helvetica,sans-serif;">New customer order</p>
      <h1 style="margin:0 0 16px;font-size:26px;color:#111827;font-family:Georgia,'Times New Roman',Times,serif;">Order #${orderRef}</h1>

      ${renderReceiptMetaTable(`
        ${renderReceiptMetaRow("Customer", escapeHtml(input.customerName))}
        ${renderReceiptMetaRow("Email", escapeHtml(input.customerEmail))}
        ${input.customerPhone ? renderReceiptMetaRow("Phone", escapeHtml(input.customerPhone)) : ""}
        ${input.shippingAddress ? renderReceiptMetaRow("Ship to", escapeHtml(input.shippingAddress)) : ""}
        ${renderReceiptMetaRow("Total", `$${input.total.toFixed(2)} USD`)}
        ${renderReceiptMetaRow("Status", "Pending payment confirmation")}
      `)}

      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#374151;font-family:Arial,Helvetica,sans-serif;">Items ordered</p>
      <ul style="margin:0 0 24px;padding-left:18px;font-size:13px;line-height:1.6;color:#374151;font-family:Arial,Helvetica,sans-serif;">${itemRows}</ul>

      <p style="margin:0;font-size:14px;font-family:Arial,Helvetica,sans-serif;">
        <a href="${adminUrl}" style="color:#dc2626;font-weight:700;text-decoration:none;">Open order in admin dashboard →</a>
      </p>
    `,
      `New order #${orderRef} from ${input.customerName}.`,
      "Store notification"
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
