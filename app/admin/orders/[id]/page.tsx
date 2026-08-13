import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import OrderLifecycleControls from "@/components/admin/OrderLifecycleControls";
import StatusPill, { SpinnerIcon } from "@/components/admin/StatusPill";
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
  control_status: "Control status",
  order_status: "Order processing",
  shipping_status: "Shipping status",
  shipment_hold: "Shipment hold",
  note: "Note",
};

function SummaryTile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-zinc-200 bg-white p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

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
      <div className="mb-3 flex items-center justify-between">
        <Link href="/admin/orders" className="text-xs font-medium text-red-600 hover:text-red-700">
          ← Back to all orders
        </Link>
        <DeleteOrderButton orderId={order.id} orderNumber={order.order_number} redirectTo="/admin/orders" />
      </div>

      <div className="mb-3 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
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

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryTile label="Customer">
          <p className="truncate text-sm font-semibold text-zinc-900">{order.customer?.full_name ?? "—"}</p>
          <p className="truncate text-xs text-zinc-500">{order.customer?.email ?? ""}</p>
        </SummaryTile>
        <SummaryTile label="Control">
          <StatusPill value={order.control_status} />
        </SummaryTile>
        <SummaryTile label="Payment">
          <StatusPill value={payment?.status ?? "pending"} />
        </SummaryTile>
        <SummaryTile label="Order Processing">
          <StatusPill value={order.order_status} />
        </SummaryTile>
        <SummaryTile label="Shipping">
          <StatusPill value={order.shipping_status} />
          {order.shipping_hold_active ? (
            <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
              <SpinnerIcon className="h-2 w-2" />
              On Hold
            </span>
          ) : null}
        </SummaryTile>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* min-w-0, like SummaryTile above: without it this column is sized to
            its min-content -- which the selects and long strings inside drag
            wider than the shell -- and every card below ends up hanging past
            the right edge that the summary tiles line up against. */}
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Products</p>
            <ul className="mt-2.5 space-y-2.5">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-md border border-zinc-200 object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-md border border-zinc-200 bg-zinc-50" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-zinc-900">{item.name}</p>
                    <p className="text-xs text-zinc-500">
                      Qty {item.quantity} · ${Number(item.price).toFixed(2)} each
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-zinc-900">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
            {order.customer?.shipping_address ? (
              <p className="mt-3 border-t border-zinc-100 pt-2.5 text-xs text-zinc-500">
                Ship to: {order.customer.shipping_address}
                {order.customer.phone ? ` · ${order.customer.phone}` : ""}
              </p>
            ) : null}
          </div>

          <div>
            <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Status controls
            </h2>
            <OrderLifecycleControls
              orderId={order.id}
              paymentStatus={payment?.status ?? null}
              controlStatus={order.control_status}
              orderStatus={order.order_status}
              shippingStatus={order.shipping_status}
              customerMessage={order.customer_message}
              shipmentDetailsVisible={order.shipment_details_visible}
              shipmentFieldVisibility={order.shipment_field_visibility ?? {}}
              shippingInfo={{
                carrier: order.carrier,
                trackingNumber: order.tracking_number,
                shipmentOrigin: order.shipment_origin,
                shipmentDestination: order.shipment_destination,
                shipmentReference: order.shipment_reference,
                shipmentNotes: order.shipment_notes,
                shipmentType: order.shipment_type,
                currentLocation: order.shipment_current_location,
                estimatedDeliveryStart: order.estimated_delivery_start,
                estimatedDeliveryEnd: order.estimated_delivery_end,
              }}
              shippingHold={{
                active: order.shipping_hold_active,
                reason: order.shipping_hold_reason,
                note: order.shipping_hold_note,
                updatedAt: order.shipping_hold_updated_at,
              }}
            />
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
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
