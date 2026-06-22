export const runtime = 'edge';

import { NextResponse } from "next/server";
import { simulateBusinessScenario } from "@/lib/ai/simulator";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const productId = Number(body?.productId);
  const type = body?.type;

  if (!Number.isFinite(productId) || productId <= 0) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  let result = null;

  if (type === "price_increase") {
    result = await simulateBusinessScenario({
      type: "price_increase",
      productId,
      percent: Number(body?.percent) || 10,
    });
  } else if (type === "tiktok_campaign") {
    result = await simulateBusinessScenario({
      type: "tiktok_campaign",
      productId,
      budgetTier: body?.budgetTier ?? "medium",
    });
  } else if (type === "restock") {
    result = await simulateBusinessScenario({
      type: "restock",
      productId,
      quantity: Number(body?.quantity) || undefined,
    });
  } else {
    return NextResponse.json(
      { error: "type must be price_increase, tiktok_campaign, or restock" },
      { status: 400 }
    );
  }

  if (!result) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
