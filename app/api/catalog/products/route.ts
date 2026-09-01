import { NextRequest, NextResponse } from "next/server";

import { queryCatalog } from "@/lib/catalog/query";

/**
 * Paginated catalog feed.
 *
 * Filtering, ranking and sorting all live in lib/catalog/query.ts, because the
 * catalog page now runs the same query on the server to render page one into
 * its HTML. Keeping one implementation is the point: server-rendered page one
 * and the client's later pages cannot drift apart into two different catalogs.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const result = queryCatalog({
    page: Number(params.get("page") || 1),
    limit: Number(params.get("limit") || 0) || undefined,
    q: params.get("q") || "",
    category: params.get("category") || "",
    brand: params.get("brand") || "",
    price: params.get("price") || "all",
    sort: params.get("sort") || "newest",
    condition: params.get("condition") || "",
    availability: params.get("availability") || "",
  });

  return NextResponse.json(result);
}
