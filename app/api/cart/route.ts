export const runtime = 'edge';

import { NextResponse } from "next/server";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "@/lib/marketplace";
import { logWarn } from "@/lib/monitoring/logger";
import { getClientIp } from "@/lib/security/ip";

export async function GET() {
  return NextResponse.json(getCart(), {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  let body: { productId?: number; quantity?: number };

  try {
    body = await req.json();
  } catch {
    logWarn("cart_invalid_payload", { ip, method: "POST" });
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!Number.isFinite(body.productId)) {
    logWarn("cart_invalid_product", { ip, method: "POST" });
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  addToCart(body.productId!, body.quantity ?? 1);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const ip = getClientIp(req);
  let body: { productId?: number };

  try {
    body = await req.json();
  } catch {
    logWarn("cart_invalid_payload", { ip, method: "DELETE" });
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!Number.isFinite(body.productId)) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  removeFromCart(body.productId!);
  return NextResponse.json({ success: true });
}

export async function PATCH() {
  clearCart();
  return NextResponse.json({ success: true });
}
