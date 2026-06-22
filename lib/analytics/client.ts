import type { AnalyticsEventName } from "./types";

export function trackEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: eventName, payload }),
    keepalive: true,
  }).catch(() => {});
}
