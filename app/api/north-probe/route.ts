import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY diagnostic — delete with the North sandbox work.
 *
 * Fetches North's public checkout.js from the Worker and reports only the HTTP
 * status and Server header. The point is the vantage: a request to this route
 * runs on Cloudflare's global network, so the outbound fetch does NOT originate
 * from the merchant's Cameroon connection. The merchant's browser and a curl
 * from their machine both get 403 rdwr on checkout.js; if this route reports
 * 200, the block is geographic; if it also reports 403 rdwr, checkout.js is
 * blocked for every client and North's embedded integration is broken at their
 * WAF regardless of origin.
 *
 * No secret, no session, no checkout/profile id -- it fetches one hardcoded
 * public URL and returns a status. Nothing here is sensitive, which is why it
 * needs no auth, and it cannot be used as an open proxy: the URL is fixed.
 */
export async function GET() {
  const target = "https://checkout.north.com/checkout.js";
  try {
    const res = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const body = await res.text();
    return NextResponse.json(
      {
        target,
        vantage: "cloudflare-worker (not the merchant's region)",
        status: res.status,
        server: res.headers.get("server"),
        contentType: res.headers.get("content-type"),
        bytes: body.length,
        interpretation:
          res.status === 200
            ? "checkout.js loads from Cloudflare's network -> the browser 403 is a GEOGRAPHIC block"
            : `checkout.js is ${res.status} from Cloudflare's network too -> blocked for all clients, not geographic`,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { target, error: error instanceof Error ? error.message : String(error) },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
