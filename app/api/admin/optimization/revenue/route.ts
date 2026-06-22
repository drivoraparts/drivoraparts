import { NextResponse } from "next/server";
import { getRevenueOptimizationReport } from "@/lib/optimization/revenue";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const report = await getRevenueOptimizationReport();
  return NextResponse.json(report);
}
