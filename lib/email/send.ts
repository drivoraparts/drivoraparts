import { getEmailFrom, getResendApiKey, getSiteUrl } from "@/lib/env";
import { getAdminEmail } from "@/lib/auth/admin";
import { logError } from "@/lib/monitoring/logger";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
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
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
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


export type OrderInvoiceLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string | null;
};

function resolveEmailImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const siteUrl = getSiteUrl();
  return `${siteUrl}${src.startsWith("/") ? src : `/${src}`}`;
}

function renderReceiptLinesRows(items: OrderInvoiceLine[]): string {
  return items
    .map((item) => {
      const imgUrl = resolveEmailImageUrl(item.image);
      const imageCell = imgUrl
        ? `<img src="${imgUrl}" width="48" height="48" alt="${escapeHtml(item.name)}" style="display:block;width:48px;height:48px;border-radius:4px;border:1px solid #e5e7eb;object-fit:cover;" />`
        : `<div style="width:48px;height:48px;border-radius:4px;border:1px solid #e5e7eb;background:#f9fafb;"></div>`;

      return `
          <tr>
            <td style="padding:14px 10px 14px 0;border-bottom:1px solid #e5e7eb;width:48px;">${imageCell}</td>
            <td style="padding:14px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">${escapeHtml(item.name)}</td>
            <td style="padding:14px 8px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;text-align:center;">${item.quantity}</td>
            <td style="padding:14px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;text-align:right;">$${(item.unitPrice * item.quantity).toFixed(2)}</td>
          </tr>`;
    })
    .join("");
}

function renderReceiptLinesTable(items: OrderInvoiceLine[]): string {
  return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 8px;">
        <thead>
          <tr>
            <th style="padding:0 10px 10px 0;width:48px;"></th>
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

/**
 * The Order ID row gets its own renderer: styled as a selectable monospace
 * "code" chip so it's easy to tap-and-hold/select and copy manually. Email
 * clients strip all JavaScript, so a real click-to-copy button can't work
 * here -- this is the honest equivalent instead of a button that does
 * nothing when tapped.
 */
function renderOrderIdRow(orderRef: string): string {
  return `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:#6b7280;width:140px;vertical-align:top;">Order ID</td>
      <td style="padding:8px 0;">
        <span style="display:inline-block;font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:700;color:#111827;background:#ffffff;border:1px solid #d1d5db;border-radius:4px;padding:4px 10px;letter-spacing:0.03em;">${escapeHtml(orderRef)}</span>
        <span style="font-size:11px;color:#9ca3af;margin-left:6px;">📋 tap &amp; hold to copy</span>
      </td>
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
  orderNumber: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  items: OrderInvoiceLine[];
  documentDate: string;
  paid: boolean;
};

function buildReceiptPage(input: OrderDocumentInput): string {
  const orderRef = input.orderNumber;
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
      ${renderOrderIdRow(orderRef)}
      ${renderReceiptMetaRow("Receipt #", orderRef)}
      ${renderReceiptMetaRow("Date", escapeHtml(input.documentDate))}
      ${renderReceiptMetaRow("Customer", escapeHtml(input.customerName))}
    `)}

    ${renderReceiptLinesTable(input.items)}
    ${renderReceiptTotalRow(input.total, totalLabel)}

    <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">
      ${input.paid ? "Your order is now being prepared for fulfillment." : "We will email your paid invoice once payment is confirmed on our payment processor."}
    </p>

    <p style="margin:0;font-size:13px;font-family:Arial,Helvetica,sans-serif;">
      <a href="${getSiteUrl()}/track-order?orderId=${encodeURIComponent(input.orderNumber)}" style="color:#dc2626;font-weight:700;text-decoration:none;">Track your order →</a>
    </p>`;
}

function buildInvoiceAgreementPage(input: OrderDocumentInput): string {
  const orderRef = input.orderNumber;
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
      ${renderOrderIdRow(orderRef)}
      ${renderReceiptMetaRow("Invoice #", `INV-${orderRef}`)}
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

function renderShippingPolicyFooter(): string {
  const siteUrl = getSiteUrl();
  const policyUrl = `${siteUrl}/policies/shipping-policy`;

  return `
    <div style="margin-top:40px;padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#374151;font-family:Arial,Helvetica,sans-serif;">Shipping policy</p>
      <p style="margin:0 0 12px;font-size:12px;line-height:1.7;color:#4b5563;font-family:Arial,Helvetica,sans-serif;">
        Orders are processed within 1–5 business days after payment is confirmed. Estimated delivery is typically
        5–15 business days depending on your region and carrier. Tracking information is sent when available.
        International orders may be subject to customs duties and taxes, which are the responsibility of the recipient.
      </p>
      <p style="margin:0;font-size:12px;line-height:1.6;color:#4b5563;font-family:Arial,Helvetica,sans-serif;">
        Questions about shipping? Reply to this email or review our
        <a href="${policyUrl}" style="color:#dc2626;font-weight:600;text-decoration:none;">full shipping policy</a>.
      </p>
    </div>`;
}

function buildTwoPageOrderDocument(input: OrderDocumentInput): string {
  return `
    ${buildReceiptPage(input)}
    <div style="margin:48px 0 0;padding-top:48px;border-top:3px double #d1d5db;">
      ${buildInvoiceAgreementPage(input)}
    </div>
    ${renderShippingPolicyFooter()}`;
}

/** Sent immediately after checkout. Two-page receipt + invoice agreement. */
export async function sendOrderCreatedEmail(input: {
  to: string;
  customerName: string;
  orderNumber: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  items: OrderInvoiceLine[];
}): Promise<boolean> {
  const orderRef = input.orderNumber;
  const documentDate = formatDocumentDate();

  return sendEmail({
    to: input.to,
    subject: `Order successfully placed — #${orderRef}`,
    html: documentLayout(
      buildTwoPageOrderDocument({
        customerName: input.customerName,
        orderNumber: input.orderNumber,
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
  orderNumber: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  items: OrderInvoiceLine[];
}): Promise<boolean> {
  const orderRef = input.orderNumber;
  const documentDate = formatDocumentDate();

  return sendEmail({
    to: input.to,
    subject: `Order confirmed — #${orderRef}`,
    html: documentLayout(
      buildTwoPageOrderDocument({
        customerName: input.customerName,
        orderNumber: input.orderNumber,
        total: input.total,
        subtotal: input.subtotal,
        shipping: input.shipping,
        items: input.items,
        documentDate,
        paid: true,
      }),
      `Your DrivoraParts order has been confirmed — #${orderRef}.`,
      "Order confirmed"
    ),
  });
}

export async function sendPaymentReceivedEmail(input: {
  to: string;
  customerName: string;
  orderNumber: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  items?: OrderInvoiceLine[];
}): Promise<boolean> {
  if (input.items?.length) {
    return sendOrderReceiptEmail({
      to: input.to,
      customerName: input.customerName,
      orderNumber: input.orderNumber,
      total: input.total,
      subtotal: input.subtotal,
      shipping: input.shipping,
      items: input.items,
    });
  }

  const orderRef = input.orderNumber;
  return sendEmail({
    to: input.to,
    subject: `Order confirmed — #${orderRef}`,
    html: documentLayout(
      buildTwoPageOrderDocument({
        customerName: input.customerName,
        orderNumber: input.orderNumber,
        total: input.total,
        items: [],
        documentDate: formatDocumentDate(),
        paid: true,
      }),
      `Your DrivoraParts order has been confirmed — #${orderRef}.`,
      "Order confirmed"
    ),
  });
}

export async function sendAdminNewOrderEmail(input: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  total: number;
  items: OrderInvoiceLine[];
}): Promise<boolean> {
  const orderRef = input.orderNumber;
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

/** Admin's counterpart to sendPaymentReceivedEmail -- fires from the same
 *  payment-confirmed webhook path, never at checkout/order-creation time. */
export async function sendAdminPaymentConfirmedEmail(input: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  total: number;
  items: OrderInvoiceLine[];
  transactionId?: string;
}): Promise<boolean> {
  const orderRef = input.orderNumber;
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
    subject: `Payment confirmed — order #${orderRef} — $${input.total.toFixed(2)} from ${input.customerName}`,
    html: documentLayout(
      `
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#16a34a;font-family:Arial,Helvetica,sans-serif;">Payment confirmed</p>
      <h1 style="margin:0 0 16px;font-size:26px;color:#111827;font-family:Georgia,'Times New Roman',Times,serif;">Order #${orderRef} — Validated</h1>

      ${renderReceiptMetaTable(`
        ${renderReceiptMetaRow("Customer", escapeHtml(input.customerName))}
        ${renderReceiptMetaRow("Email", escapeHtml(input.customerEmail))}
        ${input.customerPhone ? renderReceiptMetaRow("Phone", escapeHtml(input.customerPhone)) : ""}
        ${input.shippingAddress ? renderReceiptMetaRow("Ship to", escapeHtml(input.shippingAddress)) : ""}
        ${renderReceiptMetaRow("Total", `$${input.total.toFixed(2)} USD`)}
        ${renderReceiptMetaRow("Payment method", "NOWPayments · Cryptocurrency")}
        ${renderReceiptMetaRow("Status", `<span style="color:#16a34a;">Paid</span>`)}
        ${input.transactionId ? renderReceiptMetaRow("Transaction ID", escapeHtml(input.transactionId)) : ""}
      `)}

      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#374151;font-family:Arial,Helvetica,sans-serif;">Items ordered</p>
      <ul style="margin:0 0 24px;padding-left:18px;font-size:13px;line-height:1.6;color:#374151;font-family:Arial,Helvetica,sans-serif;">${itemRows}</ul>

      <p style="margin:0;font-size:14px;font-family:Arial,Helvetica,sans-serif;">
        <a href="${adminUrl}" style="color:#dc2626;font-weight:700;text-decoration:none;">Open order in admin dashboard →</a>
      </p>
    `,
      `Payment confirmed for order #${orderRef} from ${input.customerName}.`,
      "Store notification"
    ),
  });
}

type ShippingUpdateInput = {
  to: string;
  customerName: string;
  orderNumber: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  estimatedDeliveryStart?: string | null;
  estimatedDeliveryEnd?: string | null;
};

function renderShippingUpdateMeta(input: ShippingUpdateInput): string {
  const rows: string[] = [];
  if (input.carrier) rows.push(renderReceiptMetaRow("Carrier", escapeHtml(input.carrier)));
  if (input.trackingNumber) {
    rows.push(renderReceiptMetaRow("Tracking number", escapeHtml(input.trackingNumber)));
  }
  if (input.estimatedDeliveryStart) {
    const window = input.estimatedDeliveryEnd
      ? `${escapeHtml(input.estimatedDeliveryStart)} – ${escapeHtml(input.estimatedDeliveryEnd)}`
      : escapeHtml(input.estimatedDeliveryStart);
    rows.push(renderReceiptMetaRow("Estimated delivery", window));
  }
  return rows.length ? renderReceiptMetaTable(rows.join("")) : "";
}

function trackOrderLink(orderNumber: string): string {
  return `${getSiteUrl()}/track-order?orderId=${encodeURIComponent(orderNumber)}`;
}

export async function sendOrderShippedEmail(input: ShippingUpdateInput): Promise<boolean> {
  const orderRef = input.orderNumber;
  return sendEmail({
    to: input.to,
    subject: `Your order has shipped — #${orderRef}`,
    html: documentLayout(
      `
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#2563eb;font-family:Arial,Helvetica,sans-serif;">Shipping update</p>
      <h1 style="margin:0 0 16px;font-size:28px;color:#111827;font-family:Georgia,'Times New Roman',Times,serif;">Your order has shipped</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#374151;font-family:Arial,Helvetica,sans-serif;">
        Hi ${escapeHtml(input.customerName)}, order #${orderRef} is on its way.
      </p>
      ${renderShippingUpdateMeta(input)}
      <p style="margin:20px 0 0;font-size:14px;font-family:Arial,Helvetica,sans-serif;">
        <a href="${trackOrderLink(input.orderNumber)}" style="color:#dc2626;font-weight:700;text-decoration:none;">Track your order →</a>
      </p>
    `,
      `Order #${orderRef} has shipped.`,
      "Shipping update"
    ),
  });
}

export async function sendOrderOutForDeliveryEmail(input: ShippingUpdateInput): Promise<boolean> {
  const orderRef = input.orderNumber;
  return sendEmail({
    to: input.to,
    subject: `Your order is out for delivery — #${orderRef}`,
    html: documentLayout(
      `
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#2563eb;font-family:Arial,Helvetica,sans-serif;">Shipping update</p>
      <h1 style="margin:0 0 16px;font-size:28px;color:#111827;font-family:Georgia,'Times New Roman',Times,serif;">Out for delivery</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#374151;font-family:Arial,Helvetica,sans-serif;">
        Hi ${escapeHtml(input.customerName)}, order #${orderRef} is with the local delivery service and should arrive soon.
      </p>
      ${renderShippingUpdateMeta(input)}
      <p style="margin:20px 0 0;font-size:14px;font-family:Arial,Helvetica,sans-serif;">
        <a href="${trackOrderLink(input.orderNumber)}" style="color:#dc2626;font-weight:700;text-decoration:none;">Track your order →</a>
      </p>
    `,
      `Order #${orderRef} is out for delivery.`,
      "Shipping update"
    ),
  });
}

export async function sendOrderDeliveredEmail(input: {
  to: string;
  customerName: string;
  orderNumber: string;
}): Promise<boolean> {
  const orderRef = input.orderNumber;
  return sendEmail({
    to: input.to,
    subject: `Order delivered — #${orderRef}`,
    html: documentLayout(
      `
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#16a34a;font-family:Arial,Helvetica,sans-serif;">Delivery confirmation</p>
      <h1 style="margin:0 0 16px;font-size:28px;color:#111827;font-family:Georgia,'Times New Roman',Times,serif;">Delivered</h1>
      <p style="margin:0;font-size:15px;line-height:1.65;color:#374151;font-family:Arial,Helvetica,sans-serif;">
        Hi ${escapeHtml(input.customerName)}, order #${orderRef} has been marked delivered. Thank you for choosing DrivoraParts.
      </p>
    `,
      `Order #${orderRef} delivered.`,
      "Delivery confirmation"
    ),
  });
}
