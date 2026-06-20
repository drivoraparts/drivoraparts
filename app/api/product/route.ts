import { NextResponse } from "next/server";
import { getProductById } from "@/lib/inventory";
import { getStock } from "@/lib/marketplace";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = Number(searchParams.get("productId"));

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  const product = getProductById(productId);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...product,
    stock: getStock(productId),
  });
}
