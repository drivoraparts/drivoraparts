import { NextResponse } from "next/server";
import { getPricingRecommendations } from "@/lib/ai/pricing";
import { requireAdminApi } from "@/lib/auth/require-admin";

export const runtime = "edge";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const report = await getPricingRecommendations();
  return NextResponse.json(report);
}
