export const runtime = 'edge';

import { NextResponse } from "next/server";
import { detectViralProducts } from "@/lib/ai/viral-detector";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const report = await detectViralProducts();
  return NextResponse.json(report);
}
