"use client";

import { useEffect, useState } from "react";
import type { LiveUsersSummary } from "@/lib/live-users/types";

export default function LiveUsersPanel() {
  const [summary, setSummary] = useState<LiveUsersSummary | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/live-users");
        const data = await res.json();
        if (active) setSummary(data);
      } catch {
        if (active) setSummary(null);
      }
    };

    load();
    const interval = setInterval(load, 10_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (!summary) {
    return <p className="text-zinc-600">Loading live user data...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <p className="text-sm text-zinc-600">Active Users</p>
          <p className="mt-2 text-3xl font-bold">{summary.activeUsers}</p>
        </div>
        <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <p className="text-sm text-zinc-600">Active Sessions</p>
          <p className="mt-2 text-3xl font-bold">{summary.activeSessions}</p>
        </div>
        <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
          <p className="text-sm text-zinc-600">Avg Time On Page</p>
          <p className="mt-2 text-3xl font-bold">
            {Math.round(summary.averageTimeOnPageMs / 1000)}s
          </p>
        </div>
      </div>

      <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
        <h2 className="mb-4 text-xl font-bold">Active Pages</h2>
        {summary.pageBreakdown.length === 0 ? (
          <p className="text-sm text-zinc-600">No active users right now.</p>
        ) : (
          <ul className="space-y-3">
            {summary.pageBreakdown.map((page) => (
              <li
                key={page.page}
                className="flex items-center justify-between border-b border-zinc-200 pb-3 last:border-0"
              >
                <span className="font-mono text-sm">{page.page}</span>
                <span className="font-semibold text-red-400">
                  {page.activeUsers} live
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
        <h2 className="mb-4 text-xl font-bold">Current Sessions</h2>
        {summary.sessions.length === 0 ? (
          <p className="text-sm text-zinc-600">No sessions tracked.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-600">
                <tr>
                  <th className="pb-3 pr-4">Page</th>
                  <th className="pb-3 pr-4">Previous</th>
                  <th className="pb-3 pr-4">Time On Page</th>
                  <th className="pb-3">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {summary.sessions.map((session) => (
                  <tr key={session.sessionId} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 font-mono">{session.page}</td>
                    <td className="py-3 pr-4 font-mono text-zinc-600">
                      {session.previousPage ?? "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {Math.round(session.timeOnPageMs / 1000)}s
                    </td>
                    <td className="py-3 text-zinc-600">
                      {new Date(session.lastSeenAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
