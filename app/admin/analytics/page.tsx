import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { getAnalyticsSummary } from "@/lib/analytics";

export const runtime = "edge";

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

export default function AdminAnalyticsPage() {
  const summary = getAnalyticsSummary();

  return (
    <AdminShell title="Analytics">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Product Views" value={String(summary.productViews)} />
        <StatCard label="Add to Cart" value={String(summary.cartAdds)} />
        <StatCard label="Checkout Starts" value={String(summary.checkoutCount)} />
        <StatCard label="Orders Completed" value={String(summary.totalOrders)} />
        <StatCard
          label="Revenue"
          value={`$${summary.totalRevenue.toFixed(2)}`}
        />
        <StatCard
          label="Conversion"
          value={`${summary.conversionRate}%`}
          hint="Ready for timeline charts and Cryptomus payment tracking"
        />
      </div>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-4 text-xl font-bold">Recent Events</h2>
        {summary.recentEvents.length === 0 ? (
          <p className="text-sm text-gray-400">No analytics events recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-white/10 text-gray-400">
                <tr>
                  <th className="pb-3 pr-4">Event</th>
                  <th className="pb-3 pr-4">Details</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium">{event.name}</td>
                    <td className="py-3 pr-4 text-gray-300">
                      {JSON.stringify(event.payload)}
                    </td>
                    <td className="py-3 text-gray-400">
                      {formatTime(event.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
