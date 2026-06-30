import { NextResponse } from "next/server";

import { buildMetaCatalogCsv } from "@/lib/feeds/meta-catalog";

export const dynamic = "force-static";
export const revalidate = 3600;

/** Meta Commerce scheduled product feed (CSV). */
export async function GET() {
  const csv = buildMetaCatalogCsv();

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
