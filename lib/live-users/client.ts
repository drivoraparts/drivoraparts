"use client";

import { getSafeSessionStorage } from "@/lib/storage/safe-storage";

const SESSION_KEY = "drivora-live-session";
let memorySessionId = "";

function getSessionId(): string {
  if (typeof window === "undefined") return "";

  const storage = getSafeSessionStorage();
  let sessionId = storage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    try {
      storage.setItem(SESSION_KEY, sessionId);
    } catch {
      memorySessionId = sessionId;
    }
  }

  return sessionId || memorySessionId;
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
