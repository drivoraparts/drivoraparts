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
