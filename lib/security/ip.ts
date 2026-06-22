import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest | Request): string {
  const headers =
    request.headers instanceof Headers
      ? request.headers
      : new Headers();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
