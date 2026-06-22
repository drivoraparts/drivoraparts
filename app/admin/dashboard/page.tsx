import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import DashboardCharts from "@/components/admin/DashboardCharts";
import { getAnalyticsSummary, getDashboardChartData } from "@/lib/analytics";

export const runtime = "edge";

export default function AdminDashboardPage() {
  const summary = getAnalyticsSummary();
  const charts = getDashboardChartData();

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={`$${summary.totalRevenue.toFixed(2)}`}
          hint="From completed orders"
        />
        <StatCard
          label="Total Orders"
          value={String(summary.totalOrders)}
          hint="All recorded orders"
        />
        <StatCard
          label="Conversion Rate"
          value={`${summary.conversionRate}%`}
          hint="Orders / product views"
        />
        <StatCard
          label="Product Views"
          value={String(summary.productViews)}
          hint={`${summary.cartAdds} cart adds · ${summary.checkoutCount} checkouts`}
        />
      </div>

      <DashboardCharts data={charts} />
    </AdminShell>
  );
}
