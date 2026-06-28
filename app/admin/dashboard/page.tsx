import nextDynamic from "next/dynamic";
import Link from "next/link";
import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import AdminSectionErrorBoundary from "@/components/admin/AdminSectionErrorBoundary";
import AutopilotIntelligence from "@/components/admin/AutopilotIntelligence";
import DataDegradedBanner from "@/components/admin/DataDegradedBanner";
import { loadDashboardData } from "@/lib/admin/safe-data";

const chartFallback = <div className="mt-6 h-72 animate-pulse rounded-lg bg-zinc-100" />;
const DashboardCharts = nextDynamic(() => import("@/components/admin/DashboardCharts"), {
  loading: () => chartFallback,
});
const AdvancedCharts = nextDynamic(() => import("@/components/admin/charts/AdvancedCharts"), {
  loading: () => chartFallback,
});

export const dynamic = "force-dynamic";

function formatOrderStatus(status: string): string {
  return status.replace(/_/g, " ");
}

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

  const paidOrders = orderStats.paidOrderCount ?? 0;
  const pendingOrders = orderStats.pendingOrders ?? 0;
  const paidRevenue = summary?.totalRevenue ?? 0;
  const pendingRevenue = orderStats.pendingRevenue ?? 0;
  const openCryptoInvoices = paymentStats?.nowpaymentsPending ?? 0;
  const hasPaidHistory = paidOrders > 0;
  const hasTrafficData = (summary?.productViews ?? 0) >= 10;
  const lastOrder = recentOrders[0];

  return (
    <AdminShell title="Dashboard">
      <DataDegradedBanner show={dataUnavailable} />

      <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Store snapshot
            </p>
            <h2 className="mt-1 text-2xl font-bold text-zinc-900">
              {hasPaidHistory
                ? `$${paidRevenue.toFixed(2)} confirmed revenue`
                : "No confirmed sales yet"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
              {hasPaidHistory ? (
                <>
                  {paidOrders} paid order{paidOrders === 1 ? "" : "s"} in Supabase.
                  {pendingOrders > 0
                    ? ` ${pendingOrders} older checkout${pendingOrders === 1 ? "" : "s"} still show as unpaid.`
                    : ""}
                </>
              ) : (
                <>
                  {pendingOrders > 0 ? (
                    <>
                      {pendingOrders} checkout{pendingOrders === 1 ? "" : "s"} were created but{" "}
                      <strong>none have completed payment</strong>. The ${pendingRevenue.toFixed(2)}{" "}
                      pending total is <strong>not revenue</strong> — it is unpaid carts, including
                      tests and abandoned sessions.
                    </>
                  ) : (
                    "No orders in the database yet. Sales metrics stay at zero until a customer pays."
                  )}
                </>
              )}
            </p>
            {lastOrder ? (
              <p className="mt-2 text-xs text-zinc-500">
                Latest order #{lastOrder.id.slice(0, 8).toUpperCase()} ·{" "}
                {new Date(lastOrder.created_at).toLocaleString()} · {lastOrder.status}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Manage orders
            </Link>
            {openCryptoInvoices > 0 ? (
              <span className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
                {openCryptoInvoices} open crypto invoice{openCryptoInvoices === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Recent orders</h2>
            <p className="text-sm text-zinc-600">
              Newest checkouts first — fulfill only orders marked paid.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-red-600 hover:text-red-700"
          >
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-zinc-600">No orders recorded yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-200">
            {recentOrders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono text-sm font-semibold">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {order.customer?.full_name ?? "Unknown customer"}
                    {order.customer?.email ? ` · ${order.customer.email}` : ""}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(order.created_at).toLocaleString()} · {order.items.length} item
                    {order.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg font-bold">${Number(order.total).toFixed(2)}</p>
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      order.status === "paid"
                        ? "text-green-700"
                        : order.status === "pending"
                          ? "text-amber-700"
                          : "text-zinc-600"
                    }`}
                  >
                    {formatOrderStatus(order.status)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Confirmed revenue"
          value={`$${paidRevenue.toFixed(2)}`}
          hint={`${paidOrders} paid order${paidOrders === 1 ? "" : "s"} only`}
        />
        <StatCard
          label="Unpaid checkouts"
          value={String(pendingOrders)}
          hint={
            pendingOrders > 0
              ? `$${pendingRevenue.toFixed(2)} if all paid — not booked revenue`
              : "No open unpaid orders"
          }
        />
        <StatCard
          label="Crypto invoices open"
          value={String(openCryptoInvoices)}
          hint={
            openCryptoInvoices > 0
              ? `$${(paymentStats?.nowpaymentsPendingAmount ?? 0).toFixed(2)} on NOWPayments`
              : "No pending NOWPayments invoices"
          }
        />
        <StatCard
          label="Inventory alerts"
          value={String(lowInventoryAlerts.length)}
          hint="Low or out-of-stock SKUs"
        />
      </div>

      {hasTrafficData ? (
        <div className="mt-6">
          <StatCard
            label="Conversion rate"
            value={`${summary?.conversionRate ?? 0}%`}
            hint="Paid orders ÷ product views (storefront analytics)"
          />
        </div>
      ) : null}

      {!hasPaidHistory ? (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          <p className="font-semibold text-zinc-900">Charts and forecasts are hidden until you have paid orders.</p>
          <p className="mt-2">
            After a customer completes payment on NOWPayments, the webhook or reconciliation job
            marks the order paid — then revenue charts and forecasts appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="7-day forecast (estimate)"
              value={`$${(ai.predictedRevenueNext7Days ?? 0).toLocaleString()}`}
              hint="Based on recent paid order history"
            />
            <StatCard
              label="Est. monthly revenue (estimate)"
              value={`$${(insights?.estimatedMonthlyRevenue ?? 0).toLocaleString()}`}
              hint="Heuristic from paid order velocity"
            />
            <StatCard
              label="Viral signals (estimate)"
              value={String(viralProducts.filter((p) => p.viralScore >= 45).length)}
              hint="Products with rising demand signals"
            />
          </div>

          <AdminSectionErrorBoundary title="Dashboard charts">
            <DashboardCharts data={charts} />
          </AdminSectionErrorBoundary>

          <AdminSectionErrorBoundary title="Advanced analytics charts">
            <AdvancedCharts />
          </AdminSectionErrorBoundary>
        </>
      )}

      <AutopilotIntelligence hasPaidHistory={hasPaidHistory} />

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Low inventory</h2>
          {lowInventoryAlerts.length === 0 ? (
            <p className="text-sm text-zinc-600">No inventory alerts.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lowInventoryAlerts.slice(0, 6).map((alert) => (
                <li key={alert.productId} className="flex justify-between gap-4">
                  <span>{alert.productName}</span>
                  <span
                    className={
                      alert.severity === "out" ? "font-semibold text-red-600" : "text-amber-700"
                    }
                  >
                    {alert.quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Top products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-zinc-600">No product ranking data yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {topProducts.slice(0, 6).map((product) => (
                <li key={product.productId} className="flex justify-between gap-4">
                  <span>{product.name}</span>
                  <span className="text-zinc-600">{product.views} views · {product.cartAdds} carts</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
