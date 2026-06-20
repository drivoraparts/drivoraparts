import { NextResponse } from "next/server";
import { createOrder, clearCart, addToCart } from "@/lib/marketplace";

export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (body?.items?.length) {
    clearCart();

    for (const item of body.items) {
      addToCart(item.productId, item.quantity ?? 1);
    }
  }

  const order = createOrder();

  if (!order) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  return NextResponse.json(order);
}
