import type { AnalyticsEventName } from "./types";
import { trackMetaEvent } from "./meta-pixel";

export function trackEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;

  trackMetaEvent(eventName, payload);

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: eventName, payload }),
    keepalive: true,
  }).catch(() => {});
}
