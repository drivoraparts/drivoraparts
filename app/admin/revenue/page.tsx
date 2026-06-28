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

          value={`$${paymentStats.paidAmount.toFixed(2)}`}

          hint={`${paymentStats.paid} successful payments`}

        />

        <StatCard label="Pending Orders" value={String(orderStats.pendingOrders)} />

        <StatCard label="Failed Payments" value={String(paymentStats.failed)} />

      </div>



      <div className="mt-6 grid gap-6 sm:grid-cols-2">

        <StatCard

          label="NOWPayments Revenue"

          value={`$${paymentStats.cryptomusPaidAmount.toFixed(2)}`}

          hint={`${paymentStats.cryptomusPaid} paid crypto payments`}

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


