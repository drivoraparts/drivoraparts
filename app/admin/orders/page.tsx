import AdminShell from "@/components/admin/AdminShell";
import { getOrders } from "@/lib/marketplace";

export const runtime = "edge";

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

export default function AdminOrdersPage() {
  const orders = [...getOrders()].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <AdminShell title="Orders">
      {orders.length === 0 ? (
        <p className="text-gray-400">No orders recorded yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-lg border border-white/10 bg-white/[0.06] p-6"
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">Order ID</p>
                  <p className="font-mono text-sm">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
                  <p className="text-sm capitalize text-gray-400">{order.status}</p>
                </div>
              </div>

              <ul className="space-y-2 border-t border-white/10 pt-4 text-sm">
                {order.items.map((item) => (
                  <li
                    key={`${order.id}-${item.productId}`}
                    className="flex justify-between gap-4"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs text-gray-500">
                {formatTime(order.createdAt)}
              </p>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
