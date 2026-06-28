import { NextResponse } from "next/server";

import { handlePaymentWebhook } from "@/lib/payments";
import {
  handlePaidWebhook,
  markOrderFailed,
} from "@/lib/checkout/service";
import { findPaymentByOrderId, updatePaymentRecord } from "@/lib/db/payments";
import { getOrderById } from "@/lib/db/orders";
import { logError, logInfo, logWarn } from "@/lib/monitoring/logger";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const ip = getClientIp(req);

  if (!rawBody) {
    await logActivity("warn", "nowpayments.webhook_empty_body", { ip });
    return NextResponse.json({ error: "Empty payload" }, { status: 400 });
  }

  try {
    const result = await handlePaymentWebhook("nowpayments", rawBody, req.headers);

    if (!result) {
      await logActivity("warn", "nowpayments.webhook_rejected", { ip });
      logWarn("payment_webhook_invalid_signature", { ip, provider: "nowpayments" });
      return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
    }

    logInfo("payment_webhook_received", {
      ip,
      provider: "nowpayments",
      orderId: result.orderId,
      status: result.status,
      providerPaymentId: result.providerPaymentId,
      duplicate: result.duplicate ?? false,
    });

    const order = await getOrderById(result.orderId);

    if (result.status === "paid") {
      if (order?.status === "paid" || result.duplicate) {
        await logActivity("warn", "nowpayments.webhook_duplicate", {
          ip,
          orderId: result.orderId,
          paymentId: result.paymentId,
        });
        return NextResponse.json({ success: true, duplicate: true });
      }

      const payment = await findPaymentByOrderId(result.orderId);
      if (payment) {
        await updatePaymentRecord(payment.id, {
          status: "paid",
          provider_payment_id:
            result.providerPaymentId ?? payment.provider_payment_id,
          metadata: {
            ...(payment.metadata ?? {}),
            paid_at: new Date().toISOString(),
            payment_method: "nowpayments",
            invoice_id:
              result.providerPaymentId ?? payment.provider_payment_id,
          },
        });
      }

      await handlePaidWebhook(result.orderId);
      await logActivity("info", "nowpayments.webhook_paid", {
        ip,
        orderId: result.orderId,
        invoiceId: result.providerPaymentId,
      });
    } else if (result.status === "failed") {
      const payment = await findPaymentByOrderId(result.orderId);
      if (payment && payment.status !== "paid") {
        await updatePaymentRecord(payment.id, { status: "failed" });
      }
      if (order?.status !== "paid") {
        await markOrderFailed(result.orderId);
      }
      await logActivity("warn", "nowpayments.webhook_failed", {
        ip,
        orderId: result.orderId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    await logActivity("error", "nowpayments.webhook_error", {
      ip,
      message: error instanceof Error ? error.message : String(error),
    });
    logError("nowpayments_webhook_error", error, { ip });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
