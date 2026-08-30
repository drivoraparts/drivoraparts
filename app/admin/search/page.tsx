import Link from "next/link";
import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { adminUi } from "@/components/admin/admin-ui";
import {
  getSearchInsights,
  type SearchInsights,
  type SearchRangeKey,
} from "@/lib/analytics/search-insights";

export const dynamic = "force-dynamic";

const RANGES: { key: SearchRangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
];

const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const when = (ms: number) =>
  ms ? new Date(ms).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

const QUALITY: Record<
  SearchInsights["quality"],
  { dot: string; label: string; className: string }
> = {
  strong: { dot: "🟢", label: "Strong", className: "text-emerald-700" },
  attention: { dot: "🟡", label: "Needs attention", className: "text-amber-700" },
  poor: { dot: "🔴", label: "Poor", className: "text-red-700" },
};

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={adminUi.card}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        {hint ? <p className="mt-1 text-sm text-zinc-600">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-zinc-500">{children}</p>;
}

type PageProps = {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
};

export default async function AdminSearchAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rangeKey = (RANGES.some((r) => r.key === params.range)
    ? params.range
    : params.from || params.to
      ? "custom"
      : "30d") as SearchRangeKey;

  const insights = await getSearchInsights(rangeKey, params.from, params.to);
  const quality = QUALITY[insights.quality];

  const href = (key: SearchRangeKey) => `/admin/search?range=${key}`;
  const maxDay = Math.max(1, ...insights.overTime.map((point) => point.searches));

  return (
    <AdminShell title="Search Analytics">
      {/* Date range */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {RANGES.map((range) => (
          <Link
            key={range.key}
            href={href(range.key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              rangeKey === range.key
                ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {range.label}
          </Link>
        ))}

        <form method="GET" action="/admin/search" className="ml-auto flex items-end gap-2">
          <input type="hidden" name="range" value="custom" />
          <label className="text-xs text-zinc-600">
            From
            <input
              type="date"
              name="from"
              defaultValue={params.from ?? ""}
              className="mt-1 block rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            To
            <input
              type="date"
              name="to"
              defaultValue={params.to ?? ""}
              className="mt-1 block rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
            />
          </label>
          <button type="submit" className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:border-red-300 hover:text-red-700">
            Apply
          </button>
        </form>
      </div>

      {insights.degraded ? (
        <div className={`mb-6 ${adminUi.errorBox}`}>
          No search events could be read for this range. That means either
          nothing was searched, or analytics storage is unavailable — this
          banner appears rather than presenting an outage as zero activity.
        </div>
      ) : null}

      {/* Headline numbers */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Searches" value={insights.totalSearches.toLocaleString()} />
        <StatCard
          label="Unique Sessions"
          value={insights.uniqueSessions.toLocaleString()}
          hint="Anonymous visit identifiers"
        />
        <StatCard
          label="Zero-Result Searches"
          value={insights.zeroResultSearches.toLocaleString()}
          hint={`${pct(insights.zeroResultRate)} of searches`}
        />
        <StatCard
          label="Click-Through Rate"
          value={pct(insights.clickThroughRate)}
          hint="Searches where a result was clicked"
        />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Search → Add to Cart"
          value={pct(insights.cartRate)}
          hint="Searches that led to a cart add"
        />
        <StatCard
          label="Avg Response Time"
          value={
            insights.averageResponseMs != null
              ? `${Math.round(insights.averageResponseMs)} ms`
              : "—"
          }
          hint="Server-side search duration"
        />
        <div className={adminUi.statCard}>
          <p className={adminUi.statLabel}>Search Quality</p>
          <p className={`mt-2 text-2xl font-semibold ${quality.className}`}>
            {quality.dot} {quality.label}
          </p>
          <p className={adminUi.statHint}>
            From zero-result rate, click-through and clicked position
          </p>
        </div>
        <div className={adminUi.statCard}>
          <p className={adminUi.statLabel}>Devices</p>
          <div className="mt-2 space-y-1">
            {insights.deviceBreakdown.length === 0 ? (
              <p className="text-sm text-zinc-500">No data</p>
            ) : (
              insights.deviceBreakdown.map((device) => (
                <div key={device.device} className="flex justify-between text-sm">
                  <span className="capitalize text-zinc-700">{device.device}</span>
                  <span className="font-medium text-zinc-900">{device.searches}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {insights.qualityReasons.length > 0 ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">Why this rating</p>
          <ul className="mt-2 space-y-1">
            {insights.qualityReasons.map((reason) => (
              <li key={reason} className="text-sm text-amber-900">
                • {reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Funnel */}
      <div className="mt-8">
        <Section
          title="Search Conversion Funnel"
          hint="Checkout and order counts are site-wide totals for the range, not search-attributed — they are shown for context only."
        >
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Searches", value: insights.funnel.searches, attributed: true },
              { label: "With Results", value: insights.funnel.searchesWithResults, attributed: true },
              { label: "Product Clicks", value: insights.funnel.productClicks, attributed: true },
              { label: "Add to Cart", value: insights.funnel.addToCart, attributed: true },
              { label: "Checkout Started", value: insights.funnel.checkoutStart, attributed: false },
              { label: "Orders", value: insights.funnel.orders, attributed: false },
            ].map((step) => (
              <div
                key={step.label}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center"
              >
                <p className="text-2xl font-semibold text-zinc-900">
                  {step.value.toLocaleString()}
                </p>
                <p className="mt-1 text-xs font-medium text-zinc-600">{step.label}</p>
                {!step.attributed ? (
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-400">
                    site-wide
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Zero results — the report that finds products worth stocking */}
      <div className="mt-8">
        <Section
          title="Zero-Result Searches"
          hint="What customers looked for and did not find. The strongest signal for what to stock next."
        >
          {insights.zeroResultQueries.length === 0 ? (
            <Empty>No zero-result searches in this range.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className={adminUi.tableHead}>
                  <tr>
                    <th className="pb-3 pr-4 font-semibold">Query</th>
                    <th className="pb-3 pr-4 font-semibold">Searches</th>
                    <th className="pb-3 pr-4 font-semibold">Sessions</th>
                    <th className="pb-3 pr-4 font-semibold">First Seen</th>
                    <th className="pb-3 pr-4 font-semibold">Last Seen</th>
                    <th className="pb-3 font-semibold">Likely Typo</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.zeroResultQueries.map((row) => (
                    <tr key={row.query} className={adminUi.tableRow}>
                      <td className="py-3 pr-4 font-medium text-zinc-900">
                        <Link
                          href={`/admin/search/query?q=${encodeURIComponent(row.query)}&range=${rangeKey}`}
                          className="hover:text-red-700 hover:underline"
                        >
                          {row.query}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-red-700">{row.searches}</td>
                      <td className="py-3 pr-4 text-zinc-700">{row.uniqueSessions}</td>
                      <td className="py-3 pr-4 text-zinc-600">{when(row.firstSearchedAt)}</td>
                      <td className="py-3 pr-4 text-zinc-600">{when(row.lastSearchedAt)}</td>
                      <td className="py-3 text-zinc-700">
                        {row.looksMisspelled ? `Yes — “${row.correction}”` : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      {/* Top queries */}
      <div className="mt-8">
        <Section title="Top Search Queries" hint="Click a query for its full detail.">
          {insights.topQueries.length === 0 ? (
            <Empty>No searches recorded in this range yet.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className={adminUi.tableHead}>
                  <tr>
                    <th className="pb-3 pr-4 font-semibold">Query</th>
                    <th className="pb-3 pr-4 font-semibold">Searches</th>
                    <th className="pb-3 pr-4 font-semibold">Sessions</th>
                    <th className="pb-3 pr-4 font-semibold">Avg Results</th>
                    <th className="pb-3 pr-4 font-semibold">CTR</th>
                    <th className="pb-3 pr-4 font-semibold">Cart Rate</th>
                    <th className="pb-3 font-semibold">Last Searched</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.topQueries.slice(0, 25).map((row) => (
                    <tr key={row.normalizedQuery} className={adminUi.tableRow}>
                      <td className="py-3 pr-4 font-medium text-zinc-900">
                        <Link
                          href={`/admin/search/query?q=${encodeURIComponent(row.query)}&range=${rangeKey}`}
                          className="hover:text-red-700 hover:underline"
                        >
                          {row.query}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-zinc-900">{row.searches}</td>
                      <td className="py-3 pr-4 text-zinc-700">{row.uniqueSessions}</td>
                      <td className="py-3 pr-4 text-zinc-700">
                        {row.averageResults.toFixed(1)}
                      </td>
                      <td className="py-3 pr-4 text-zinc-700">{pct(row.clickThroughRate)}</td>
                      <td className="py-3 pr-4 text-zinc-700">{pct(row.cartRate)}</td>
                      <td className="py-3 text-zinc-600">{when(row.lastSearchedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Product demand */}
        <Section
          title="Product Demand from Search"
          hint="Appearances count times a product was the top result."
        >
          {insights.productDemand.length === 0 ? (
            <Empty>No product interest recorded yet.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className={adminUi.tableHead}>
                  <tr>
                    <th className="pb-3 pr-4 font-semibold">Product</th>
                    <th className="pb-3 pr-4 font-semibold">Top Result</th>
                    <th className="pb-3 pr-4 font-semibold">Clicks</th>
                    <th className="pb-3 font-semibold">Carts</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.productDemand.slice(0, 12).map((row) => (
                    <tr key={row.productId} className={adminUi.tableRow}>
                      <td className="py-3 pr-4 text-zinc-900">
                        <Link
                          href={`/product/${row.productId}`}
                          className="hover:text-red-700 hover:underline"
                        >
                          {row.productName}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-zinc-700">{row.topResultAppearances}</td>
                      <td className="py-3 pr-4 text-zinc-700">{row.clicks}</td>
                      <td className="py-3 text-zinc-700">{row.cartAdds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Typo insights */}
        <Section
          title="Spelling & Query Insights"
          hint="Corrections the live search already applied. Shown as opportunities only — nothing here changes ranking automatically."
        >
          {insights.corrections.length === 0 ? (
            <Empty>No corrected queries in this range.</Empty>
          ) : (
            <ul className="space-y-2">
              {insights.corrections.map((row) => (
                <li
                  key={`${row.typed}->${row.corrected}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                >
                  <span className="text-zinc-700">
                    <span className="font-mono text-zinc-900">{row.typed}</span>
                    <span className="mx-2 text-zinc-400">→</span>
                    <span className="font-mono text-zinc-900">{row.corrected}</span>
                  </span>
                  <span className="text-zinc-600">{row.count}×</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* Over time */}
      <div className="mt-8">
        <Section title="Search Activity Over Time">
          {insights.overTime.length === 0 ? (
            <Empty>No activity in this range.</Empty>
          ) : (
            <div className="space-y-2">
              {insights.overTime.map((point) => (
                <div key={point.date} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 text-zinc-600">{point.date}</span>
                  <div className="h-5 flex-1 overflow-hidden rounded bg-zinc-100">
                    <div
                      className="h-full rounded bg-red-500"
                      style={{ width: `${(point.searches / maxDay) * 100}%` }}
                    />
                  </div>
                  <span className="w-32 shrink-0 text-right text-zinc-700">
                    {point.searches} searches
                    {point.zeroResults > 0 ? (
                      <span className="ml-1 text-red-600">({point.zeroResults} empty)</span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </AdminShell>
  );
}
