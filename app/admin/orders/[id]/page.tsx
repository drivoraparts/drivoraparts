import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import OrderLifecycleControls from "@/components/admin/OrderLifecycleControls";
import { getOrderById, listOrderEvents } from "@/lib/db/orders";
import { findPaymentByOrderId } from "@/lib/db/payments";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString();
}

const EVENT_LABELS: Record<string, string> = {
  payment_status: "Payment status",
  order_status: "Order status",
  shipping_status: "Shipping status",
  note: "Note",
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const [events, payment] = await Promise.all([
    listOrderEvents(order.id),
    findPaymentByOrderId(order.id),
  ]);

  return (
    <AdminShell title={`Order ${order.order_number}`}>
      <div className="mb-4">
        <Link href="/admin/orders" className="text-xs font-medium text-red-600 hover:text-red-700">
          ← Back to all orders
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Order</p>
                <p className="text-base font-semibold text-zinc-900">{order.order_number}</p>
                <p className="text-xs text-zinc-500">Placed {formatTime(order.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Total</p>
                <p className="text-lg font-bold text-zinc-900">${Number(order.total).toFixed(2)}</p>
              </div>
            </div>

            {order.customer ? (
              <div className="mt-3 border-t border-zinc-100 pt-3 text-sm text-zinc-700">
                <p className="font-medium text-zinc-900">{order.customer.full_name}</p>
                <p className="text-xs text-zinc-600">{order.customer.email}</p>
                {order.customer.phone ? <p className="text-xs text-zinc-600">{order.customer.phone}</p> : null}
                {order.customer.shipping_address ? (
                  <p className="text-xs text-zinc-600">{order.customer.shipping_address}</p>
                ) : null}
              </div>
            ) : null}

            <ul className="mt-3 space-y-1.5 border-t border-zinc-100 pt-3 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Status controls
            </h2>
            <OrderLifecycleControls
              orderId={order.id}
              paymentStatus={payment?.status ?? null}
              orderStatus={order.order_status}
              shippingStatus={order.shipping_status}
              customerMessage={order.customer_message}
              shippingInfo={{
                carrier: order.carrier,
                trackingNumber: order.tracking_number,
                shipmentOrigin: order.shipment_origin,
                shipmentDestination: order.shipment_destination,
                shipmentReference: order.shipment_reference,
                shipmentNotes: order.shipment_notes,
                estimatedDeliveryStart: order.estimated_delivery_start,
                estimatedDeliveryEnd: order.estimated_delivery_end,
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Timeline</p>
          {events.length === 0 ? (
            <p className="mt-2 text-xs text-zinc-500">No events recorded yet.</p>
          ) : (
            <ol className="mt-3 space-y-3 border-l border-zinc-200 pl-3.5">
              {[...events].reverse().map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[18px] top-1 h-2 w-2 rounded-full bg-red-500" />
                  <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                    {EVENT_LABELS[event.event_type] ?? event.event_type}
                  </p>
                  <p className="text-sm text-zinc-900">
                    {event.from_value ? `${event.from_value} → ` : ""}
                    {event.to_value ?? "—"}
                  </p>
                  {event.note ? <p className="mt-0.5 text-xs text-zinc-600">{event.note}</p> : null}
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {formatTime(event.created_at)} · {event.actor}
                    {!event.customer_visible ? " · internal only" : ""}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
