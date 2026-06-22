import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createStructuredLog, emitStructuredLog } from "@/lib/security/request-log";

export type ActivityLevel = "info" | "warn" | "error";

export type ActivityLogRecord = {
  id: string;
  level: ActivityLevel;
  message: string;
  context: Record<string, unknown> | null;
  created_at: string;
};

export async function logActivity(
  level: ActivityLevel,
  message: string,
  context: Record<string, unknown> = {}
): Promise<void> {
  emitStructuredLog(
    createStructuredLog({
      level,
      event: message,
      ip: String(context.ip ?? "system"),
      method: "SYSTEM",
      path: "internal",
      meta: context,
    })
  );

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("activity_logs").insert({
      level,
      message,
      context,
    });
  } catch (error) {
    emitStructuredLog(
      createStructuredLog({
        level: "error",
        event: "activity_log_failed",
        ip: "system",
        method: "SYSTEM",
        path: "internal",
        meta: {
          message: error instanceof Error ? error.message : String(error),
        },
      })
    );
  }
}

export async function listActivityLogs(limit = 200): Promise<ActivityLogRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as ActivityLogRecord[];
}
