import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import DashboardCharts from "@/components/admin/DashboardCharts";
import AdvancedCharts from "@/components/admin/charts/AdvancedCharts";
import { getAnalyticsSummary, getDashboardChartData } from "@/lib/analytics";
import { getInsightsReport } from "@/lib/insights/engine";
import { getPaymentStats } from "@/lib/db/payments";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function AdminDashboardPage() {
  const [summary, charts, insights, paymentStats] = await Promise.all([
    getAnalyticsSummary(),
    getDashboardChartData(),
    getInsightsReport(),
    getPaymentStats(),
  ]);

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={`$${summary.totalRevenue.toFixed(2)}`}
          hint="From paid orders"
        />
        <StatCard
          label="Total Orders"
          value={String(summary.totalOrders)}
          hint={`${insights.orderStats.pendingOrders} pending`}
        />
        <StatCard
          label="Conversion Rate"
          value={`${summary.conversionRate}%`}
          hint="Paid orders / product views"
        />
        <StatCard
          label="Est. Monthly Revenue"
          value={`$${insights.estimatedMonthlyRevenue.toLocaleString()}`}
          hint="AI projection from recent order velocity"
        />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="7-Day Forecast"
          value={`$${insights.ai.predictedRevenueNext7Days.toLocaleString()}`}
          hint="AI revenue prediction"
        />
        <StatCard
          label="Cryptomus Paid"
          value={`$${paymentStats.cryptomusPaidAmount.toFixed(2)}`}
          hint={`${paymentStats.cryptomusPaid} crypto payments`}
        />
        <StatCard
          label="Manual Fallback"
          value={`$${paymentStats.manualPaidAmount.toFixed(2)}`}
          hint={`${paymentStats.manualPaid} manual payments`}
        />
        <StatCard
          label="Inventory Risk"
          value={String(insights.ai.inventoryRiskScores.filter((r) => r.severity === "high" || r.severity === "critical").length)}
          hint="High/critical SKUs"
        />
      </div>

      <DashboardCharts data={charts} />
      <AdvancedCharts />

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="mb-4 text-xl font-bold">Low Inventory Alerts</h2>
          {insights.lowInventoryAlerts.length === 0 ? (
            <p className="text-sm text-gray-400">No inventory alerts.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {insights.lowInventoryAlerts.slice(0, 6).map((alert) => (
                <li key={alert.productId} className="flex justify-between gap-4">
                  <span>{alert.productName}</span>
                  <span className={alert.severity === "out" ? "text-red-400" : "text-yellow-300"}>
                    {alert.quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="mb-4 text-xl font-bold">Top Products</h2>
          <ul className="space-y-2 text-sm">
            {insights.topProducts.slice(0, 6).map((product) => (
              <li key={product.productId} className="flex justify-between gap-4">
                <span>{product.name}</span>
                <span className="text-gray-400">score {product.score}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AdminShell>
  );
}
