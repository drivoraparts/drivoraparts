import { NextResponse } from "next/server";
import { getSupplierEngineRecommendations } from "@/lib/suppliers/engine";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const report = await getSupplierEngineRecommendations();
  return NextResponse.json(report);
}
