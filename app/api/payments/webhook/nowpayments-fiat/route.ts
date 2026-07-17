import { NextResponse } from "next/server";

import { verifyNowPaymentsWebhookSignature } from "@/lib/payments/nowpayments/client";
import { getNowPaymentsFiatIpnSecret } from "@/lib/env";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";

/**
 * Placeholder for the NOWPayments fiat/Banxa on-ramp account (separate from
 * the main crypto account's webhook). Verifies and logs notifications only
 * — not wired into order fulfillment yet, since there's no fiat checkout
 * flow generating orders for it to match against. Wire this into
 * lib/checkout/service.ts once the fiat flow is actually built.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const ip = getClientIp(req);

  if (!rawBody) {
    await logActivity("warn", "nowpayments_fiat.webhook_empty_body", { ip });
    return NextResponse.json({ error: "Empty payload" }, { status: 400 });
  }

  const signature = req.headers.get("x-nowpayments-sig");
  const valid = verifyNowPaymentsWebhookSignature(
    rawBody,
    signature,
    getNowPaymentsFiatIpnSecret()
  );

  if (!valid) {
    await logActivity("warn", "nowpayments_fiat.webhook_invalid_signature", { ip });
    return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
  }

  await logActivity("info", "nowpayments_fiat.webhook_received", {
    ip,
    body: rawBody.slice(0, 2000),
  });

  return NextResponse.json({ success: true });
}
