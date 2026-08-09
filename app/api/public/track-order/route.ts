import { NextResponse } from "next/server";
import { getOrderById, getOrderByNumber, listOrderEvents, type OrderWithDetails } from "@/lib/db/orders";
import { findPaymentByAnyProviderId, findPaymentByOrderId } from "@/lib/db/payments";
import { isSupabaseConfigured } from "@/lib/env";
import { getProductById } from "@/lib/inventory";
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

    const [events, payment] = await Promise.all([
      listOrderEvents(order.id),
      findPaymentByOrderId(order.id),
    ]);
    const view = buildCustomerTrackingView(order, events, payment?.status ?? null);
    const timeline = events
      .filter((event) => event.customer_visible)
      .map((event) => ({
        type: event.event_type,
        value: event.to_value,
        createdAt: event.created_at,
      }));

    // Fitment/part number/weight live on the current catalog listing, not a
    // per-order snapshot -- looked up live by product_id. Real data about
    // the product as it exists today; never fabricated for missing fields.
    const items = order.items.map((item) => {
      const product = getProductById(item.product_id);
      return {
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        lineTotal: Number(item.price) * item.quantity,
        partNumber: product?.partNumber ?? null,
        fitment: product?.fitment ?? null,
      };
    });

    // Only surface a shipment weight when it's unambiguous: exactly one
    // distinct line, quantity 1, and the catalog has a real weight string
    // for it. Multiple/quantity>1 lines can't be safely summed (weight is
    // free text like "185 lbs (crated)", not a clean number) -- rather than
    // guess, this is left "Pending".
    const singleUnitWeight =
      order.items.length === 1 && order.items[0].quantity === 1
        ? getProductById(order.items[0].product_id)?.weight ?? null
        : null;

    return NextResponse.json(
      {
        orderNumber: order.order_number,
        createdAt: order.created_at,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping),
        headline: view.headline,
        steps: view.steps,
        banner: view.banner,
        notice: view.notice,
        hold: view.hold,
        customerMessage: order.customer_message,
        shipmentDetailsVisible: order.shipment_details_visible,
        items,
        receiver: order.customer
          ? {
              name: order.customer.full_name,
              address: order.customer.shipping_address,
              phone: order.customer.phone,
            }
          : null,
        shipment: {
          weight: singleUnitWeight,
          carrier: order.carrier,
          trackingNumber: order.tracking_number,
          origin: order.shipment_origin,
          destination: order.shipment_destination,
          currentLocation: order.shipment_current_location,
          currentLocationUpdatedAt: order.shipment_current_location_updated_at,
          estimatedDeliveryStart: order.estimated_delivery_start,
          estimatedDeliveryEnd: order.estimated_delivery_end,
          shipmentType: order.shipment_type,
        },
        timeline,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
