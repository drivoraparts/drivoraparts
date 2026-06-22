export const runtime = 'edge';

import AdminShell from "@/components/admin/AdminShell";
import LiveUsersPanel from "@/components/admin/LiveUsersPanel";

export default function AdminLiveUsersPage() {
  return (
    <AdminShell title="Live Users">
      <p className="mb-6 text-sm text-zinc-600">
        Real-time visitor tracking refreshes every 10 seconds. Sessions expire
        after 45 seconds without heartbeat.
      </p>
      <LiveUsersPanel />
    </AdminShell>
  );
}
