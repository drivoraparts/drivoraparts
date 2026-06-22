import { NextResponse } from "next/server";
import { getRealtimeDashboard } from "@/lib/realtime/engine";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const dashboard = await getRealtimeDashboard();
  return NextResponse.json(dashboard);
}
