export const runtime = 'edge';

import { NextResponse } from "next/server";
import { getInventory, setInventory } from "@/lib/db/inventory";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = Number(searchParams.get("productId"));

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const stock = await getInventory(productId);
  return NextResponse.json({ productId, stock });
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const productId = Number(body?.productId);
  const stock = Number(body?.stock);

  if (!productId || !Number.isFinite(stock)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await setInventory(productId, stock);
  return NextResponse.json({ success: true });
}
