import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { safeQuery } from "@/lib/db/safe-query";
import { logActivity } from "@/lib/monitoring/activity";

export type AiDecisionSnapshot = {
  id?: string;
  generatedAt: number;
  payload: Record<string, unknown>;
};

const memoryStore: AiDecisionSnapshot[] = [];
const MAX_MEMORY = 20;

export async function persistAiDecisions(
  payload: Record<string, unknown>
): Promise<AiDecisionSnapshot> {
  const snapshot: AiDecisionSnapshot = {
    generatedAt: Date.now(),
    payload,
  };

  memoryStore.unshift(snapshot);
  if (memoryStore.length > MAX_MEMORY) memoryStore.pop();

  await safeQuery(async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("activity_logs")
      .insert({
        level: "info",
        message: "ai.decisions_snapshot",
        context: snapshot,
      })
      .select("id")
      .single();

    if (error) throw error;
    snapshot.id = data.id as string;
  }, undefined, "persist-ai-decisions");

  void logActivity("info", "ai.decisions_generated", {
    advertise: Array.isArray(payload.advertiseToday)
      ? (payload.advertiseToday as unknown[]).length
      : 0,
    restock: Array.isArray(payload.restockNow)
      ? (payload.restockNow as unknown[]).length
      : 0,
  });

  return snapshot;
}

export function getLatestAiDecisionsFromMemory(): AiDecisionSnapshot | null {
  return memoryStore[0] ?? null;
}
