import { NextResponse } from "next/server";
import { generateAdPack } from "@/lib/ads/generator";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const productId = Number(body?.productId);

  if (!Number.isFinite(productId) || productId <= 0) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const pack = await generateAdPack(productId);
  if (!pack) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(pack);
}
