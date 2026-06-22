import { NextResponse } from "next/server";
import { isTawkEnabledForStore } from "@/lib/admin/system-settings";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    tawkEnabled: isTawkEnabledForStore(),
  });
}
