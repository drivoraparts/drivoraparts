import { signAdminJwt, verifyAdminJwt } from "./jwt";
import { authDebug } from "./debug";
import { ensureAdminInitialized } from "./init-admin";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/env";
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
 * ./admin) so sessions issued before it are rejected. Uses a plain fetch to
 * Supabase's REST API rather than the @supabase/supabase-js SDK — this file
 * is imported by middleware.ts, which runs on every request across the
 * whole site, and pulling the full SDK in there pushed the Worker bundle
 * over Cloudflare's size limit. Returns null — never throws — on any
 * failure (unconfigured Supabase, network error, no row yet), so a
 * transient DB issue degrades to "skip this check" rather than locking out
 * all admin access.
 */
async function getSessionInvalidationCutoffMs(): Promise<number | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { email } = ensureAdminInitialized();
    const url = `${getSupabaseUrl()}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=updated_at`;
    const serviceKey = getSupabaseServiceRoleKey();

    const res = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    if (!res.ok) return null;

    const rows = (await res.json()) as Array<{ updated_at?: string }>;
    const updatedAt = rows?.[0]?.updated_at;
    if (!updatedAt) return null;

    return new Date(updatedAt).getTime();
  } catch {
    return null;
  }
}

export async function createAdminSessionToken(email: string): Promise<string> {
  return signAdminJwt({
    email: email.trim().toLowerCase(),
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
  });

  return {
    email: payload.email,
    exp: payload.exp,
  };
}
