import { NextResponse } from "next/server";
import { createOrder } from "@/lib/marketplace";

export const runtime = "edge";

export async function POST() {
  const order = createOrder();

  if (!order) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  return NextResponse.json(order);
}
