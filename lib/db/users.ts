import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashPasswordForStorage } from "@/lib/auth/login";

export type UserRecord = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export async function createUser(
  email: string,
  password: string,
  role = "admin"
): Promise<UserRecord> {
  const supabase = getSupabaseAdmin();
  const password_hash = await hashPasswordForStorage(password);

  const { data, error } = await supabase
    .from("users")
    .insert({
      email: email.toLowerCase(),
      password_hash,
      role,
    })
    .select("id, email, role, created_at, updated_at")
    .single();

  if (error) throw error;
  return data as UserRecord;
}

export async function listUsers(): Promise<UserRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, role, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as UserRecord[];
}
