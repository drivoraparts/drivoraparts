import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { getForecastReport } from "@/lib/ai-forecast";

export const dynamic = "force-dynamic";
export const runtime = "edge";

function riskClass(risk: string) {
  if (risk === "high") return "text-red-400";
  if (risk === "medium") return "text-yellow-300";
  return "text-green-400";
}

function trendClass(trend: string) {
  if (trend === "rising") return "text-green-400";
  if (trend === "falling") return "text-red-400";
  return "text-zinc-600";
}

export default async function AdminForecastPage() {
  const report = await getForecastReport();
  const highRiskCount = report.stockRisks.filter((item) => item.risk === "high").length;
  const risingCount = report.demandPredictions.filter(
    (item) => item.trend === "rising"
  ).length;

  return (
    <AdminShell title="AI Forecast">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tracked Products"
          value={String(report.salesForecasts.length)}
          hint="Products with analytics signals"
        />
        <StatCard
          label="High Stock Risk"
          value={String(highRiskCount)}
          hint="Needs attention soon"
        />
        <StatCard
          label="Rising Demand"
          value={String(risingCount)}
          hint="Momentum-based trend detection"
        />
        <StatCard
          label="Trending Engines"
          value={String(report.trendingEngines.length)}
          hint="Engine platforms gaining traction"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-xl font-bold">Sales Forecast (30 days)</h2>
          {report.salesForecasts.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No forecast data yet. Analytics events will populate predictions.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-zinc-200 text-zinc-600">
                  <tr>
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">7d</th>
                    <th className="pb-3 pr-4">30d</th>
                    <th className="pb-3 pr-4">Revenue</th>
                    <th className="pb-3">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {report.salesForecasts.slice(0, 10).map((item) => (
                    <tr key={item.productId} className="border-b border-zinc-100">
                      <td className="py-3 pr-4">{item.productName}</td>
                      <td className="py-3 pr-4">{item.forecast7d}</td>
                      <td className="py-3 pr-4">{item.forecast30d}</td>
                      <td className="py-3 pr-4">
                        ${item.projectedRevenue30d.toFixed(2)}
                      </td>
                      <td className="py-3">{item.confidence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-xl font-bold">Demand Trends</h2>
          {report.demandPredictions.length === 0 ? (
            <p className="text-sm text-zinc-600">No demand trends available yet.</p>
          ) : (
            <ul className="space-y-3">
              {report.demandPredictions.slice(0, 10).map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between border-b border-zinc-200 pb-3 last:border-0"
                >
                  <span>{item.productName}</span>
                  <span className={`font-semibold ${trendClass(item.trend)}`}>
                    {item.trend} ({item.momentum > 0 ? "+" : ""}
                    {item.momentum}%)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-xl font-bold">Best Products to Restock</h2>
          {report.restockRecommendations.length === 0 ? (
            <p className="text-sm text-zinc-600">No restock alerts right now.</p>
          ) : (
            <ul className="space-y-3">
              {report.restockRecommendations.map((item) => (
                <li
                  key={item.productId}
                  className="rounded-lg bg-zinc-50 border border-zinc-200 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{item.productName}</span>
                    <span className={`text-sm font-semibold ${riskClass(item.risk)}`}>
                      {item.risk.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{item.reason}</p>
                  <p className="mt-2 text-sm">
                    Restock ~{item.suggestedRestockQty} units · projected demand{" "}
                    {item.projectedDemand30d}/30d
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-xl font-bold">Trending Engines</h2>
          {report.trendingEngines.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No engine platform momentum detected yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {report.trendingEngines.map((engine) => (
                <li
                  key={engine.platform}
                  className="rounded-lg bg-zinc-50 border border-zinc-200 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{engine.platformLabel}</span>
                    <span className="text-sm text-green-400">
                      {engine.momentum > 0 ? "+" : ""}
                      {engine.momentum}% momentum
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">
                    {engine.views7d} views · {engine.cartAdds7d} cart adds ·{" "}
                    {engine.unitsSold7d} sold
                  </p>
                  <p className="mt-1 text-sm">Top product: {engine.topProductName}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
