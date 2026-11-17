import { NextResponse } from "next/server";
import { getCronSecret } from "@/lib/env";
import { timingSafeEqual } from "@/lib/auth/crypto";
import { getClientIp } from "@/lib/security/ip";
import { logWarn } from "@/lib/monitoring/logger";
import { runReviewRequests } from "@/lib/reviews/requests";

export const dynamic = "force-dynamic";

/*
 * Schedules review requests for newly delivered orders and emails the ones
 * that are due. Called by the Worker's own every-10-minutes cron over the service binding
 * (scripts/patch-opennext-cron.mjs), with the same CRON_SECRET as payment
 * reconciliation. Safe to call repeatedly: each item is asked once.
 */
function authorize(req: Request): boolean {
  const secret = getCronSecret();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
  return bearer != null && timingSafeEqual(bearer, secret);
}

export async function POST(req: Request) {
  if (!authorize(req)) {
    logWarn("review_requests_unauthorized", { ip: getClientIp(req) });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runReviewRequests();
  return NextResponse.json(result, { status: result.ok || result.reason !== "error" ? 200 : 500 });
}
