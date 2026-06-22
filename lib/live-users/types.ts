export type LiveSession = {
  sessionId: string;
  page: string;
  previousPage?: string;
  startedAt: number;
  lastSeenAt: number;
  timeOnPageMs: number;
  userAgent?: string;
};

export type PageActivity = {
  page: string;
  activeUsers: number;
  totalViews: number;
};

export type LiveUsersSummary = {
  activeUsers: number;
  activeSessions: number;
  averageTimeOnPageMs: number;
  pageBreakdown: PageActivity[];
  sessions: LiveSession[];
  generatedAt: number;
};

export type HeartbeatPayload = {
  sessionId: string;
  page: string;
  previousPage?: string;
  userAgent?: string;
};
