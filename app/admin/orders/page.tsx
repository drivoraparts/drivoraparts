export const runtime = 'edge';

import AdminShell from "@/components/admin/AdminShell";
import OrderStatusControl from "@/components/admin/OrderStatusControl";
import { listOrders } from "@/lib/db/orders";
import { findPaymentsByOrderIds } from "@/lib/db/payments";

export const dynamic = "force-dynamic";
function formatTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function formatPaymentMethod(provider: string, metadata: Record<string, unknown> | null) {
  if (provider === "cryptomus") return "Cryptomus";
  if (metadata?.mode === "manual_pending") return "Manual (pending)";
  return "Manual fallback";
}

export default async function AdminOrdersPage() {
  const orders = await listOrders();
  const payments = await findPaymentsByOrderIds(orders.map((order) => order.id));

  return (
    <AdminShell title="Order Management">
      {orders.length === 0 ? (
        <p className="text-zinc-600">No orders recorded yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const payment = payments.get(order.id);
            return (
              <article
                key={order.id}
                className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6"
              >
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-zinc-600">Order ID</p>
                      <p className="font-mono text-sm">{order.id}</p>
                    </div>
                    {payment ? (
                      <p className="text-xs text-zinc-600">
                        Payment: {formatPaymentMethod(payment.provider, payment.metadata)}{" "}
                        · {payment.status}
                      </p>
                    ) : null}
                    {order.customer ? (
                      <div className="text-sm text-zinc-600">
                        <p>{order.customer.full_name}</p>
                        <p>{order.customer.email}</p>
                        {order.customer.phone ? <p>{order.customer.phone}</p> : null}
                        {order.customer.shipping_address ? (
                          <p>{order.customer.shipping_address}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold">${Number(order.total).toFixed(2)}</p>
                    <div className="mt-2">
                      <OrderStatusControl orderId={order.id} currentStatus={order.status} />
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 border-t border-zinc-200 pt-4 text-sm">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between gap-4"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-xs text-gray-500">{formatTime(order.created_at)}</p>
              </article>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
