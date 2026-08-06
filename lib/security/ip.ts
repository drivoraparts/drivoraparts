import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest | Request): string {
  const headers =
    request.headers instanceof Headers
      ? request.headers
      : new Headers();

  // cf-connecting-ip is set by Cloudflare's edge and cannot be spoofed by
  // the client — it must be checked before x-forwarded-for, which any
  // client can freely set (or prepend to), or every rate limiter and audit
  // log built on this function becomes trivially bypassable.
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
