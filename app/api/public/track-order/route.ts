import { NextResponse } from "next/server";
import { getOrderByNumber, listOrderEvents } from "@/lib/db/orders";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Customer-facing order lookup by the short public order number, never the
 * internal UUID. Optional email must match the order's customer, otherwise
 * this returns 404 -- same response as a genuinely unknown order number, so
 * it never confirms/denies that a given order number exists.
 */
export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Order tracking unavailable" }, { status: 503 });
  }

  const url = new URL(req.url);
  const orderNumber = url.searchParams.get("orderId")?.trim();
  const email = url.searchParams.get("email")?.trim() || undefined;

  if (!orderNumber) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  try {
    const order = await getOrderByNumber(orderNumber, email);
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const events = await listOrderEvents(order.id);
    const timeline = events
      .filter((event) => event.customer_visible)
      .map((event) => ({
        type: event.event_type,
        value: event.to_value,
        createdAt: event.created_at,
      }));

    return NextResponse.json(
      {
        orderNumber: order.order_number,
        createdAt: order.created_at,
        total: Number(order.total),
        orderStatus: order.order_status,
        shippingStatus: order.shipping_status,
        carrier: order.carrier,
        trackingNumber: order.tracking_number,
        estimatedDeliveryStart: order.estimated_delivery_start,
        estimatedDeliveryEnd: order.estimated_delivery_end,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image,
        })),
        timeline,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
