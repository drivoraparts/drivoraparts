import { getProductById } from "@/lib/inventory";

export function productHasStock(productId: number, quantity = 1): boolean {
  const product = getProductById(productId);
  if (!product) return false;
  if (product.stock === false) return false;

  const available = product.stockQty ?? 10;
  return available >= quantity;
}
