import { getAdminEmail, getAdminPassword } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sha256Hex, timingSafeEqual } from "./crypto";

export async function validateAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const adminEmail = getAdminEmail().trim().toLowerCase();

  if (normalizedEmail === adminEmail) {
    return timingSafeEqual(password, getAdminPassword());
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: user } = await supabase
      .from("users")
      .select("email, password_hash")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (!user?.password_hash) return false;

    const hash = await sha256Hex(`${password}:${process.env.AUTH_SECRET}`);
    return timingSafeEqual(hash, user.password_hash);
  } catch {
    return false;
  }
}

export async function hashPasswordForStorage(password: string): Promise<string> {
  return sha256Hex(`${password}:${process.env.AUTH_SECRET ?? ""}`);
}
