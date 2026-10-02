import { getProductById } from "@/lib/inventory";

export function productHasStock(productId: number, quantity = 1): boolean {
  const product = getProductById(productId);
  if (!product) return false;
  if (product.stock === false) return false;

  const available = product.stockQty ?? 10;
  return available >= quantity;
}

/** False when the catalog explicitly marks the product out of stock (stock:false). */
export function catalogAllowsPurchase(productId: number): boolean {
  const product = getProductById(productId);
  return Boolean(product) && product?.stock !== false;
}
