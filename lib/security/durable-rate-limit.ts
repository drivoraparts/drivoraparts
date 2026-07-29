import { getSupabaseAdmin, isSupabaseAvailable } from "@/lib/supabase/admin";
import { checkRateLimit, type RateLimitResult } from "./rate-limit";

type LoginRateLimitRow = {
  attempt_count: number;
  window_started_at: string;
};

/**
 * Supabase-backed rate limit for security-sensitive paths (admin login).
 * The plain in-memory checkRateLimit() resets independently per Cloudflare
 * Workers isolate/edge location, so a brute-force attempt spread across
 * edge locations sees effectively no limit. This shares counters across
 * isolates via the `login_rate_limits` table (see
 * supabase/migrations/003_login_rate_limits.sql), falling back to the
 * in-memory limiter if Supabase is unavailable or the migration hasn't
 * been applied yet, rather than blocking login outright.
 */
export async function checkDurableRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (!isSupabaseAvailable()) {
    return checkRateLimit(key, limit, windowMs);
  }

  try {
    const supabase = getSupabaseAdmin();
    const now = Date.now();

    const { data: existing, error: readError } = await supabase
      .from("login_rate_limits")
      .select("attempt_count, window_started_at")
      .eq("key", key)
      .maybeSingle<LoginRateLimitRow>();

    if (readError) throw readError;

    const windowStartedAtMs = existing
      ? new Date(existing.window_started_at).getTime()
      : null;
    const windowExpired = windowStartedAtMs === null || now - windowStartedAtMs >= windowMs;

    if (windowExpired) {
      await supabase.from("login_rate_limits").upsert(
        {
          key,
          attempt_count: 1,
          window_started_at: new Date(now).toISOString(),
        },
        { onConflict: "key" }
      );
      return { allowed: true, limit, remaining: limit - 1, resetAt: now + windowMs };
    }

    const resetAt = windowStartedAtMs + windowMs;
    const currentCount = existing!.attempt_count;

    if (currentCount >= limit) {
      return { allowed: false, limit, remaining: 0, resetAt };
    }

    await supabase
      .from("login_rate_limits")
      .update({ attempt_count: currentCount + 1 })
      .eq("key", key);

    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - (currentCount + 1)),
      resetAt,
    };
  } catch {
    return checkRateLimit(key, limit, windowMs);
  }
}
