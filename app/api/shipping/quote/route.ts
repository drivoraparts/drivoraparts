import { NextResponse } from "next/server";
import { parseRawCheckoutItems } from "@/lib/checkout/validate-items";
import { quoteShipping } from "@/lib/shipping/quote";
import { logWarn } from "@/lib/monitoring/logger";
import { getClientIp } from "@/lib/security/ip";

/**
 * Shipping options for a cart and destination.
 *
 * Read-only and side-effect free: it prices nothing into an order and writes
 * nothing. The checkout page calls it to show the customer their choices; the
 * authoritative fee is recomputed inside /api/checkout when the order is
 * actually placed, so a tampered response here cannot change what is charged.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const body = await req.json().catch(() => null);

  const parsed = parseRawCheckoutItems(body?.items);
  if (!parsed.items) {
    logWarn("shipping_quote_invalid_items", { ip, reason: parsed.error });
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const country =
    typeof body?.country === "string" ? body.country.trim() : undefined;

  const options = quoteShipping(
    parsed.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    country
  );

  return NextResponse.json({ options });
}
