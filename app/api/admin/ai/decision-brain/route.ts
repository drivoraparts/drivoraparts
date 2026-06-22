export const runtime = 'edge';

import { NextResponse } from "next/server";
import { getDailyBusinessDecisions } from "@/lib/ai/decision-brain";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const report = await getDailyBusinessDecisions();
  return NextResponse.json(report);
}
