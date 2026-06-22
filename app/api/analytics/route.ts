import { NextResponse } from "next/server";
import { trackEvent, getAnalyticsSummary } from "@/lib/analytics";
import type { AnalyticsEventName } from "@/lib/analytics/types";

export const runtime = "edge";

const VALID_EVENTS: AnalyticsEventName[] = [
  "product_view",
  "add_to_cart",
  "checkout_start",
  "order_completed",
];

export async function GET() {
  return NextResponse.json(getAnalyticsSummary());
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const event = body?.event as AnalyticsEventName;
  const payload =
    body?.payload && typeof body.payload === "object" ? body.payload : {};

  if (!VALID_EVENTS.includes(event)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const recorded = trackEvent(event, payload);
  return NextResponse.json({ success: true, id: recorded.id });
}
