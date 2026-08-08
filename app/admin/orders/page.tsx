import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { listPlacedOrders } from "@/lib/db/orders";
import { findPaymentsByOrderIds } from "@/lib/db/payments";

export const dynamic = "force-dynamic";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function formatPaymentMethod(provider: string, metadata: Record<string, unknown> | null) {
  if (provider === "nowpayments") return "NOWPayments";
  if (metadata?.mode === "manual_pending") return "Manual (pending)";
  return "Manual fallback";
}

const STATUS_BADGE = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize";

export default async function AdminOrdersPage() {
  const orders = await listPlacedOrders();
  const payments = await findPaymentsByOrderIds(orders.map((order) => order.id));

  return (
    <AdminShell title="Order Management">
      {orders.length === 0 ? (
        <p className="text-sm text-zinc-600">No placed orders yet. Abandoned or expired checkouts are hidden.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const payment = payments.get(order.id);
            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-red-300"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-mono text-sm font-medium text-zinc-900">{order.order_number}</p>
                    {payment ? (
                      <p className="text-xs text-zinc-500">
                        {formatPaymentMethod(payment.provider, payment.metadata)} · {payment.status}
                      </p>
                    ) : null}
                    {order.customer ? (
                      <p className="text-xs text-zinc-600">
                        {order.customer.full_name} · {order.customer.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                    <p className="text-base font-bold text-zinc-900">${Number(order.total).toFixed(2)}</p>
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      <span className={`${STATUS_BADGE} bg-blue-50 text-blue-700`}>
                        {order.order_status.replace(/_/g, " ")}
                      </span>
                      <span className={`${STATUS_BADGE} bg-amber-50 text-amber-700`}>
                        {order.shipping_status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <ul className="mt-3 space-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-600">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-4">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-2 text-[11px] text-zinc-400">{formatTime(order.created_at)}</p>
              </Link>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
