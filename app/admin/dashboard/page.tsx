import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import DashboardCharts from "@/components/admin/DashboardCharts";
import AdvancedCharts from "@/components/admin/charts/AdvancedCharts";
import AutopilotIntelligence from "@/components/admin/AutopilotIntelligence";
import DataDegradedBanner from "@/components/admin/DataDegradedBanner";
import { loadDashboardData } from "@/lib/admin/safe-data";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function AdminDashboardPage() {
  const { summary, charts, insights, paymentStats, viral, dataUnavailable } =
    await loadDashboardData();

  const orderStats = insights?.orderStats ?? {
    pendingOrders: 0,
  };
  const ai = insights?.ai ?? {
    predictedRevenueNext7Days: 0,
    inventoryRiskScores: [],
  };
  const lowInventoryAlerts = insights?.lowInventoryAlerts ?? [];
  const topProducts = insights?.topProducts ?? [];
  const viralProducts = viral?.products ?? [];

  return (
    <AdminShell title="Dashboard">
      <DataDegradedBanner show={dataUnavailable} />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={`$${(summary?.totalRevenue ?? 0).toFixed(2)}`}
          hint="From paid orders"
        />
        <StatCard
          label="Total Orders"
          value={String(summary?.totalOrders ?? 0)}
          hint={`${orderStats.pendingOrders ?? 0} pending`}
        />
        <StatCard
          label="Conversion Rate"
          value={`${summary?.conversionRate ?? 0}%`}
          hint="Paid orders / product views"
        />
        <StatCard
          label="Est. Monthly Revenue"
          value={`$${(insights?.estimatedMonthlyRevenue ?? 0).toLocaleString()}`}
          hint="AI projection from recent order velocity"
        />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="7-Day Forecast"
          value={`$${(ai.predictedRevenueNext7Days ?? 0).toLocaleString()}`}
          hint="AI revenue prediction"
        />
        <StatCard
          label="Cryptomus Paid"
          value={`$${(paymentStats?.cryptomusPaidAmount ?? 0).toFixed(2)}`}
          hint={`${paymentStats?.cryptomusPaid ?? 0} crypto payments`}
        />
        <StatCard
          label="Manual Fallback"
          value={`$${(paymentStats?.manualPaidAmount ?? 0).toFixed(2)}`}
          hint={`${paymentStats?.manualPaid ?? 0} manual payments`}
        />
        <StatCard
          label="Inventory Risk"
          value={String(
            (ai.inventoryRiskScores ?? []).filter(
              (r) => r.severity === "high" || r.severity === "critical"
            ).length
          )}
          hint="High/critical SKUs"
        />
        <StatCard
          label="Viral Signals"
          value={String(viralProducts.filter((p) => p.viralScore >= 45).length)}
          hint="Products with rising demand"
        />
      </div>

      <AutopilotIntelligence />

      <DashboardCharts data={charts} />
      <AdvancedCharts />

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-xl font-bold">Low Inventory Alerts</h2>
          {lowInventoryAlerts.length === 0 ? (
            <p className="text-sm text-zinc-600">No inventory alerts.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lowInventoryAlerts.slice(0, 6).map((alert) => (
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

        <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-xl font-bold">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-zinc-600">No product ranking data yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {topProducts.slice(0, 6).map((product) => (
                <li key={product.productId} className="flex justify-between gap-4">
                  <span>{product.name}</span>
                  <span className="text-zinc-600">score {product.score}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
