import { NextResponse } from "next/server";
import { getOrderStatusSummaryById } from "@/lib/db/orders";

export const dynamic = "force-dynamic";

// Status + total lookup for the success-page poll. Order ids are unguessable
// UUIDs and only the status and the buyer's own order total are returned, so
// no PII is exposed.
export async function GET(req: Request) {
  const orderId = new URL(req.url).searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const summary = await getOrderStatusSummaryById(orderId);

  if (!summary) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    { status: summary.status, total: summary.total },
    { headers: { "Cache-Control": "no-store" } }
  );
}
