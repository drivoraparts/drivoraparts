import { signAdminJwt, verifyAdminJwt } from "./jwt";
import { authDebug } from "./debug";
import { ensureAdminInitialized } from "./init-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  getSessionCookieOptions,
} from "./cookie-options";

export {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  getSessionCookieOptions,
};

export type AdminSession = {
  email: string;
  exp: number;
};

/**
 * Reads the persisted invalidation cutoff (see invalidateAllAdminSessions in
 * ./admin) so sessions issued before it are rejected. Returns null — never
 * throws — on any failure (unconfigured Supabase, network error, no row
 * yet), so a transient DB issue degrades to "skip this check" rather than
 * locking out all admin access.
 */
async function getSessionInvalidationCutoffMs(): Promise<number | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { email } = ensureAdminInitialized();
    const { data, error } = await supabase
      .from("users")
      .select("updated_at")
      .eq("email", email)
      .maybeSingle();

    if (error || !data?.updated_at) return null;
    return new Date(data.updated_at).getTime();
  } catch {
    return null;
  }
}

export async function createAdminSessionToken(email: string): Promise<string> {
  return signAdminJwt({
    email: email.trim().toLowerCase(),
    ver: 1,
    expiresInSeconds: SESSION_MAX_AGE_SECONDS,
  });
}

export async function verifyAdminSessionToken(
  token: string | undefined | null,
  scope = "session"
): Promise<AdminSession | null> {
  if (!token) {
    authDebug(scope, "no session cookie present");
    return null;
  }

  const payload = await verifyAdminJwt(token);
  if (!payload) {
    authDebug(scope, "JWT verification failed");
    return null;
  }

  const invalidatedAtMs = await getSessionInvalidationCutoffMs();
  if (invalidatedAtMs !== null && invalidatedAtMs > payload.iat * 1000) {
    authDebug(scope, "session invalidated (issued before last invalidation)", {
      email: payload.email,
      issuedAt: payload.iat,
      invalidatedAtMs,
    });
    return null;
  }

  authDebug(scope, "JWT verified", {
    email: payload.email,
    exp: payload.exp,
    ver: payload.ver,
  });

  return {
    email: payload.email,
    exp: payload.exp,
  };
}
