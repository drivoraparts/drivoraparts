import { getEmailFrom, getResendApiKey, getSiteUrl } from "@/lib/env";
import { getAdminEmail } from "@/lib/auth/admin";
import { logError } from "@/lib/monitoring/logger";
import {
  escapeHtml,
  formatEmailDate,
  formatOrderRef,
  renderOrderSummary,
  type EmailOrderItem,
  type EmailPaymentInfo,
  type EmailShippingInfo,
} from "@/lib/email/order-summary";

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

/* =========================================================
   SHARED EMAIL LAYOUT
   ---------------------------------------------------------
   One consistent light/white, red-accent, sans-serif shell for
   every order-related email -- customer and admin alike. Matches
   the site's actual visual identity (Arial, red-600 accent, dark
   charcoal text) rather than a separate email-only design.
========================================================= */

function emailLayout(input: {
  eyebrow: string;
  headline: string;
  intro?: string;
  content: string;
  preheader?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const siteUrl = getSiteUrl();
  const bareUrl = siteUrl.replace(/^https?:\/\//, "");

  const cta =
    input.ctaLabel && input.ctaUrl
      ? `
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 0;">
        <tr>
          <td style="border-radius:8px;background:#dc2626;">
            <a href="${input.ctaUrl}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(input.ctaLabel)}</a>
          </td>
        </tr>
      </table>`
      : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DrivoraParts</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;color:#111827;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader ?? input.headline)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:3px solid #dc2626;">
              <p style="margin:0;color:#dc2626;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">DrivoraParts</p>
              <p style="margin:6px 0 0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(input.eyebrow)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:24px;line-height:1.25;color:#111827;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(input.headline)}</h1>
              ${input.intro ? `<p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#374151;font-family:Arial,Helvetica,sans-serif;">${input.intro}</p>` : ""}
              ${input.content}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #e5e7eb;background:#f9fafb;">
              <p style="margin:0;font-size:11px;line-height:1.6;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">
                DrivoraParts · Performance automotive parts · Questions? Reply to this email or visit
                <a href="${siteUrl}/contact" style="color:#dc2626;text-decoration:none;">${bareUrl}/contact</a>
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

/* =========================================================
   CUSTOMER EMAILS
========================================================= */

type CustomerOrderEmailInput = {
  to: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  orderId: string;
  orderDate?: string;
  total: number;
  shipping?: number;
  items: EmailOrderItem[];
  paymentMethodLabel?: string;
  transactionId?: string | null;
};

function buildShippingInfo(input: CustomerOrderEmailInput): EmailShippingInfo {
  return {
    customerName: input.customerName,
    address: input.shippingAddress,
    phone: input.customerPhone,
    email: input.customerEmail,
  };
}

/** Sent immediately after checkout -- order placed, payment not yet confirmed. */
export async function sendOrderCreatedEmail(input: CustomerOrderEmailInput): Promise<boolean> {
  const orderRef = formatOrderRef(input.orderId);
  const trackUrl = `${getSiteUrl()}/track-order?orderId=${encodeURIComponent(input.orderId)}`;

  const summary = renderOrderSummary({
    meta: {
      orderId: input.orderId,
      orderDate: input.orderDate ?? formatEmailDate(new Date()),
      statusLabel: "Awaiting payment",
      statusColor: "#2563eb",
    },
    items: input.items,
    totals: { shipping: input.shipping ?? 0, total: input.total },
    shipping: buildShippingInfo(input),
    payment: input.paymentMethodLabel
      ? {
          methodLabel: input.paymentMethodLabel,
          statusLabel: "Pending confirmation",
          statusColor: "#2563eb",
          transactionId: input.transactionId,
        }
      : undefined,
  });

  return sendEmail({
    to: input.to,
    subject: `Order received — #${orderRef}`,
    html: emailLayout({
      eyebrow: "Order confirmation",
      headline: `Thank you, ${input.customerName.split(" ")[0] || input.customerName}!`,
      intro: `We've received your order and it's now recorded in our system. You'll get a separate email the moment payment is confirmed.`,
      content: summary,
      preheader: `Order #${orderRef} received — $${input.total.toFixed(2)} total.`,
      ctaLabel: "Track Order",
      ctaUrl: trackUrl,
    }),
  });
}

/** Sent once payment is confirmed. */
export async function sendPaymentReceivedEmail(input: CustomerOrderEmailInput): Promise<boolean> {
  const orderRef = formatOrderRef(input.orderId);
  const trackUrl = `${getSiteUrl()}/track-order?orderId=${encodeURIComponent(input.orderId)}`;

  const summary = renderOrderSummary({
    meta: {
      orderId: input.orderId,
      orderDate: input.orderDate ?? formatEmailDate(new Date()),
      statusLabel: "Paid",
      statusColor: "#16a34a",
    },
    items: input.items,
    totals: { shipping: input.shipping ?? 0, total: input.total },
    shipping: buildShippingInfo(input),
    payment: {
      methodLabel: input.paymentMethodLabel ?? "NOWPayments · Cryptocurrency",
      statusLabel: "Paid",
      statusColor: "#16a34a",
      transactionId: input.transactionId,
    },
  });

  return sendEmail({
    to: input.to,
    subject: `Payment confirmed — Order #${orderRef}`,
    html: emailLayout({
      eyebrow: "Payment confirmation",
      headline: "Payment confirmed",
      intro: `Hi ${input.customerName.split(" ")[0] || input.customerName}, we've received your payment and your order is now being prepared for fulfillment.`,
      content: summary,
      preheader: `Payment confirmed for order #${orderRef} — $${input.total.toFixed(2)}.`,
      ctaLabel: "Track Order",
      ctaUrl: trackUrl,
    }),
  });
}

export async function sendOrderShippedEmail(input: {
  to: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  orderId: string;
  total?: number;
  shipping?: number;
  items?: EmailOrderItem[];
}): Promise<boolean> {
  const orderRef = formatOrderRef(input.orderId);
  const trackUrl = `${getSiteUrl()}/track-order?orderId=${encodeURIComponent(input.orderId)}`;

  const content =
    input.items?.length && typeof input.total === "number"
      ? renderOrderSummary({
          meta: {
            orderId: input.orderId,
            orderDate: formatEmailDate(new Date()),
            statusLabel: "Shipped",
            statusColor: "#2563eb",
          },
          items: input.items,
          totals: { shipping: input.shipping ?? 0, total: input.total },
          shipping: {
            customerName: input.customerName,
            address: input.shippingAddress,
            phone: input.customerPhone,
            email: input.customerEmail,
          },
        })
      : "";

  return sendEmail({
    to: input.to,
    subject: `Your order has shipped — #${orderRef}`,
    html: emailLayout({
      eyebrow: "Shipping update",
      headline: "Your order has shipped",
      intro: `Hi ${input.customerName.split(" ")[0] || input.customerName}, order #${orderRef} is on its way. Tracking details will follow separately if provided by the carrier.`,
      content,
      preheader: `Order #${orderRef} has shipped.`,
      ctaLabel: "Track Order",
      ctaUrl: trackUrl,
    }),
  });
}

export async function sendOrderDeliveredEmail(input: {
  to: string;
  customerName: string;
  orderId: string;
}): Promise<boolean> {
  const orderRef = formatOrderRef(input.orderId);
  const siteUrl = getSiteUrl();

  return sendEmail({
    to: input.to,
    subject: `Order delivered — #${orderRef}`,
    html: emailLayout({
      eyebrow: "Delivery confirmation",
      headline: "Delivered",
      intro: `Hi ${input.customerName.split(" ")[0] || input.customerName}, order #${orderRef} has been marked delivered. Thank you for choosing DrivoraParts.`,
      content: "",
      preheader: `Order #${orderRef} delivered.`,
      ctaLabel: "Shop again",
      ctaUrl: `${siteUrl}/catalog/all`,
    }),
  });
}

/* =========================================================
   ADMIN EMAILS
========================================================= */

export async function sendAdminNewOrderEmail(input: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  total: number;
  shipping?: number;
  items: EmailOrderItem[];
  paymentMethodLabel?: string;
}): Promise<boolean> {
  const orderRef = formatOrderRef(input.orderId);
  const siteUrl = getSiteUrl();
  const adminUrl = `${siteUrl}/admin/orders`;

  const summary = renderOrderSummary({
    meta: {
      orderId: input.orderId,
      orderDate: formatEmailDate(new Date()),
      statusLabel: "Pending payment",
      statusColor: "#2563eb",
    },
    items: input.items,
    totals: { shipping: input.shipping ?? 0, total: input.total },
    shipping: {
      customerName: input.customerName,
      address: input.shippingAddress,
      phone: input.customerPhone,
      email: input.customerEmail,
    },
    payment: input.paymentMethodLabel
      ? { methodLabel: input.paymentMethodLabel, statusLabel: "Pending confirmation", statusColor: "#2563eb" }
      : undefined,
  });

  return sendEmail({
    to: getAdminEmail(),
    subject: `New order #${orderRef} — $${input.total.toFixed(2)} from ${input.customerName}`,
    html: emailLayout({
      eyebrow: "Store notification",
      headline: `New order from ${input.customerName}`,
      content: summary,
      preheader: `New order #${orderRef} from ${input.customerName}.`,
      ctaLabel: "Open in admin dashboard",
      ctaUrl: adminUrl,
    }),
  });
}

export async function sendAdminPaymentReceivedEmail(input: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  total: number;
  shipping?: number;
  items: EmailOrderItem[];
  paymentMethodLabel?: string;
  transactionId?: string | null;
}): Promise<boolean> {
  const orderRef = formatOrderRef(input.orderId);
  const siteUrl = getSiteUrl();
  const adminUrl = `${siteUrl}/admin/orders`;

  const summary = renderOrderSummary({
    meta: {
      orderId: input.orderId,
      orderDate: formatEmailDate(new Date()),
      statusLabel: "Paid",
      statusColor: "#16a34a",
    },
    items: input.items,
    totals: { shipping: input.shipping ?? 0, total: input.total },
    shipping: {
      customerName: input.customerName,
      address: input.shippingAddress,
      phone: input.customerPhone,
      email: input.customerEmail,
    },
    payment: {
      methodLabel: input.paymentMethodLabel ?? "NOWPayments · Cryptocurrency",
      statusLabel: "Paid",
      statusColor: "#16a34a",
      transactionId: input.transactionId,
    },
  });

  return sendEmail({
    to: getAdminEmail(),
    subject: `Payment confirmed — order #${orderRef} — $${input.total.toFixed(2)}`,
    html: emailLayout({
      eyebrow: "Store notification",
      headline: `Payment confirmed — ${input.customerName}`,
      content: summary,
      preheader: `Payment confirmed for order #${orderRef}.`,
      ctaLabel: "Open in admin dashboard",
      ctaUrl: adminUrl,
    }),
  });
}

export type { EmailOrderItem, EmailPaymentInfo, EmailShippingInfo };
