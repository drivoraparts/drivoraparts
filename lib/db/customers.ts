import { EMPTY_CUSTOMER_STATS } from "@/lib/admin/fallbacks";
import { guardedSupabaseRead } from "@/lib/db/read-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type CustomerRecord = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateCustomerInput = {
  fullName: string;
  email: string;
  phone?: string;
  shippingAddress?: string;
};

export async function createCustomer(
  input: CreateCustomerInput
): Promise<CustomerRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      full_name: input.fullName,
      email: input.email.toLowerCase(),
      phone: input.phone ?? null,
      shipping_address: input.shippingAddress ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as CustomerRecord;
}

export async function getCustomerById(id: string): Promise<CustomerRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as CustomerRecord | null;
}

export async function listCustomers(limit = 100): Promise<CustomerRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as CustomerRecord[];
}

export async function getCustomerStats() {
  return guardedSupabaseRead("getCustomerStats", EMPTY_CUSTOMER_STATS, async () => {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentCount, error: recentError } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo);

    if (recentError) throw recentError;

    return {
      totalCustomers: count ?? 0,
      newCustomers30d: recentCount ?? 0,
    };
  });
}
