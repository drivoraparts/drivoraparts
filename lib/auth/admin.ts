import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashPasswordForStorage, timingSafeEqual } from "./crypto";
import { ensureAdminInitialized } from "./init-admin";
import { bumpAdminTokenVersion, getAdminTokenVersion } from "./token-version";

let runtimePasswordOverride: string | null = null;

export { getAdminTokenVersion };

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
  bumpAdminTokenVersion();

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

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters" };
  }

  const valid = await validateAdminCredentials(getAdminEmail(), currentPassword);
  if (!valid) {
    return { ok: false, error: "Current password is incorrect" };
  }

  await updateAdminPassword(newPassword);
  invalidateAllAdminSessions();
  return { ok: true };
}

export function invalidateAllAdminSessions(): void {
  bumpAdminTokenVersion();
}
