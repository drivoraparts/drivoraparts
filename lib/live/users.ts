export {
  recordHeartbeat,
  getLiveUsersSummary,
} from "@/lib/live-users/tracker";

export type {
  LiveSession,
  LiveUsersSummary,
  PageActivity,
  HeartbeatPayload,
} from "@/lib/live-users/types";

import { getLiveUsersSummary as getSummary } from "@/lib/live-users/tracker";
import { safeQuery } from "@/lib/db/safe-query";

export type LiveUsersApiResponse = {
  activeUsers: number;
  pages: Array<{ page: string; activeUsers: number; totalViews: number }>;
  averageSessionTime: number;
  sessions: Array<{
    sessionId: string;
    page: string;
    durationMs: number;
  }>;
  generatedAt: number;
};

export async function getLiveUsersSnapshot(): Promise<LiveUsersApiResponse> {
  const summary = await safeQuery(
    () => getSummary(),
    {
      activeUsers: 0,
      activeSessions: 0,
      averageTimeOnPageMs: 0,
      pageBreakdown: [],
      sessions: [],
      generatedAt: Date.now(),
    },
    "live-users-snapshot"
  );

  return {
    activeUsers: summary.activeUsers,
    pages: summary.pageBreakdown.map((page) => ({
      page: page.page,
      activeUsers: page.activeUsers,
      totalViews: page.totalViews,
    })),
    averageSessionTime: summary.averageTimeOnPageMs,
    sessions: summary.sessions.slice(0, 50).map((session) => ({
      sessionId: session.sessionId,
      page: session.page,
      durationMs: session.timeOnPageMs,
    })),
    generatedAt: summary.generatedAt,
  };
}
