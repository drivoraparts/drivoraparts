export const runtime = 'edge';

import { NextResponse } from "next/server";
import { getAiInsightsReport } from "@/lib/insights/ai";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const report = await getAiInsightsReport();
  return NextResponse.json(report);
}
