import { NextResponse } from "next/server";
import { BASE_CURRENCY } from "@/lib/currency/constants";

export const dynamic = "force-dynamic";

type RatesApiResponse = {
  result?: string;
  base_code?: string;
  rates?: Record<string, number>;
  time_last_update_utc?: string;
};

export async function GET() {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${BASE_CURRENCY}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Rates unavailable" }, { status: 502 });
    }

    const data = (await res.json()) as RatesApiResponse;

    if (data.result !== "success" || !data.rates) {
      return NextResponse.json({ error: "Invalid rates payload" }, { status: 502 });
    }

    return NextResponse.json(
      {
        base: BASE_CURRENCY,
        rates: data.rates,
        updatedAt: data.time_last_update_utc ?? null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Rates fetch failed" }, { status: 502 });
  }
}
