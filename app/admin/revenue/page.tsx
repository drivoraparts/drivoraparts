import nextDynamic from "next/dynamic";

import AdminShell, { StatCard } from "@/components/admin/AdminShell";

const DashboardCharts = nextDynamic(() => import("@/components/admin/DashboardCharts"), {
  loading: () => <div className="mt-8 h-72 animate-pulse rounded-lg bg-white/5" />,
});

import { getDashboardChartData } from "@/lib/analytics";

import { getOrderStats } from "@/lib/db/orders";

import { getPaymentStats } from "@/lib/db/payments";



export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {

  const [charts, orderStats, paymentStats] = await Promise.all([

    getDashboardChartData(),

    getOrderStats(),

    getPaymentStats(),

  ]);



  return (

    <AdminShell title="Revenue Analytics">

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard

          label="Total Revenue"

          value={`$${orderStats.totalRevenue.toFixed(2)}`}

          hint="Paid orders only"

        />

        <StatCard

          label="Paid Payments"

          value={`$${paymentStats.netPaidAmount.toFixed(2)}`}

          hint={`${paymentStats.paid - paymentStats.paidAgainstClosed} payments backing live orders`}

        />

        <StatCard label="Pending Orders" value={String(orderStats.pendingOrders)} />

        <StatCard label="Failed Payments" value={String(paymentStats.failed)} />

      </div>



      {paymentStats.paidAgainstClosed > 0 && (

        /* Stated rather than netted away silently: money recorded as received
           against an order that was cancelled either needs refunding or the
           record is wrong, and both want a human to look. */

        <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">

          <span className="font-semibold">Needs reconciliation:</span>{" "}

          {paymentStats.paidAgainstClosed} payment
          {paymentStats.paidAgainstClosed === 1 ? " is" : "s are"} marked paid against
          cancelled or failed orders, totalling ${paymentStats.paidAgainstClosedAmount.toFixed(2)}.

          Excluded from Paid Payments above, which is why it ties out to Total Revenue.

          Either the money was taken and needs refunding, or the payment records are stale.

        </div>

      )}



      <div className="mt-6 grid gap-6 sm:grid-cols-2">

        <StatCard

          label="NOWPayments Revenue"

          value={`$${paymentStats.nowpaymentsPaidAmount.toFixed(2)}`}

          hint={`${paymentStats.nowpaymentsPaid} paid crypto payments`}

        />

        <StatCard

          label="Manual Fallback Revenue"

          value={`$${paymentStats.manualPaidAmount.toFixed(2)}`}

          hint={`${paymentStats.manualPaid} manual payments marked paid`}

        />

      </div>



      <div className="mt-8">

        <DashboardCharts data={charts} />

      </div>

    </AdminShell>

  );

}


