import nextDynamic from "next/dynamic";
import Link from "next/link";
import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import AdminSectionErrorBoundary from "@/components/admin/AdminSectionErrorBoundary";
import AutopilotIntelligence from "@/components/admin/AutopilotIntelligence";
import DataDegradedBanner from "@/components/admin/DataDegradedBanner";
import { loadDashboardData } from "@/lib/admin/safe-data";

const chartFallback = <div className="mt-6 h-72 animate-pulse rounded-lg bg-white/5" />;
const DashboardCharts = nextDynamic(() => import("@/components/admin/DashboardCharts"), {
  loading: () => chartFallback,
});
const AdvancedCharts = nextDynamic(() => import("@/components/admin/charts/AdvancedCharts"), {
  loading: () => chartFallback,
});

export const dynamic = "force-dynamic";
export default async function AdminDashboardPage() {
  const { summary, charts, insights, paymentStats, viral, recentOrders, dataUnavailable } =
    await loadDashboardData();

  const orderStats = insights?.orderStats ?? {
    pendingOrders: 0,
    pendingRevenue: 0,
    paidOrderCount: 0,
  };
  const ai = insights?.ai ?? {
    predictedRevenueNext7Days: 0,
    inventoryRiskScores: [],
    source: "fallback" as const,
  };
  const lowInventoryAlerts = insights?.lowInventoryAlerts ?? [];
  const topProducts = insights?.topProducts ?? [];
  const viralProducts = viral?.products ?? [];
  const hasPaidHistory = (orderStats.paidOrderCount ?? 0) > 0;
  const hasTrafficData = (summary?.productViews ?? 0) >= 10;
  const conversionDisplay = hasTrafficData
    ? `${summary?.conversionRate ?? 0}%`
    : "—";
  const conversionHint = hasTrafficData
    ? "Paid orders / product views"
    : "Needs more storefront traffic data";

  return (
    <AdminShell title="Dashboard">
      <DataDegradedBanner show={dataUnavailable} />

      <p className="mb-4 text-sm text-zinc-600">
        Operational metrics below come from Supabase orders and payments. Forecast and
        autopilot sections are estimates only.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Paid Revenue"
          value={`$${(summary?.totalRevenue ?? 0).toFixed(2)}`}
          hint={`${orderStats.paidOrderCount ?? 0} paid orders`}
        />
        <StatCard
          label="Pending Checkout"
          value={`$${(orderStats.pendingRevenue ?? 0).toFixed(2)}`}
          hint={`${orderStats.pendingOrders ?? 0} orders awaiting payment`}
        />
        <StatCard
          label="Total Orders"
          value={String(summary?.totalOrders ?? 0)}
          hint={`${orderStats.pendingOrders ?? 0} pending · ${orderStats.paidOrderCount ?? 0} paid`}
        />
        <StatCard
          label="Conversion Rate"
          value={conversionDisplay}
          hint={conversionHint}
        />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="NOWPayments Paid"
          value={`$${(paymentStats?.cryptomusPaidAmount ?? 0).toFixed(2)}`}
          hint={`${paymentStats?.cryptomusPaid ?? 0} confirmed crypto payments`}
        />
        <StatCard
          label="NOWPayments Pending"
          value={`$${(paymentStats?.nowpaymentsPendingAmount ?? 0).toFixed(2)}`}
          hint={`${paymentStats?.nowpaymentsPending ?? 0} invoices awaiting payment`}
        />
        <StatCard
          label="Manual Payments"
          value={`$${(paymentStats?.manualPaidAmount ?? 0).toFixed(2)}`}
          hint={`${paymentStats?.manualPaid ?? 0} manual payments`}
        />
        <StatCard
          label="Inventory Alerts"
          value={String(lowInventoryAlerts.length)}
          hint="Low or out-of-stock SKUs"
        />
      </div>

      {hasPaidHistory ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="7-Day Forecast (estimate)"
            value={`$${(ai.predictedRevenueNext7Days ?? 0).toLocaleString()}`}
            hint="Based on recent paid order history"
          />
          <StatCard
            label="Est. Monthly Revenue (estimate)"
            value={`$${(insights?.estimatedMonthlyRevenue ?? 0).toLocaleString()}`}
            hint="Heuristic from paid order velocity"
          />
          <StatCard
            label="Viral Signals (estimate)"
            value={String(viralProducts.filter((p) => p.viralScore >= 45).length)}
            hint="Products with rising demand signals"
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Revenue forecasts and viral signals unlock after your first paid order is
          confirmed (via NOWPayments webhook or reconciliation).
        </div>
      )}

      <AutopilotIntelligence hasPaidHistory={hasPaidHistory} />

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <p className="text-sm text-zinc-600">
              Live from Supabase — includes pending checkouts awaiting payment.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-red-600 hover:text-red-700"
          >
            View all orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-zinc-600">No orders recorded yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-200">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-zinc-600">
                    {order.customer?.full_name ?? "Unknown customer"}
                    {order.customer?.email ? ` · ${order.customer.email}` : ""}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(order.created_at).toLocaleString()} · {order.items.length} line
                    {order.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg font-bold">${Number(order.total).toFixed(2)}</p>
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      order.status === "paid"
                        ? "text-green-600"
                        : order.status === "pending"
                          ? "text-amber-600"
                          : "text-zinc-600"
                    }`}
                  >
                    {order.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminSectionErrorBoundary title="Dashboard charts">
        <DashboardCharts data={charts} />
      </AdminSectionErrorBoundary>

      <AdminSectionErrorBoundary title="Advanced analytics charts">
        <AdvancedCharts />
      </AdminSectionErrorBoundary>

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
