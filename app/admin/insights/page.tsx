import Link from "next/link";
import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { getInsightsReport } from "@/lib/insights/engine";
import { getDailyBusinessDecisions } from "@/lib/ai/decision-brain";
import { getDailyBusinessReport } from "@/lib/ai/daily-report";
import { getActionRecommendations } from "@/lib/ai/action-recommender";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function AdminInsightsPage() {
  const [insights, brain, daily, actions] = await Promise.all([
    getInsightsReport(),
    getDailyBusinessDecisions(),
    getDailyBusinessReport(),
    getActionRecommendations(),
  ]);

  return (
    <AdminShell title="AI Insights">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/admin/insights/daily"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold hover:bg-red-500/20"
        >
          View Daily Business Report →
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Top Actions"
          value={String(brain.topActions.length)}
          hint={brain.topActions.slice(0, 2).join(" · ") || "Building signals"}
        />
        <StatCard
          label="7-Day Forecast"
          value={`$${daily.revenuePrediction.next7Days.toLocaleString()}`}
          hint={`Confidence: ${daily.revenuePrediction.confidence}`}
        />
        <StatCard
          label="High-Impact Actions"
          value={String(actions.highImpact.length)}
          hint={`${actions.mediumImpact.length} medium · ${actions.lowPriority.length} low`}
        />
        <StatCard
          label="Growth Opportunities"
          value={String(daily.growthOpportunities.length)}
          hint={`${daily.riskAlerts.length} risk alerts`}
        />
      </div>

      <section className="mt-8 rounded-lg border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="mb-4 text-xl font-bold">Today&apos;s AI Decisions</h2>
        <p className="mb-4 text-sm text-gray-300">
          Priority actions: {brain.topActions.join(" · ")}
        </p>
        <ul className="space-y-2 text-sm">
          {brain.productDecisions.slice(0, 6).map((decision) => (
            <li
              key={`${decision.productId}-${decision.action}`}
              className="flex justify-between gap-4 rounded-lg border border-white/5 p-3"
            >
              <span>
                {decision.productName} → {decision.action}
              </span>
              <span className="text-gray-400">{decision.confidence}%</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="mb-4 text-xl font-bold">Revenue Predictions</h2>
          <div className="space-y-3 text-sm">
            <p>
              Today estimate:{" "}
              <span className="font-semibold">
                ${daily.revenuePrediction.todayEstimate.toLocaleString()}
              </span>
            </p>
            <p>
              Next 7 days:{" "}
              <span className="font-semibold">
                ${daily.revenuePrediction.next7Days.toLocaleString()}
              </span>
            </p>
            <p className="text-gray-400">
              Monthly projection: ${insights.estimatedMonthlyRevenue.toLocaleString()}
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="mb-4 text-xl font-bold">Risk Alerts</h2>
          <ul className="space-y-2 text-sm">
            {daily.riskAlerts.length === 0 ? (
              <li className="text-gray-400">No critical risks flagged.</li>
            ) : (
              daily.riskAlerts.map((alert) => (
                <li key={alert} className="text-yellow-200">
                  {alert}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-4 text-xl font-bold">Growth Opportunities</h2>
        <ul className="space-y-2 text-sm">
          {daily.growthOpportunities.length === 0 ? (
            <li className="text-gray-400">Collecting trend signals…</li>
          ) : (
            daily.growthOpportunities.map((item) => (
              <li key={item} className="text-green-300">
                {item}
              </li>
            ))
          )}
        </ul>
      </section>

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
    </AdminShell>
  );
}
