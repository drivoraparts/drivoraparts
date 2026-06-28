import { NextResponse } from "next/server";
import { getAdminSystemSettings } from "@/lib/admin/system-settings";
import { isSupabaseConfigured } from "@/lib/env";

export async function GET() {
  const settings = getAdminSystemSettings();
  const supabaseConfigured = isSupabaseConfigured();
  const nowpaymentsConfigured = settings.nowpaymentsConfigured;

  return NextResponse.json({
    tawkEnabled: settings.tawkEnabled,
    checkoutReady: supabaseConfigured && nowpaymentsConfigured,
    supabaseConfigured,
    nowpaymentsConfigured,
    emailConfigured: settings.emailConfigured,
    siteUrl: settings.siteUrl,
  });
}
