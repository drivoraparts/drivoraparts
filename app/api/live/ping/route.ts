import { NextResponse } from "next/server";
import { recordHeartbeat } from "@/lib/live/users";

export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const sessionId =
    typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
  const page = typeof body?.page === "string" ? body.page.trim() : "/";

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    const session = await recordHeartbeat({
      sessionId,
      page,
      previousPage:
        typeof body?.previousPage === "string" ? body.previousPage : undefined,
      userAgent:
        typeof body?.userAgent === "string" ? body.userAgent : undefined,
    });

    return NextResponse.json({ success: true, session });
  } catch {
    return NextResponse.json({ success: true, session: null, degraded: true });
  }
}
