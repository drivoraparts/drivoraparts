export const runtime = 'edge';

import Link from "next/link";
import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import DataDegradedBanner from "@/components/admin/DataDegradedBanner";
import { EMPTY_INSIGHTS_REPORT } from "@/lib/admin/fallbacks";
import { safeQuery } from "@/lib/db/safe-query";
import { getInsightsReport } from "@/lib/insights/engine";
import { getDailyBusinessReport, type DailyBusinessReport } from "@/lib/ai/daily-report";
import { getActionRecommendations, type ActionRecommendationReport } from "@/lib/ai/action-recommender";
import { getDailyBusinessDecisions, type DailyBusinessDecisions } from "@/lib/ai/decision-brain";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";
const EMPTY_BRAIN: DailyBusinessDecisions = {
  date: new Date().toISOString().slice(0, 10),
  generatedAt: Date.now(),
  topActions: ["collect more analytics data", "review inventory levels"],
  productDecisions: [],
  source: "fallback",
};

const EMPTY_DAILY: DailyBusinessReport = {
  date: new Date().toISOString().slice(0, 10),
  generatedAt: Date.now(),
  madeMoneyToday: [],
  lostMoneyToday: [],
  trending: [],
  shouldStop: [],
  shouldScale: [],
  revenuePrediction: { next7Days: 0, todayEstimate: 0, confidence: "low" },
  riskAlerts: [],
  growthOpportunities: [],
  topActions: [],
  source: "fallback",
};

const EMPTY_ACTIONS: ActionRecommendationReport = {
  generatedAt: Date.now(),
  highImpact: [],
  mediumImpact: [],
  lowPriority: [],
  source: "fallback",
};

export default async function AdminInsightsPage() {
  const [insights, brain, daily, actions] = await Promise.all([
    safeQuery(() => getInsightsReport(), EMPTY_INSIGHTS_REPORT, "insights-page-report"),
    safeQuery(() => getDailyBusinessDecisions(), EMPTY_BRAIN, "insights-page-brain"),
    safeQuery(() => getDailyBusinessReport(), EMPTY_DAILY, "insights-page-daily"),
    safeQuery(() => getActionRecommendations(), EMPTY_ACTIONS, "insights-page-actions"),
  ]);

  const topProducts = insights?.topProducts ?? [];
  const slowProducts = insights?.slowProducts ?? [];

  return (
    <AdminShell title="AI Insights">
      <DataDegradedBanner show={!isSupabaseConfigured()} />

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
          value={String(brain.topActions?.length ?? 0)}
          hint={brain.topActions?.slice(0, 2).join(" · ") || "Building signals"}
        />
        <StatCard
          label="7-Day Forecast"
          value={`$${(daily.revenuePrediction?.next7Days ?? 0).toLocaleString()}`}
          hint={`Confidence: ${daily.revenuePrediction?.confidence ?? "low"}`}
        />
        <StatCard
          label="High-Impact Actions"
          value={String(actions.highImpact?.length ?? 0)}
          hint={`${actions.mediumImpact?.length ?? 0} medium · ${actions.lowPriority?.length ?? 0} low`}
        />
        <StatCard
          label="Growth Opportunities"
          value={String(daily.growthOpportunities?.length ?? 0)}
          hint={`${daily.riskAlerts?.length ?? 0} risk alerts`}
        />
      </div>

      <section className="mt-8 rounded-lg border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="mb-4 text-xl font-bold">Today&apos;s AI Decisions</h2>
        <p className="mb-4 text-sm text-zinc-600">
          Priority actions: {(brain.topActions ?? []).join(" · ") || "Collecting signals…"}
        </p>
        <ul className="space-y-2 text-sm">
          {(brain.productDecisions ?? []).slice(0, 6).map((decision) => (
            <li
              key={`${decision.productId}-${decision.action}`}
              className="flex justify-between gap-4 rounded-lg border border-zinc-100 p-3"
            >
              <span>
                {decision.productName} → {decision.action}
              </span>
              <span className="text-zinc-600">{decision.confidence}%</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-xl font-bold">Revenue Predictions</h2>
          <div className="space-y-3 text-sm">
            <p>
              Today estimate:{" "}
              <span className="font-semibold">
                ${(daily.revenuePrediction?.todayEstimate ?? 0).toLocaleString()}
              </span>
            </p>
            <p>
              Next 7 days:{" "}
              <span className="font-semibold">
                ${(daily.revenuePrediction?.next7Days ?? 0).toLocaleString()}
              </span>
            </p>
            <p className="text-zinc-600">
              Monthly projection: ${(insights?.estimatedMonthlyRevenue ?? 0).toLocaleString()}
            </p>
          </div>
        </section>

        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-xl font-bold">Risk Alerts</h2>
          <ul className="space-y-2 text-sm">
            {(daily.riskAlerts ?? []).length === 0 ? (
              <li className="text-zinc-600">No critical risks flagged.</li>
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

      <section className="mt-8 rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
        <h2 className="mb-4 text-xl font-bold">Growth Opportunities</h2>
        <ul className="space-y-2 text-sm">
          {(daily.growthOpportunities ?? []).length === 0 ? (
            <li className="text-zinc-600">Collecting trend signals…</li>
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
        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-xl font-bold">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-zinc-600">No ranking data yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {topProducts.map((product) => (
                <li key={product.productId} className="flex justify-between gap-4">
                  <span>{product.name}</span>
                  <span className="text-zinc-600">
                    {product.views} views · {product.cartAdds} carts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-xl font-bold">Slow Products</h2>
          <ul className="space-y-2 text-sm">
            {slowProducts.length === 0 ? (
              <li className="text-zinc-600">No slow movers detected.</li>
            ) : (
              slowProducts.map((product) => (
                <li key={product.productId} className="flex justify-between gap-4">
                  <span>{product.name}</span>
                  <span className="text-zinc-600">{product.views} views</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
