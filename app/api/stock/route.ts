import { NextResponse } from "next/server";
import { getStock, setStock } from "@/lib/marketplace";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = Number(searchParams.get("productId"));

  return NextResponse.json({
    productId,
    stock: getStock(productId),
  });
}

export async function POST(req: Request) {
  const { productId, stock } = await req.json();
  setStock(productId, stock);
  return NextResponse.json({ success: true });
}
