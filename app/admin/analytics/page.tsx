import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { getAnalyticsSummary } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function AdminAnalyticsPage() {
  const summary = await getAnalyticsSummary();

  return (
    <AdminShell title="Sales Analytics">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Product Views" value={String(summary.productViews)} />
        <StatCard label="Cart Adds" value={String(summary.cartAdds)} />
        <StatCard label="Checkouts Started" value={String(summary.checkoutCount)} />
        <StatCard label="Orders Completed" value={String(summary.totalOrders)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="mb-4 text-xl font-bold">Top Viewed Products</h2>
          <ul className="space-y-2 text-sm">
            {summary.topViewedProducts.map((product) => (
              <li key={product.productId} className="flex justify-between">
                <span>{product.productName}</span>
                <span>{product.count} views</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="mb-4 text-xl font-bold">Top Cart Products</h2>
          <ul className="space-y-2 text-sm">
            {summary.topCartProducts.map((product) => (
              <li key={product.productId} className="flex justify-between">
                <span>{product.productName}</span>
                <span>{product.count} adds</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-4 text-xl font-bold">Recent Events</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 text-gray-400">
              <tr>
                <th className="pb-3 pr-4">Event</th>
                <th className="pb-3 pr-4">Payload</th>
                <th className="pb-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentEvents.map((event) => (
                <tr key={event.id} className="border-b border-white/5">
                  <td className="py-3 pr-4">{event.name}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-gray-400">
                    {JSON.stringify(event.payload).slice(0, 120)}
                  </td>
                  <td className="py-3 text-gray-400">
                    {new Date(event.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
