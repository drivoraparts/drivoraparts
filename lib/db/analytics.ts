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
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("analytics_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AnalyticsEventRow[];
}

export async function listAnalyticsEventsSince(
  sinceIso: string
): Promise<AnalyticsEventRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("analytics_events")
    .select("*")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AnalyticsEventRow[];
}
