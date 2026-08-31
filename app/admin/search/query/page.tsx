import Link from "next/link";
import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { adminUi } from "@/components/admin/admin-ui";
import {
  getSearchInsights,
  type SearchRangeKey,
} from "@/lib/analytics/search-insights";
import { normalizeText } from "@/lib/catalog/search";

export const dynamic = "force-dynamic";

const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

type PageProps = {
  searchParams: Promise<{ q?: string; range?: string; from?: string; to?: string }>;
};

export default async function AdminSearchQueryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const rangeKey = (params.range ?? "30d") as SearchRangeKey;

  const insights = await getSearchInsights(rangeKey, params.from, params.to);
  const normalized = normalizeText(query);
  const summary = insights.topQueries.find(
    (row) => row.normalizedQuery === normalized
  );

  return (
    <AdminShell title={query ? `Search: “${query}”` : "Search Query"}>
      <div className="mb-6">
        <Link
          href={`/admin/search?range=${rangeKey}`}
          className="text-sm font-medium text-accent hover:underline"
        >
          ← Back to Search Analytics
        </Link>
      </div>

      {!summary ? (
        <div className={adminUi.card}>
          <p className="text-sm text-zinc-600">
            No recorded searches for{" "}
            <span className="font-medium text-zinc-900">“{query}”</span> in this
            date range.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Searches" value={summary.searches.toLocaleString()} />
            <StatCard
              label="Unique Sessions"
              value={summary.uniqueSessions.toLocaleString()}
            />
            <StatCard
              label="Avg Results Returned"
              value={summary.averageResults.toFixed(1)}
            />
            <StatCard
              label="Zero-Result Rate"
              value={pct(summary.zeroResultRate)}
              hint={
                summary.zeroResultRate > 0
                  ? "Some searches returned nothing"
                  : "Always returned results"
              }
            />
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Click-Through Rate" value={pct(summary.clickThroughRate)} />
            <StatCard
              label="Avg Clicked Position"
              value={
                summary.averageClickPosition != null
                  ? `#${summary.averageClickPosition.toFixed(1)}`
                  : "—"
              }
              hint="Lower means the best match is ranking well"
            />
            <StatCard label="Add-to-Cart Events" value={summary.cartAdds.toLocaleString()} />
            <StatCard
              label="Spelling Correction"
              value={summary.correction ? `“${summary.correction}”` : "None"}
              hint={summary.correction ? "Applied by live search" : undefined}
            />
          </div>

          <div className="mt-8">
            <section className={adminUi.card}>
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">
                Top Clicked Products
              </h2>
              {summary.topClickedProducts.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-500">
                  No products were clicked from this search.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead className={adminUi.tableHead}>
                      <tr>
                        <th className="pb-3 pr-4 font-semibold">Product</th>
                        <th className="pb-3 font-semibold">Clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.topClickedProducts.map((product) => (
                        <tr key={product.productId} className={adminUi.tableRow}>
                          <td className="py-3 pr-4 text-zinc-900">
                            <Link
                              href={`/product/${product.productId}`}
                              className="hover:text-accent-hover hover:underline"
                            >
                              {product.productName}
                            </Link>
                          </td>
                          <td className="py-3 text-zinc-700">{product.clicks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          {/*
           * Orders are deliberately absent. Attributing an order back to one
           * search would need the search id carried through checkout, which
           * this analytics layer does not do -- and inventing an attribution
           * that cannot be verified would be worse than omitting it.
           */}
          <p className="mt-6 text-sm text-zinc-600">
            Order attribution is not shown: linking a completed order back to a
            single search would require threading the search identifier through
            checkout, which this analytics layer deliberately does not touch.
          </p>
        </>
      )}
    </AdminShell>
  );
}
