import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function logAdminAudit(
  userEmail: string | undefined,
  action: string,
  resource?: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("admin_audit_logs").insert({
      user_email: userEmail ?? null,
      action,
      resource: resource ?? null,
      metadata,
    });
  } catch (error) {
    console.error("[audit] failed to persist", action, error);
  }
}

export async function getRecentAuditLogs(limit = 50) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
