import { persistEvent } from "./store";
import type { AnalyticsEvent, AnalyticsEventName } from "./types";

export function trackEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> = {}
): AnalyticsEvent {
  const event: AnalyticsEvent = {
    id: crypto.randomUUID(),
    name: eventName,
    payload,
    createdAt: Date.now(),
  };

  persistEvent(event);
  return event;
}
