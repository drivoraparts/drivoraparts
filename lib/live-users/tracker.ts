import {
  getActiveLiveSessions,
  upsertLiveSession,
} from "@/lib/db/live-sessions";
import type { HeartbeatPayload, LiveSession, LiveUsersSummary } from "./types";

function mapRow(row: Awaited<ReturnType<typeof getActiveLiveSessions>>[number]): LiveSession {
  return {
    sessionId: row.session_id,
    page: row.page,
    previousPage: row.previous_page ?? undefined,
    startedAt: new Date(row.last_seen_at).getTime(),
    lastSeenAt: new Date(row.last_seen_at).getTime(),
    timeOnPageMs: row.time_on_page_ms,
  };
}

export async function recordHeartbeat(
  payload: HeartbeatPayload
): Promise<LiveSession> {
  const sessions = await getActiveLiveSessions();
  const existing = sessions.find((s) => s.session_id === payload.sessionId);
  const now = Date.now();

  const timeOnPageMs = existing
    ? existing.time_on_page_ms + Math.max(0, now - new Date(existing.last_seen_at).getTime())
    : 0;

  const row = await upsertLiveSession({
    sessionId: payload.sessionId,
    page: payload.page,
    previousPage: payload.previousPage ?? existing?.page ?? undefined,
    timeOnPageMs,
  });

  return mapRow(row);
}

export async function getLiveUsersSummary(): Promise<LiveUsersSummary> {
  const now = Date.now();
  const rows = await getActiveLiveSessions();
  const sessions = rows.map(mapRow);
  const pageMap = new Map<string, { activeUsers: number; totalViews: number }>();

  for (const session of sessions) {
    const current = pageMap.get(session.page) ?? { activeUsers: 0, totalViews: 0 };
    current.activeUsers += 1;
    pageMap.set(session.page, current);

    if (session.previousPage && session.previousPage !== session.page) {
      const previous = pageMap.get(session.previousPage) ?? {
        activeUsers: 0,
        totalViews: 0,
      };
      previous.totalViews += 1;
      pageMap.set(session.previousPage, previous);
    }
  }

  const averageTimeOnPageMs =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, session) => sum + session.timeOnPageMs, 0) /
            sessions.length
        )
      : 0;

  return {
    activeUsers: sessions.length,
    activeSessions: sessions.length,
    averageTimeOnPageMs,
    pageBreakdown: [...pageMap.entries()]
      .map(([page, stats]) => ({ page, ...stats }))
      .sort((a, b) => b.activeUsers - a.activeUsers),
    sessions: sessions.sort((a, b) => b.lastSeenAt - a.lastSeenAt),
    generatedAt: now,
  };
}
