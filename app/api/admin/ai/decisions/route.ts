export const runtime = 'edge';

import { NextResponse } from "next/server";
import { getAutonomousDecisions } from "@/lib/ai/decision-engine";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const report = await getAutonomousDecisions();
  return NextResponse.json(report);
}
