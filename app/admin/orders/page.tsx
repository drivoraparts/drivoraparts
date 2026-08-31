import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import StatusPill, { SpinnerIcon } from "@/components/admin/StatusPill";
import { listPlacedOrders } from "@/lib/db/orders";
import { findPaymentsByOrderIds } from "@/lib/db/payments";

export const dynamic = "force-dynamic";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString();
}

export default async function AdminOrdersPage() {
  const orders = await listPlacedOrders();
  const payments = await findPaymentsByOrderIds(orders.map((order) => order.id));

  return (
    <AdminShell title="Order Management">
      {orders.length === 0 ? (
        <p className="text-sm text-zinc-600">No placed orders yet. Abandoned or expired checkouts are hidden.</p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const payment = payments.get(order.id);
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <div
                key={order.id}
                className="flex items-stretch gap-2 rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-accent-border"
              >
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex min-w-0 flex-1 flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-mono text-sm font-medium text-zinc-900">{order.order_number}</p>
                    {order.customer ? (
                      <p className="truncate text-xs text-zinc-500">
                        {order.customer.full_name} · {order.customer.email}
                      </p>
                    ) : null}
                    <p className="text-[11px] text-zinc-400">
                      {itemCount} item{itemCount === 1 ? "" : "s"} · {formatTime(order.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:shrink-0">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <StatusPill value={order.control_status} />
                      {payment ? <StatusPill value={payment.status} /> : null}
                      <StatusPill value={order.order_status} />
                      <StatusPill value={order.shipping_status} />
                      {order.shipping_hold_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                          <SpinnerIcon />
                          On Hold
                        </span>
                      ) : null}
                    </div>
                    <p className="w-20 shrink-0 text-right text-sm font-bold text-zinc-900">
                      ${Number(order.total).toFixed(2)}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center pr-2">
                  <DeleteOrderButton orderId={order.id} orderNumber={order.order_number} compact />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
