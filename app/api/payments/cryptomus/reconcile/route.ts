import { NextResponse } from "next/server";
import { reconcilePendingPayments } from "@/lib/payments/reconcile";
import { getCronSecret } from "@/lib/env";
import { getClientIp } from "@/lib/security/ip";
import { logWarn } from "@/lib/monitoring/logger";

export const dynamic = "force-dynamic";

/** Fail-closed: requires a configured CRON_SECRET presented as Bearer or x-cron-secret. */
function authorize(req: Request): boolean {
  const secret = getCronSecret();
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;
  const direct = req.headers.get("x-cron-secret");

  return bearer === secret || direct === secret;
}

async function handle(req: Request) {
  if (!authorize(req)) {
    logWarn("reconcile_unauthorized", { ip: getClientIp(req) });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const olderThanMinutes =
    Number(url.searchParams.get("olderThanMinutes")) || undefined;
  const limit = Number(url.searchParams.get("limit")) || undefined;

  try {
    const summary = await reconcilePendingPayments({ olderThanMinutes, limit });
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Reconcile failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
