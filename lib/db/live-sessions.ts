import { getSupabaseAdmin } from "@/lib/supabase/admin";

const SESSION_TTL_MS = 45_000;

export type LiveSessionRow = {
  session_id: string;
  page: string;
  previous_page: string | null;
  time_on_page_ms: number;
  last_seen_at: string;
};

export async function upsertLiveSession(input: {
  sessionId: string;
  page: string;
  previousPage?: string;
  timeOnPageMs: number;
}): Promise<LiveSessionRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("live_sessions")
    .upsert(
      {
        session_id: input.sessionId,
        page: input.page,
        previous_page: input.previousPage ?? null,
        time_on_page_ms: input.timeOnPageMs,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data as LiveSessionRow;
}

export async function getActiveLiveSessions(): Promise<LiveSessionRow[]> {
  const supabase = getSupabaseAdmin();
  const cutoff = new Date(Date.now() - SESSION_TTL_MS).toISOString();

  await supabase.from("live_sessions").delete().lt("last_seen_at", cutoff);

  const { data, error } = await supabase
    .from("live_sessions")
    .select("*")
    .gte("last_seen_at", cutoff)
    .order("last_seen_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as LiveSessionRow[];
}

export const LIVE_SESSION_TTL_MS = SESSION_TTL_MS;
