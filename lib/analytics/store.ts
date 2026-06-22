import type { AnalyticsEvent } from "./types";

type AnalyticsStore = {
  events: AnalyticsEvent[];
};

const STORE_KEY = "__drivora_analytics_store__";

function getStore(): AnalyticsStore {
  const g = globalThis as typeof globalThis & {
    [STORE_KEY]?: AnalyticsStore;
  };

  if (!g[STORE_KEY]) {
    g[STORE_KEY] = { events: [] };
  }

  return g[STORE_KEY]!;
}

export function loadEvents(): AnalyticsEvent[] {
  return [...getStore().events];
}

export function persistEvent(event: AnalyticsEvent): void {
  getStore().events.push(event);
}

export function persistEvents(events: AnalyticsEvent[]): void {
  getStore().events = events;
}
