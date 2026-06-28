import { NextResponse } from "next/server";
import { findPaymentByProviderId } from "@/lib/db/payments";
import { getOrderStatusSummaryById } from "@/lib/db/orders";
import { isSupabaseConfigured } from "@/lib/env";
import { fetchNowPaymentsOrderId } from "@/lib/payments/nowpayments/client";

export const dynamic = "force-dynamic";

async function resolveOrderId(
  orderId: string | null,
  npPaymentId: string | null
): Promise<string | null> {
  if (orderId) return orderId;
  if (!npPaymentId) return null;

  const payment = await findPaymentByProviderId("nowpayments", npPaymentId);
  if (payment?.order_id) return payment.order_id;

  return fetchNowPaymentsOrderId(npPaymentId);
}

// Status + total lookup for the success-page poll. Order ids are unguessable
// UUIDs and only the status and the buyer's own order total are returned, so
// no PII is exposed.
export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Order tracking unavailable" },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const orderId = await resolveOrderId(
    url.searchParams.get("orderId"),
    url.searchParams.get("NP_id")
  );

  if (!orderId) {
    return NextResponse.json({ error: "orderId or NP_id required" }, { status: 400 });
  }

  try {
    const summary = await getOrderStatusSummaryById(orderId);

    if (!summary) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      { status: summary.status, total: summary.total, orderId },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
