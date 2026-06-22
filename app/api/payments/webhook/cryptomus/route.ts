export const runtime = 'edge';

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

    await logActivity("warn", "cryptomus.webhook_empty_body", { ip });

    return NextResponse.json({ error: "Empty payload" }, { status: 400 });

  }



  try {

    const result = await handlePaymentWebhook("cryptomus", rawBody, req.headers);



    if (!result) {

      await logActivity("warn", "cryptomus.webhook_rejected", { ip });

      logWarn("payment_webhook_invalid_signature", { ip });

      return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });

    }



    logInfo("payment_webhook_received", {

      ip,

      orderId: result.orderId,

      status: result.status,

      providerPaymentId: result.providerPaymentId,

      duplicate: result.duplicate ?? false,

    });



    const order = await getOrderById(result.orderId);



    if (result.status === "paid") {

      if (order?.status === "paid" || result.duplicate) {

        await logActivity("warn", "cryptomus.webhook_duplicate", {

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

            payment_method: "cryptomus",

            transaction_id:

              result.providerPaymentId ?? payment.provider_payment_id,

          },

        });

      }



      await handlePaidWebhook(result.orderId);

      await logActivity("info", "cryptomus.webhook_paid", {

        ip,

        orderId: result.orderId,

        transactionId: result.providerPaymentId,

      });

    } else if (result.status === "failed") {

      const payment = await findPaymentByOrderId(result.orderId);

      if (payment && payment.status !== "paid") {

        await updatePaymentRecord(payment.id, { status: "failed" });

      }

      if (order?.status !== "paid") {

        await markOrderFailed(result.orderId);

      }

      await logActivity("warn", "cryptomus.webhook_failed", {

        ip,

        orderId: result.orderId,

      });

    }



    return NextResponse.json({ success: true });

  } catch (error) {

    await logActivity("error", "cryptomus.webhook_error", {

      ip,

      message: error instanceof Error ? error.message : String(error),

    });

    logError("cryptomus_webhook_error", error, { ip });

    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });

  }

}


