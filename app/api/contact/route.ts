import { NextResponse } from "next/server";

import { COMPANY_SUPPORT_EMAIL } from "@/lib/content/company";
import { sendEmail } from "@/lib/email/send";
import { logActivity } from "@/lib/monitoring/activity";

const TOPIC_LABELS: Record<string, string> = {
  general: "General question",
  order: "Order status or tracking",
  fitment: "Product or fitment help",
  returns: "Returns or refunds",
  business: "Business or partnership",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const topic =
      typeof body?.topic === "string" && body.topic in TOPIC_LABELS
        ? body.topic
        : "general";
    const orderId =
      typeof body?.orderId === "string" ? body.orderId.trim().slice(0, 120) : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!name || name.length > 120) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }

    if (!email || !isValidEmail(email) || email.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: "Message must be between 10 and 5000 characters." },
        { status: 400 }
      );
    }

    const topicLabel = TOPIC_LABELS[topic] ?? TOPIC_LABELS.general;
    const subject = `[Contact] ${topicLabel} — ${name}`;

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.5;">
        <h1 style="font-size:20px;margin:0 0 16px;">New contact form message</h1>
        <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        <p><strong>Topic:</strong> ${escapeHtml(topicLabel)}</p>
        ${
          orderId
            ? `<p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>`
            : ""
        }
        <p style="margin-top:20px;"><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">${escapeHtml(message)}</p>
      </div>
    `;

    const sent = await sendEmail({
      to: COMPANY_SUPPORT_EMAIL,
      subject,
      html,
      replyTo: email,
    });

    if (!sent) {
      return NextResponse.json(
        {
          error:
            "Message could not be sent right now. Please email support@drivoraparts.com directly.",
        },
        { status: 503 }
      );
    }

    await logActivity("info", "Contact form submitted", {
      topic,
      hasOrderId: Boolean(orderId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    await logActivity("error", "Contact form error", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Unable to send message." }, { status: 500 });
  }
}
