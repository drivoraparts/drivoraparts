import Link from "next/link";
import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { getDailyBusinessReport } from "@/lib/ai/daily-report";
import { getDailyBusinessDecisions } from "@/lib/ai/decision-brain";
import { getActionRecommendations } from "@/lib/ai/action-recommender";

export const dynamic = "force-dynamic";
export default async function AdminDailyInsightsPage() {
  const [daily, brain, actions] = await Promise.all([
    getDailyBusinessReport(),
    getDailyBusinessDecisions(),
    getActionRecommendations(),
  ]);

  return (
    <AdminShell title="Daily Business Report">
      <div className="mb-6">
        <Link href="/admin/insights" className="text-sm text-zinc-600 hover:text-zinc-900">
          ← Back to AI Insights
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Report Date" value={daily.date} />
        <StatCard
          label="Made Money Today"
          value={String(daily.madeMoneyToday.length)}
          hint={`$${daily.revenuePrediction.todayEstimate.toLocaleString()} estimated`}
        />
        <StatCard
          label="Trending Products"
          value={String(daily.trending.length)}
          hint={`${daily.shouldScale.length} to scale`}
        />
        <StatCard
          label="Stop / Pause"
          value={String(daily.shouldStop.length)}
          hint={`${daily.lostMoneyToday.length} leakage alerts`}
        />
      </div>

      <section className="mt-8 rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
        <h2 className="mb-4 text-xl font-bold">Executive Summary</h2>
        <p className="text-sm text-zinc-600">
          Top actions today: {brain.topActions.join(" · ")}
        </p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-xl font-bold">What Made Money Today</h2>
          <ul className="space-y-2 text-sm">
            {daily.madeMoneyToday.length === 0 ? (
              <li className="text-zinc-600">No paid orders recorded today yet.</li>
            ) : (
              daily.madeMoneyToday.map((row) => (
                <li key={row.productId} className="flex justify-between gap-4">
                  <span>{row.name}</span>
                  <span className="text-green-400">${row.revenue.toFixed(2)}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-xl font-bold">What Lost Money / Leakage</h2>
          <ul className="space-y-2 text-sm">
            {daily.lostMoneyToday.length === 0 ? (
              <li className="text-zinc-600">No major leakage detected.</li>
            ) : (
              daily.lostMoneyToday.map((row) => (
                <li key={row.productId} className="rounded-lg border border-zinc-100 p-3">
                  <p className="font-medium">{row.name}</p>
                  <p className="mt-1 text-zinc-600">{row.reason}</p>
                  <p className="mt-1 text-red-400">~${row.estimatedLoss} at risk</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-lg font-bold">Trending</h2>
          <ul className="space-y-2 text-sm">
            {daily.trending.slice(0, 5).map((p) => (
              <li key={p.productId} className="flex justify-between gap-3">
                <span>{p.name}</span>
                <span className="text-red-400">{p.viralScore}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-lg font-bold">Should Stop</h2>
          <ul className="space-y-2 text-sm">
            {daily.shouldStop.length === 0 ? (
              <li className="text-zinc-600">Nothing to pause.</li>
            ) : (
              daily.shouldStop.map((p) => (
                <li key={p.productId}>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-zinc-600">{p.reason}</p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="mb-4 text-lg font-bold">Should Scale</h2>
          <ul className="space-y-2 text-sm">
            {daily.shouldScale.slice(0, 5).map((p) => (
              <li key={p.productId}>
                <p className="font-medium">{p.name}</p>
                <p className="text-zinc-600">{p.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8 rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
        <h2 className="mb-4 text-xl font-bold">Action Priority Matrix</h2>
        <div className="grid gap-6 lg:grid-cols-3 text-sm">
          <div>
            <h3 className="mb-2 font-semibold text-red-400">High Impact</h3>
            <ul className="space-y-2">
              {actions.highImpact.slice(0, 4).map((a, i) => (
                <li key={i}>{a.action}{a.productName ? `: ${a.productName}` : ""}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-yellow-300">Medium</h3>
            <ul className="space-y-2">
              {actions.mediumImpact.slice(0, 4).map((a, i) => (
                <li key={i}>{a.action}{a.productName ? `: ${a.productName}` : ""}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-zinc-600">Low Priority</h3>
            <ul className="space-y-2">
              {actions.lowPriority.slice(0, 4).map((a, i) => (
                <li key={i}>{a.action}{a.productName ? `: ${a.productName}` : ""}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
