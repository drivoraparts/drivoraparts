export const runtime = 'edge';

import { NextResponse } from "next/server";
import { getDailyBusinessReport } from "@/lib/ai/daily-report";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const report = await getDailyBusinessReport();
  return NextResponse.json(report);
}
