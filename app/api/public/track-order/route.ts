import { NextResponse } from "next/server";
import { getOrderById, getOrderByNumber, listOrderEvents, type OrderWithDetails } from "@/lib/db/orders";
import { findPaymentByAnyProviderId } from "@/lib/db/payments";
import { isSupabaseConfigured } from "@/lib/env";
import { buildCustomerTrackingView } from "@/lib/tracking/customer-view";

export const dynamic = "force-dynamic";

function emailMatches(order: OrderWithDetails, email?: string): boolean {
  if (!email) return true;
  return (order.customer?.email ?? "").toLowerCase() === email.trim().toLowerCase();
}

/**
 * Resolve either the short public order number (e.g. "DRV-7K2QX9F") or a
 * payment/transaction ID the customer may have instead. Never the internal
 * UUID. Optional email must match the order's customer, otherwise this
 * returns null -- same as a genuinely unknown identifier, so it never
 * confirms/denies that a given order or payment id exists.
 */
async function resolveOrder(identifier: string, email?: string): Promise<OrderWithDetails | null> {
  const byOrderNumber = await getOrderByNumber(identifier, email);
  if (byOrderNumber) return byOrderNumber;

  const payment = await findPaymentByAnyProviderId(identifier);
  if (!payment) return null;

  const byPaymentId = await getOrderById(payment.order_id);
  if (!byPaymentId || !emailMatches(byPaymentId, email)) return null;

  return byPaymentId;
}

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Order tracking unavailable" }, { status: 503 });
  }

  const url = new URL(req.url);
  const identifier = url.searchParams.get("orderId")?.trim();
  const email = url.searchParams.get("email")?.trim() || undefined;

  if (!identifier) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  try {
    const order = await resolveOrder(identifier, email);
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const events = await listOrderEvents(order.id);
    const view = buildCustomerTrackingView(order, events);
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
        headline: view.headline,
        steps: view.steps,
        banner: view.banner,
        notice: view.notice,
        customerMessage: order.customer_message,
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
