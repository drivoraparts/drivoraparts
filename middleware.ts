import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/session";
import { authDebug } from "@/lib/auth/debug";
import { isPublicAdminPath } from "@/lib/auth/public-routes";
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

function withAdminHeaders(
  request: NextRequest,
  options: { isPublic: boolean }
): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-admin-public", options.isPublic ? "1" : "0");
  requestHeaders.set("x-is-admin", "1");
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

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
  const session = await verifyAdminSessionToken(token, "middleware");

  if (!session) {
    authDebug("middleware", "API blocked — missing or invalid session", {
      path: request.nextUrl.pathname,
      hasCookie: Boolean(token),
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const ip = getClientIp(request);

  if (pathname.startsWith("/admin")) {
    if (isPublicAdminPath(pathname)) {
      authDebug("middleware", "public admin route — auth skipped", { pathname });

      const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      const session = await verifyAdminSessionToken(token, "middleware-public");

      if (session) {
        authDebug("middleware", "already signed in — redirect to dashboard", {
          pathname,
          email: session.email,
        });
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

      return withAdminHeaders(request, { isPublic: true });
    }

    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = await verifyAdminSessionToken(token, "middleware");

    if (!session) {
      authDebug("middleware", "protected admin route blocked — redirect to login", {
        pathname,
        hasCookie: Boolean(token),
      });
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    authDebug("middleware", "protected admin route allowed", {
      pathname,
      email: session.email,
    });
    return withAdminHeaders(request, { isPublic: false });
  }

  if (isRateLimitedApi(pathname)) {
    const { limit, windowMs } = getRateLimitConfig(pathname);
    const rateKey = buildRateLimitKey(ip, pathname);
    const rateResult = checkRateLimit(rateKey, limit, windowMs);

    if (!rateResult.allowed) {
      authDebug("middleware", "rate limited", { pathname, ip });
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
        authDebug("middleware", "abuse blocked", { pathname, reason: abuse.reason });
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
