import { NextResponse } from "next/server";
import { generateAutopilotAds } from "@/lib/ads/autopilot";
import { requireAdminApi } from "@/lib/auth/require-admin";

export const runtime = "edge";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const report = await generateAutopilotAds();
  return NextResponse.json(report);
}
