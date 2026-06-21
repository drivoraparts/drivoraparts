import { NextResponse } from "next/server";
import { createOrder } from "@/lib/marketplace";
import type { OrderItem } from "@/lib/marketplace/types";

export const runtime = "edge";

function parseOrderItems(raw: unknown): OrderItem[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const items: OrderItem[] = [];

  for (const item of raw) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.productId !== "number" ||
      typeof item.name !== "string" ||
      typeof item.price !== "number" ||
      typeof item.image !== "string" ||
      typeof item.category !== "string" ||
      typeof item.quantity !== "number" ||
      item.quantity < 1
    ) {
      return null;
    }

    items.push({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      brand: typeof item.brand === "string" ? item.brand : undefined,
      quantity: item.quantity,
    });
  }

  return items;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const items = parseOrderItems(body?.items);

  if (!items) {
    return NextResponse.json({ error: "Invalid order items" }, { status: 400 });
  }

  const order = createOrder(items);

  if (!order) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  return NextResponse.json(order);
}
