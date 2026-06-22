import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashPasswordForStorage, timingSafeEqual } from "./crypto";
import { ensureAdminInitialized } from "./init-admin";

let runtimePasswordOverride: string | null = null;
let tokenVersion = 1;

export function getAdminEmail(): string {
  return ensureAdminInitialized().email;
}

export function getAdminPassword(): string {
  if (runtimePasswordOverride) return runtimePasswordOverride;
  return ensureAdminInitialized().password;
}

export function getAuthSecret(): string {
  return ensureAdminInitialized().authSecret;
}

export function getAdminTokenVersion(): number {
  return tokenVersion;
}

export async function validateAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const adminEmail = getAdminEmail();

  if (normalizedEmail !== adminEmail) {
    return false;
  }

  return timingSafeEqual(password, getAdminPassword());
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  runtimePasswordOverride = newPassword;
  tokenVersion += 1;

  try {
    const supabase = getSupabaseAdmin();
    const passwordHash = await hashPasswordForStorage(newPassword);
    const email = getAdminEmail();

    await supabase.from("users").upsert(
      {
        email,
        password_hash: passwordHash,
        role: "admin",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );
  } catch {
    // Runtime override still applies without Supabase.
  }
}

export function invalidateAllAdminSessions(): void {
  tokenVersion += 1;
}
