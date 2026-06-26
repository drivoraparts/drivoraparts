import { NextResponse } from "next/server";
import { getProductById } from "@/lib/inventory";
import { getInventory } from "@/lib/db/inventory";

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

  const stock = await getInventory(productId);
  const catalogInStock = product.stock !== false;

  return NextResponse.json(
    {
      ...product,
      stock,
      inStock: stock > 0 || catalogInStock,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}