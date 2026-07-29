import { NextResponse } from "next/server";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "@/lib/marketplace";
import { logWarn } from "@/lib/monitoring/logger";
import { getClientIp } from "@/lib/security/ip";

// Matches the bound enforced on the real checkout path
// (lib/checkout/validate-items.ts) so this legacy endpoint can't accept
// quantities the rest of the app would never allow.
const MAX_QUANTITY_PER_ITEM = 20;

function isValidQuantity(quantity: unknown): quantity is number {
  return (
    typeof quantity === "number" &&
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= MAX_QUANTITY_PER_ITEM
  );
}

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

  const quantity = body.quantity ?? 1;
  if (!isValidQuantity(quantity)) {
    logWarn("cart_invalid_quantity", { ip, method: "POST" });
    return NextResponse.json(
      { error: `Quantity must be an integer between 1 and ${MAX_QUANTITY_PER_ITEM}` },
      { status: 400 }
    );
  }

  addToCart(body.productId!, quantity);
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
