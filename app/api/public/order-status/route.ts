import { NextResponse } from "next/server";
import {
  findPaymentByOrderId,
  findPaymentByProviderId,
} from "@/lib/db/payments";
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

/*
 * Status lookup for the success-page poll.
 *
 * Returns the payment's own status alongside the order's, because the two
 * answer different questions: the order says whether the sale is complete, the
 * payment says whether the customer got as far as paying. Without the second,
 * a customer who backed out of NOWPayments and one whose payment is still
 * confirming look identical, and the page can only sit on "confirming" for
 * both.
 *
 * Also returns the stored invoice URL so the customer can be sent back into
 * the payment session they already have, rather than starting a second one.
 *
 * Order ids are unguessable UUIDs, and this exposes only the buyer's own
 * status, total and invoice link — no PII.
 */
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

  /*
   * Anything that is not a UUID cannot be an order id, and Postgres rejects it
   * with 22P02 rather than returning no rows -- which surfaced as a 500 for
   * anyone who edited the id in the address bar. Answer 404, identical to a
   * well-formed id that does not exist, so the response never distinguishes
   * "malformed", "not yours" and "no such order".
   */
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const summary = await getOrderStatusSummaryById(orderId);

    if (!summary) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Best-effort: a missing payment record must not fail the status lookup,
    // it just means we cannot offer to resume an invoice.
    const payment = await findPaymentByOrderId(orderId).catch(() => null);

    return NextResponse.json(
      {
        status: summary.status,
        total: summary.total,
        orderId,
        orderNumber: summary.orderNumber,
        items: summary.items,
        paymentStatus: payment?.status ?? null,
        paymentUrl: payment?.payment_url ?? null,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
