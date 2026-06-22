import { NextResponse } from "next/server";
import { getLiveUsersSummary, recordHeartbeat } from "@/lib/live-users";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const summary = await getLiveUsersSummary();
  return NextResponse.json(summary);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (
    typeof body?.sessionId !== "string" ||
    typeof body?.page !== "string"
  ) {
    return NextResponse.json({ error: "Invalid heartbeat" }, { status: 400 });
  }

  const session = await recordHeartbeat({
    sessionId: body.sessionId,
    page: body.page,
    previousPage:
      typeof body.previousPage === "string" ? body.previousPage : undefined,
    userAgent:
      typeof body.userAgent === "string" ? body.userAgent : undefined,
  });

  return NextResponse.json({ success: true, session });
}
