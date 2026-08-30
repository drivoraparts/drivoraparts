import { guardedSupabaseRead } from "@/lib/db/read-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AnalyticsEventName } from "@/lib/analytics/types";

export type AnalyticsEventRow = {
  id: string;
  name: AnalyticsEventName | string;
  payload: Record<string, unknown>;
  created_at: string;
};

export async function insertAnalyticsEvent(
  name: AnalyticsEventName,
  payload: Record<string, unknown> = {}
): Promise<AnalyticsEventRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("analytics_events")
    .insert({ name, payload })
    .select("*")
    .single();

  if (error) throw error;
  return data as AnalyticsEventRow;
}

export async function listAnalyticsEvents(limit = 500): Promise<AnalyticsEventRow[]> {
  return guardedSupabaseRead("listAnalyticsEvents", [], async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as AnalyticsEventRow[];
  });
}

/**
 * Every event since `sinceIso`, paged past PostgREST's 1,000-row ceiling.
 *
 * This used to issue a single unbounded select. PostgREST silently caps a
 * response at 1,000 rows, and because the order is ascending the rows it kept
 * were the OLDEST — so with 2,824 events in a 90-day window, callers received
 * events up to mid-July and nothing after, with no error to indicate the
 * truncation. Anything reading recent behaviour (forecasting, insights, ad
 * generation, search analytics) was working from a stale slice.
 *
 * Paging keeps the ascending order callers already expect while returning the
 * whole range. Same approach as fetchAllOrdersForStats in lib/db/orders.ts.
 */
export async function listAnalyticsEventsSince(
  sinceIso: string
): Promise<AnalyticsEventRow[]> {
  return guardedSupabaseRead("listAnalyticsEventsSince", [], async () => {
    const supabase = getSupabaseAdmin();
    const pageSize = 1000;
    const rows: AnalyticsEventRow[] = [];

    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) throw error;

      const batch = (data ?? []) as AnalyticsEventRow[];
      rows.push(...batch);
      if (batch.length < pageSize) break;
    }

    return rows;
  });
}
