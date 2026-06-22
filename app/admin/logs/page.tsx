import AdminShell from "@/components/admin/AdminShell";
import { listActivityLogs } from "@/lib/monitoring/activity";
import { getRecentAuditLogs } from "@/lib/monitoring/audit";

export const dynamic = "force-dynamic";
export default async function AdminLogsPage() {
  const [activityLogs, auditLogs] = await Promise.all([
    listActivityLogs(150),
    getRecentAuditLogs(100),
  ]);

  return (
    <AdminShell title="System Logs">
      <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
        <h2 className="mb-4 text-xl font-bold">Activity Logs</h2>
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 border-b border-zinc-200 bg-zinc-100 text-zinc-600">
              <tr>
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3 pr-4">Level</th>
                <th className="pb-3 pr-4">Event</th>
                <th className="pb-3">Context</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <tr key={log.id} className="border-b border-zinc-100 align-top">
                  <td className="py-3 pr-4 whitespace-nowrap text-zinc-600">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 capitalize">{log.level}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{log.message}</td>
                  <td className="py-3 font-mono text-xs text-zinc-600">
                    {JSON.stringify(log.context ?? {}).slice(0, 180)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
        <h2 className="mb-4 text-xl font-bold">Admin Audit Logs</h2>
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 border-b border-zinc-200 bg-zinc-100 text-zinc-600">
              <tr>
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3 pr-4">Admin</th>
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4">Resource</th>
                <th className="pb-3">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-zinc-100 align-top">
                  <td className="py-3 pr-4 whitespace-nowrap text-zinc-600">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">{log.user_email ?? "—"}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{log.action}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{log.resource ?? "—"}</td>
                  <td className="py-3 font-mono text-xs text-zinc-600">
                    {JSON.stringify(log.metadata ?? {}).slice(0, 180)}
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
