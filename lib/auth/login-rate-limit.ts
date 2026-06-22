import {
  buildRateLimitKey,
  checkRateLimit,
} from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/ip";
import { logActivity } from "@/lib/monitoring/activity";

const LOGIN_WINDOW_MS = 15 * 60_000;
const LOGIN_MAX_ATTEMPTS = 5;

export async function enforceLoginRateLimit(request: Request): Promise<Response | null> {
  const ip = getClientIp(request);
  const key = buildRateLimitKey(ip, "/api/admin/login");
  const result = checkRateLimit(key, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);

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
  const key = buildRateLimitKey(ip, "/api/admin/login");
  checkRateLimit(key, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);

  await logActivity("warn", "Failed admin login attempt", {
    ip,
    email,
  });
}
