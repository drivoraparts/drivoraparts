import { getProductById } from "@/lib/inventory";
import type { CreateOrderItemInput } from "@/lib/db/orders";

const MAX_LINE_ITEMS = 50;
const MAX_QUANTITY_PER_ITEM = 20;

export type RawCheckoutItem = {
  productId: number;
  name?: string;
  price?: number;
  image?: string;
  category?: string;
  brand?: string;
  quantity: number;
};

export function parseRawCheckoutItems(raw: unknown): RawCheckoutItem[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  if (raw.length > MAX_LINE_ITEMS) return null;

  const items: RawCheckoutItem[] = [];

  for (const item of raw) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.productId !== "number" ||
      typeof item.quantity !== "number" ||
      !Number.isFinite(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_QUANTITY_PER_ITEM
    ) {
      return null;
    }

    items.push({
      productId: item.productId,
      name: typeof item.name === "string" ? item.name : undefined,
      price: typeof item.price === "number" ? item.price : undefined,
      image: typeof item.image === "string" ? item.image : undefined,
      category: typeof item.category === "string" ? item.category : undefined,
      brand: typeof item.brand === "string" ? item.brand : undefined,
      quantity: item.quantity,
    });
  }

  return items;
}

/**
 * Server-authoritative line items — client prices are ignored.
 */
export function lockOrderItemsFromCatalog(
  rawItems: RawCheckoutItem[]
): CreateOrderItemInput[] {
  const locked: CreateOrderItemInput[] = [];

  for (const raw of rawItems) {
    const product = getProductById(raw.productId);

    if (!product) {
      throw new Error(`Product ${raw.productId} not found`);
    }

    if (product.stock === false) {
      throw new Error(`${product.name} is out of stock`);
    }

    locked.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.thumbnail ?? product.images?.[0] ?? "/product-media/avatars/default.svg",
      category: product.category,
      brand: product.brand,
      quantity: raw.quantity,
    });
  }

  return locked;
}
