import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type SupportMessageRecord = {
  id: string;
  customer_id: string | null;
  customer_email: string;
  customer_name: string | null;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateSupportMessageInput = {
  customerEmail: string;
  customerName?: string;
  customerId?: string;
  subject: string;
  message: string;
};

export async function createSupportMessage(
  input: CreateSupportMessageInput
): Promise<SupportMessageRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("support_messages")
    .insert({
      customer_email: input.customerEmail.toLowerCase(),
      customer_name: input.customerName ?? null,
      customer_id: input.customerId ?? null,
      subject: input.subject,
      message: input.message,
      status: "open",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as SupportMessageRecord;
}

export async function listSupportMessages(
  status?: SupportMessageRecord["status"],
  limit = 100
): Promise<SupportMessageRecord[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("support_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SupportMessageRecord[];
}

export async function updateSupportMessage(
  id: string,
  patch: Partial<Pick<SupportMessageRecord, "status" | "admin_reply">>
): Promise<SupportMessageRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("support_messages")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data as SupportMessageRecord | null;
}

export async function getSupportStats() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("support_messages").select("status");

  if (error) throw error;

  const stats = { open: 0, in_progress: 0, resolved: 0, closed: 0, total: data?.length ?? 0 };

  for (const row of data ?? []) {
    stats[row.status as keyof typeof stats] += 1;
  }

  return stats;
}
