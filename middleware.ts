import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/session";
import { isAdminProtectedApi, isRateLimitedApi } from "@/lib/security/api-access";
import { getClientIp } from "@/lib/security/ip";
import {
  buildRateLimitKey,
  checkRateLimit,
  getRateLimitConfig,
} from "@/lib/security/rate-limit";
import {
  buildRequestFingerprint,
  checkAbuse,
  getAbuseRules,
} from "@/lib/security/abuse";
import { logApiRequest } from "@/lib/security/request-log";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function applyRateLimitHeaders(
  response: NextResponse,
  result: ReturnType<typeof checkRateLimit>
): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set(
    "X-RateLimit-Reset",
    String(Math.ceil(result.resetAt / 1000))
  );
  return response;
}

function rateLimitResponse(result: ReturnType<typeof checkRateLimit>): NextResponse {
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  const response = NextResponse.json(
    { error: "Too many requests", retryAfter },
    { status: 429 }
  );
  response.headers.set("Retry-After", String(retryAfter));
  return applyRateLimitHeaders(response, result);
}

async function enforceAdminSession(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const ip = getClientIp(request);

  if (isRateLimitedApi(pathname)) {
    const { limit, windowMs } = getRateLimitConfig(pathname);
    const rateKey = buildRateLimitKey(ip, pathname);
    const rateResult = checkRateLimit(rateKey, limit, windowMs);

    if (!rateResult.allowed) {
      logApiRequest({
        ip,
        method,
        path: pathname,
        status: 429,
        meta: { reason: "rate_limit" },
      });
      return rateLimitResponse(rateResult);
    }

    const abuseRules = getAbuseRules(pathname);
    if (abuseRules.enabled && method !== "GET" && method !== "HEAD") {
      const fingerprint = buildRequestFingerprint(ip, pathname, method);
      const abuse = checkAbuse(fingerprint, abuseRules);

      if (abuse.blocked) {
        logApiRequest({
          ip,
          method,
          path: pathname,
          status: 429,
          meta: { reason: abuse.reason ?? "abuse" },
        });
        return NextResponse.json(
          { error: "Request blocked", reason: abuse.reason },
          { status: 429 }
        );
      }
    }

    if (isAdminProtectedApi(pathname, method)) {
      const denied = await enforceAdminSession(request);
      if (denied) {
        logApiRequest({
          ip,
          method,
          path: pathname,
          status: 401,
          meta: { reason: "admin_required" },
        });
        return denied;
      }
    }

    const response = NextResponse.next();
    response.headers.set("X-Request-Ip", ip);
    return applyRateLimitHeaders(response, rateResult);
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = await verifyAdminSessionToken(token);
    if (session) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
