import { NextResponse } from "next/server";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "@/lib/marketplace";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json(getCart());
}

export async function POST(req: Request) {
  const { productId, quantity } = await req.json();
  addToCart(productId, quantity ?? 1);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { productId } = await req.json();
  removeFromCart(productId);
  return NextResponse.json({ success: true });
}

export async function PATCH() {
  clearCart();
  return NextResponse.json({ success: true });
}
