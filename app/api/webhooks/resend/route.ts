import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { recordEmailEvent, type EmailEventType } from "@/lib/payments/manual-payment";
import { logActivity } from "@/lib/monitoring/activity";

/**
 * Resend delivery / open events for the payment emails an admin sends.
 *
 * Resend signs webhooks with Svix: HMAC-SHA256 over "<id>.<timestamp>.<body>"
 * keyed with the base64 part of the "whsec_..." secret. Nothing is trusted
 * until that matches, and a stale timestamp is refused to stop replays.
 */

const TOLERANCE_SECONDS = 5 * 60;

const EVENT_TYPES: Record<string, EmailEventType> = {
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

function verify(rawBody: string, headers: Headers, secret: string): boolean {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!id || !timestamp || !signatures) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest();

  return signatures.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) return false;
    const given = Buffer.from(sig, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    await logActivity("warn", "resend.webhook_secret_missing", {});
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  if (!verify(rawBody, req.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: string; created_at?: string; data?: { email_id?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const type = event.type ? EVENT_TYPES[event.type] : undefined;
  const emailId = event.data?.email_id;
  // Events we do not track (sent, delayed, clicked...) are acknowledged so the
  // provider does not keep retrying them.
  if (!type || !emailId) return NextResponse.json({ ok: true, ignored: true });

  try {
    const at =
      event.created_at && !Number.isNaN(Date.parse(event.created_at))
        ? new Date(event.created_at).toISOString()
        : new Date().toISOString();
    const found = await recordEmailEvent(emailId, { type, at });
    // Not found yet: 404 makes Resend retry, which covers an event that
    // arrives before the id has been saved against the payment.
    if (!found) return NextResponse.json({ error: "Unknown email" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logActivity("warn", "resend.webhook_record_failed", {
      message: error instanceof Error ? error.message : "failed",
    });
    return NextResponse.json({ error: "Could not record event" }, { status: 500 });
  }
}
