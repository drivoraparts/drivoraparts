import { NextResponse } from "next/server";
import { analyzeCustomerBehavior } from "@/lib/ai/customers";
import { requireAdminApi } from "@/lib/auth/require-admin";

export const runtime = "edge";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const report = await analyzeCustomerBehavior();
  return NextResponse.json(report);
}
