import { insertAnalyticsEvent } from "@/lib/db/analytics";
import type { AnalyticsEvent, AnalyticsEventName } from "./types";

export async function trackEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> = {}
): Promise<AnalyticsEvent> {
  const row = await insertAnalyticsEvent(eventName, payload);

  return {
    id: row.id,
    name: row.name as AnalyticsEventName,
    payload: row.payload ?? {},
    createdAt: new Date(row.created_at).getTime(),
  };
}
