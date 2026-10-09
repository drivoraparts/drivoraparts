import { NextResponse } from "next/server";

import { buildGoogleMerchantTsv } from "@/lib/feeds/google-merchant";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * Google Merchant Center scheduled product feed (tab-separated).
 * Carries shipping_label so Merchant Center can rate parcel, multibox and
 * freight listings with separate shipping services.
 */
export async function GET() {
  const tsv = buildGoogleMerchantTsv();

  return new NextResponse(tsv, {
    headers: {
      "Content-Type": "text/tab-separated-values; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
