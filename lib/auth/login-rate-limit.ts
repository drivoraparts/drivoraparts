import { buildRateLimitKey } from "@/lib/security/rate-limit";
import { checkDurableRateLimit } from "@/lib/security/durable-rate-limit";
import { getClientIp } from "@/lib/security/ip";
import { logActivity } from "@/lib/monitoring/activity";

export const LOGIN_RATE_PATH = "/api/auth/login";

const LOGIN_WINDOW_MS = 15 * 60_000;
const LOGIN_MAX_ATTEMPTS = 10;

export async function enforceLoginRateLimit(request: Request): Promise<Response | null> {
  const ip = getClientIp(request);
  const key = buildRateLimitKey(ip, LOGIN_RATE_PATH);
  const result = await checkDurableRateLimit(key, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);

  if (!result.allowed) {
    await logActivity("warn", "Admin login rate limited", { ip });
    const retryAfter = Math.max(
      1,
      Math.ceil((result.resetAt - Date.now()) / 1000)
    );
    return Response.json(
      { error: "Too many login attempts. Try again later.", retryAfter },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  return null;
}

export async function recordFailedLoginAttempt(request: Request, email: string) {
  const ip = getClientIp(request);

  // Note: does NOT call checkRateLimit again — enforceLoginRateLimit already
  // consumed one unit of the budget for this request. Calling it a second
  // time here would double-count every failed attempt against the
  // LOGIN_MAX_ATTEMPTS limit, locking legitimate users out twice as fast.
  await logActivity("warn", "Failed admin login attempt", {
    ip,
    email,
  });
}
