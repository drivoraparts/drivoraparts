export const runtime = 'edge';

import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { getSupplierRecommendations } from "@/lib/suppliers";

export const dynamic = "force-dynamic";
export default async function AdminSuppliersPage() {
  const report = await getSupplierRecommendations();

  return (
    <AdminShell title="Supplier Intelligence">
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          label="Recommendations"
          value={String(report.recommendations.length)}
          hint="Products matched to suppliers"
        />
        <StatCard
          label="Supplier Network"
          value={String(report.topSuppliers.length)}
          hint="Active supplier profiles"
        />
        <StatCard
          label="Top Match Count"
          value={String(report.topSuppliers[0]?.matchCount ?? 0)}
          hint={report.topSuppliers[0]?.name ?? "No matches yet"}
        />
      </div>

      <section className="mt-8 rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
        <h2 className="mb-4 text-xl font-bold">Recommended Suppliers by Product</h2>
        {report.recommendations.length === 0 ? (
          <p className="text-sm text-zinc-600">
            No supplier recommendations yet. Restock alerts from AI forecast will
            populate this section.
          </p>
        ) : (
          <ul className="space-y-4">
            {report.recommendations.map((item) => (
              <li
                key={item.productId}
                className="rounded-lg bg-zinc-50 border border-zinc-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-zinc-600">
                      Restock ~{item.suggestedQty} units · {item.risk} risk
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-red-400">
                    Match {item.matchScore}
                  </p>
                </div>
                <p className="mt-3 text-sm">
                  <span className="text-zinc-600">Supplier:</span>{" "}
                  {item.supplier.name} · {item.supplier.leadTimeDays} day lead ·{" "}
                  {item.supplier.reliabilityScore}% reliability
                </p>
                <p className="mt-2 text-sm text-zinc-600">{item.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
