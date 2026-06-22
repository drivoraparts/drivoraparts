export const runtime = 'edge';

import { NextResponse } from "next/server";
import { trackEvent, getAnalyticsSummary } from "@/lib/analytics";
import type { AnalyticsEventName } from "@/lib/analytics/types";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { logWarn } from "@/lib/monitoring/logger";
import { getClientIp } from "@/lib/security/ip";

const VALID_EVENTS: AnalyticsEventName[] = [
  "product_view",
  "add_to_cart",
  "checkout_start",
  "order_completed",
];

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const summary = await getAnalyticsSummary();
  return NextResponse.json(summary);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const body = await req.json().catch(() => null);
  const event = body?.event as AnalyticsEventName;
  const payload =
    body?.payload && typeof body.payload === "object" ? body.payload : {};

  if (!VALID_EVENTS.includes(event)) {
    logWarn("analytics_invalid_event", { ip, event: String(event) });
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const recorded = await trackEvent(event, payload);
  return NextResponse.json({ success: true, id: recorded.id });
}