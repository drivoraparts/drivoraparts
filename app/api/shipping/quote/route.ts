import { NextResponse } from "next/server";
import { getProductById } from "@/lib/inventory";
import { describeQuote, quoteShipping, type ShippingQuoteItem } from "@/lib/shipping/rates";

/*
 * The shipping charge checkout shows before the customer places the order.
 *
 * Prices come from the catalog, never the request, and the charge comes from
 * the same function /api/checkout uses to write the order -- so the figure on
 * screen is the figure on the order. Unknown products and silly quantities are
 * dropped rather than trusted.
 */

const MAX_ITEMS = 100;
const MAX_QUANTITY = 999;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const raw = (body ?? {}) as { items?: unknown; country?: unknown };
  const rawItems = Array.isArray(raw.items) ? raw.items.slice(0, MAX_ITEMS) : [];
  const country = typeof raw.country === "string" ? raw.country.slice(0, 80) : "";

  const items: ShippingQuoteItem[] = [];
  for (const entry of rawItems) {
    const { productId, quantity } = (entry ?? {}) as { productId?: unknown; quantity?: unknown };
    const id = Number(productId);
    const qty = Math.floor(Number(quantity));
    if (!Number.isInteger(id) || !Number.isFinite(qty) || qty < 1 || qty > MAX_QUANTITY) continue;
    const product = getProductById(id);
    if (!product || typeof product.price !== "number") continue;
    items.push({ productId: id, quantity: qty, price: product.price });
  }

  const quote = quoteShipping(items, country);

  return NextResponse.json(
    { quote, text: describeQuote(quote) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
