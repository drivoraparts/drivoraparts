import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import SupportCenterPanel from "@/components/admin/SupportCenterPanel";
import { getSupportStats, listSupportMessages } from "@/lib/db/support";

export const dynamic = "force-dynamic";
export default async function AdminSupportPage() {
  const [stats, messages] = await Promise.all([
    getSupportStats(),
    listSupportMessages(undefined, 100),
  ]);

  return (
    <AdminShell title="Support Center">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Tickets" value={String(stats.open)} />
        <StatCard label="In Progress" value={String(stats.in_progress)} />
        <StatCard label="Resolved" value={String(stats.resolved)} />
        <StatCard label="Total Messages" value={String(stats.total)} />
      </div>

      <SupportCenterPanel initialMessages={messages} />
    </AdminShell>
  );
}
