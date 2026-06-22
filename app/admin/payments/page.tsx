import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { getCryptomusConfig } from "@/lib/cryptomus/config";
import { listOrders } from "@/lib/db/orders";
import { listPayments } from "@/lib/db/payments";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function AdminPaymentsPage() {
  const config = getCryptomusConfig();
  const [payments, orders] = await Promise.all([listPayments(), listOrders(200)]);

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const paidCount = payments.filter((item) => item.status === "paid").length;
  const pendingCount = payments.filter((item) => item.status === "pending").length;

  return (
    <AdminShell title="Payments">
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          label="Gateway Status"
          value={config.enabled ? "Configured" : "Not Configured"}
          hint={
            config.enabled
              ? "Cryptomus adapter enabled"
              : "Set CRYPTOMUS_MERCHANT_ID and CRYPTOMUS_PAYMENT_KEY"
          }
        />
        <StatCard
          label="Paid Payments"
          value={String(paidCount)}
          hint={`${pendingCount} pending payments`}
        />
        <StatCard
          label="Pending Orders"
          value={String(pendingOrders.length)}
          hint="Awaiting payment confirmation"
        />
      </div>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-4 text-xl font-bold">Integration Endpoints</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>
            <span className="text-gray-400">Checkout:</span> POST /api/checkout
          </li>
          <li>
            <span className="text-gray-400">Create invoice:</span> POST
            /api/payments/cryptomus/create
          </li>
          <li>
            <span className="text-gray-400">Webhook:</span> {config.callbackUrl}
          </li>
          <li>
            <span className="text-gray-400">Return URL:</span> {config.returnUrl}
          </li>
        </ul>
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-4 text-xl font-bold">Payment Records</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-400">No payment records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 text-gray-400">
                <tr>
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Provider</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-mono text-xs">{payment.order_id}</td>
                    <td className="py-3 pr-4">{payment.provider}</td>
                    <td className="py-3 pr-4">
                      {Number(payment.amount).toFixed(2)} {payment.currency}
                    </td>
                    <td className="py-3 pr-4 capitalize">{payment.status}</td>
                    <td className="py-3 text-gray-400">
                      {new Date(payment.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
