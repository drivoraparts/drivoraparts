import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { getNexaPayWebhookSecret } from "@/lib/env";
import { getOrderById } from "@/lib/db/orders";
import { findPaymentByOrderId, updatePaymentRecord } from "@/lib/db/payments";
import { handlePaidWebhook, markOrderFailed } from "@/lib/checkout/service";
import { logError, logInfo, logWarn } from "@/lib/monitoring/logger";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";

const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes, per NexaPay's own spec

/**
 * Verifies `sha256=<hex>` in X-NexaPay-Signature against HMAC-SHA256 of
 * `${timestamp}.${rawBody}`, and rejects timestamps older than 5 minutes
 * (replay protection) -- both exactly as specified by NexaPay's webhook
 * security docs. Constant-time compare, same pattern already used for the
 * NOWPayments IPN secret (see lib/payments/nowpayments/client.ts).
 */
function verifyNexaPaySignature(
  rawBody: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !timestampHeader) return false;

  const timestampMs = Number(timestampHeader) * (timestampHeader.length <= 10 ? 1000 : 1);
  if (!Number.isFinite(timestampMs)) return false;
  if (Math.abs(Date.now() - timestampMs) > REPLAY_WINDOW_MS) return false;

  const expected =
    "sha256=" +
    createHmac("sha256", secret).update(`${timestampHeader}.${rawBody}`).digest("hex");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Best-effort order-reference extraction. NexaPay's real payload field
 * names haven't been confirmed against actual docs/a live sample yet --
 * this checks the common shapes payment providers use. Once a real
 * "completed" webhook has been received (see logs for the raw body), this
 * should be tightened to the exact field NexaPay actually sends.
 */
function extractOrderId(payload: Record<string, unknown>): string | null {
  const direct = payload.order_id ?? payload.orderId ?? payload.reference;
  if (typeof direct === "string" && direct) return direct;

  const metadata = payload.metadata;
  if (metadata && typeof metadata === "object") {
    const fromMeta =
      (metadata as Record<string, unknown>).order_id ??
      (metadata as Record<string, unknown>).orderId;
    if (typeof fromMeta === "string" && fromMeta) return fromMeta;
  }

  return null;
}

function extractStatus(payload: Record<string, unknown>): string | null {
  const status = payload.status ?? payload.event ?? payload.type;
  return typeof status === "string" ? status.toLowerCase() : null;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const ip = getClientIp(req);
  const secret = getNexaPayWebhookSecret();

  if (!secret) {
    logError("nexapay_webhook_not_configured", new Error("NEXAPAY_WEBHOOK_SECRET not set"), { ip });
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  if (!rawBody) {
    await logActivity("warn", "nexapay.webhook_empty_body", { ip });
    return NextResponse.json({ error: "Empty payload" }, { status: 400 });
  }

  const signature = req.headers.get("x-nexapay-signature");
  const timestamp = req.headers.get("x-nexapay-timestamp");

  if (!verifyNexaPaySignature(rawBody, signature, timestamp, secret)) {
    await logActivity("warn", "nexapay.webhook_rejected", { ip });
    logWarn("payment_webhook_invalid_signature", { ip, provider: "nexapay" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    await logActivity("warn", "nexapay.webhook_invalid_json", { ip });
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = extractStatus(payload);
  const orderId = extractOrderId(payload);

  // Logged in full so the real field shape can be confirmed from a live
  // "Test Webhook Delivery" send -- never assumed/fabricated.
  logInfo("nexapay_webhook_received", { ip, status, orderId, payload });

  if (!orderId) {
    await logActivity("warn", "nexapay.webhook_no_order_reference", { ip, status });
    return NextResponse.json({ success: true, note: "No order reference found in payload" });
  }

  const order = await getOrderById(orderId).catch(() => null);
  if (!order) {
    await logActivity("warn", "nexapay.webhook_unknown_order", { ip, orderId, status });
    return NextResponse.json({ success: true, note: "Order not found" });
  }

  try {
    if (status === "completed" || status === "paid" || status === "confirmed") {
      if (order.status === "paid") {
        await logActivity("warn", "nexapay.webhook_duplicate", { ip, orderId });
        return NextResponse.json({ success: true, duplicate: true });
      }

      const payment = await findPaymentByOrderId(orderId);
      if (payment) {
        await updatePaymentRecord(payment.id, {
          status: "paid",
          metadata: {
            ...(payment.metadata ?? {}),
            paid_at: new Date().toISOString(),
            payment_method: "nexapay",
          },
        });
      }

      await handlePaidWebhook(orderId);
      await logActivity("info", "nexapay.webhook_paid", { ip, orderId });
    } else if (status === "failed" || status === "expired" || status === "cancelled") {
      const payment = await findPaymentByOrderId(orderId);
      if (payment && payment.status !== "paid") {
        await updatePaymentRecord(payment.id, { status: "failed" });
      }
      if (order.status !== "paid") {
        await markOrderFailed(orderId);
      }
      await logActivity("warn", "nexapay.webhook_failed", { ip, orderId });
    } else {
      await logActivity("info", "nexapay.webhook_unhandled_status", { ip, orderId, status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    await logActivity("error", "nexapay.webhook_error", {
      ip,
      orderId,
      message: error instanceof Error ? error.message : String(error),
    });
    logError("nexapay_webhook_error", error, { ip, orderId });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
