import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { getInsightsReport } from "@/lib/insights/engine";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function AdminInsightsPage() {
  const insights = await getInsightsReport();

  return (
    <AdminShell title="AI Insights">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Est. Monthly Revenue"
          value={`$${insights.estimatedMonthlyRevenue.toLocaleString()}`}
        />
        <StatCard
          label="7-Day Forecast"
          value={`$${insights.ai.predictedRevenueNext7Days.toLocaleString()}`}
        />
        <StatCard
          label="Conversion Estimate"
          value={`${insights.conversionEstimate}%`}
        />
        <StatCard
          label="Inventory Risk"
          value={String(insights.ai.inventoryRiskScores.length)}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="mb-4 text-xl font-bold">Top Products</h2>
          <ul className="space-y-2 text-sm">
            {insights.topProducts.map((product) => (
              <li key={product.productId} className="flex justify-between gap-4">
                <span>{product.name}</span>
                <span className="text-gray-400">
                  {product.views} views · {product.cartAdds} carts
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="mb-4 text-xl font-bold">Slow Products</h2>
          <ul className="space-y-2 text-sm">
            {insights.slowProducts.length === 0 ? (
              <li className="text-gray-400">No slow movers detected.</li>
            ) : (
              insights.slowProducts.map((product) => (
                <li key={product.productId} className="flex justify-between gap-4">
                  <span>{product.name}</span>
                  <span className="text-gray-400">{product.views} views</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-4 text-xl font-bold">Customer Trends</h2>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-gray-400">Total customers</p>
            <p className="text-2xl font-bold">{insights.customerTrends.totalCustomers}</p>
          </div>
          <div>
            <p className="text-gray-400">New in 30 days</p>
            <p className="text-2xl font-bold">{insights.customerTrends.newCustomers30d}</p>
          </div>
          <div>
            <p className="text-gray-400">Repeat rate estimate</p>
            <p className="text-2xl font-bold">{insights.customerTrends.repeatRateEstimate}%</p>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
