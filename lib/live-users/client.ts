"use client";

const SESSION_KEY = "drivora-live-session";

function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

export function sendLiveHeartbeat(page: string, previousPage?: string): void {
  if (typeof window === "undefined" || !page) return;

  fetch("/api/live-users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: getSessionId(),
      page,
      previousPage,
      userAgent: navigator.userAgent,
    }),
    keepalive: true,
  }).catch(() => {});
}
