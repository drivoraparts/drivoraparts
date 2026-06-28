import { NextResponse } from "next/server";
import { getCryptomusMerchantId, getCryptomusPaymentKey, getNowPaymentsApiKey, getNowPaymentsIpnSecret, isSupabaseConfigured } from "@/lib/env";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  return NextResponse.json({
    supabaseConfigured: isSupabaseConfigured(),
    nowpaymentsConfigured: Boolean(getNowPaymentsApiKey() && getNowPaymentsIpnSecret()),
    cryptomusConfigured: Boolean(getCryptomusMerchantId() && getCryptomusPaymentKey()),
  });
}
