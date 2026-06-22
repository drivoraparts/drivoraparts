import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { getInventoryAlerts, getInventoryStats, listInventory } from "@/lib/db/inventory";
import { getProductById } from "@/lib/inventory";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function AdminInventoryPage() {
  const [stats, alerts, inventory] = await Promise.all([
    getInventoryStats(),
    getInventoryAlerts(),
    listInventory(100),
  ]);

  return (
    <AdminShell title="Inventory Analytics">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total SKUs" value={String(stats.totalSkus)} />
        <StatCard label="Total Units" value={String(stats.totalUnits)} />
        <StatCard label="Low Stock" value={String(stats.lowStock)} hint="At or below threshold" />
        <StatCard label="Out of Stock" value={String(stats.outOfStock)} />
      </div>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-4 text-xl font-bold">Alerts</h2>
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-400">No inventory alerts.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {alerts.slice(0, 20).map((alert) => (
              <li key={alert.productId} className="flex justify-between gap-4">
                <span>{alert.productName}</span>
                <span className={alert.severity === "out" ? "text-red-400" : "text-yellow-300"}>
                  {alert.severity === "out" ? "OUT" : "LOW"} — {alert.quantity} units
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-4 text-xl font-bold">Lowest Stock Levels</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 text-gray-400">
              <tr>
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">Qty</th>
                <th className="pb-3">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {inventory.slice(0, 30).map((row) => (
                <tr key={row.product_id} className="border-b border-white/5">
                  <td className="py-3 pr-4">
                    {getProductById(row.product_id)?.name ?? `Product #${row.product_id}`}
                  </td>
                  <td className="py-3 pr-4">{row.quantity}</td>
                  <td className="py-3">{row.low_stock_threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
