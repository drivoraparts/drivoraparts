import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { getCustomerStats, listCustomers } from "@/lib/db/customers";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function AdminCustomersPage() {
  const [stats, customers] = await Promise.all([
    getCustomerStats(),
    listCustomers(100),
  ]);

  return (
    <AdminShell title="Customer Analytics">
      <div className="grid gap-6 sm:grid-cols-2">
        <StatCard label="Total Customers" value={String(stats.totalCustomers)} />
        <StatCard
          label="New Customers (30d)"
          value={String(stats.newCustomers30d)}
        />
      </div>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-4 text-xl font-bold">Recent Customers</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-gray-400">
              <tr>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Phone</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-white/5">
                  <td className="py-3 pr-4">{customer.full_name}</td>
                  <td className="py-3 pr-4">{customer.email}</td>
                  <td className="py-3 pr-4">{customer.phone ?? "—"}</td>
                  <td className="py-3 text-gray-400">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
