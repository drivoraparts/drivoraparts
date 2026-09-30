import { getProductById } from "@/lib/inventory";
import type { CreateOrderItemInput } from "@/lib/db/orders";

import {
  MAX_LINE_ITEMS,
  MAX_QUANTITY_PER_ITEM,
  lineItemLimitMessage,
  quantityLimitMessage,
} from "./limits";

export type RawCheckoutItem = {
  productId: number;
  name?: string;
  price?: number;
  image?: string;
  category?: string;
  brand?: string;
  quantity: number;
};

/**
 * A rejection the customer can act on.
 *
 * This used to return null for every failure, so the route answered every bad
 * payload with "Invalid checkout payload" — shown to the customer verbatim.
 * Exceeding the quantity limit is an ordinary thing to do and deserves an
 * ordinary explanation; a malformed body still gets the generic message,
 * because there is nothing useful to say about it.
 */
export type CheckoutItemsResult = {
  /** Parsed items, or null when the cart cannot be accepted. */
  items: RawCheckoutItem[] | null;
  /** Customer-facing reason, set whenever items is null. */
  error: string | null;
};

// A discriminated union would read better, but the project compiles with
// `strict: false`, and without strictNullChecks TypeScript will not narrow one.

export function parseRawCheckoutItems(raw: unknown): CheckoutItemsResult {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { items: null, error: "Your cart is empty." };
  }
  if (raw.length > MAX_LINE_ITEMS) {
    return { items: null, error: lineItemLimitMessage() };
  }

  const items: RawCheckoutItem[] = [];

  for (const item of raw) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.productId !== "number" ||
      typeof item.quantity !== "number" ||
      !Number.isFinite(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return {
        items: null,
        error: "Something in your cart looks wrong. Please clear it and try again.",
      };
    }

    if (item.quantity > MAX_QUANTITY_PER_ITEM) {
      return {
        items: null,
        error: quantityLimitMessage(
          typeof item.name === "string" ? item.name : undefined
        ),
      };
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

  /*
   * One line per product, and the limit counted across all of them.
   *
   * The per-line check above is not the limit the copy promises. "Up to 20 of
   * any item per order" is a statement about the ORDER, and nothing stopped a
   * payload from spelling the same productId across fifty lines of twenty --
   * a thousand units, past both caps, each line individually legal. The cart
   * cannot produce that (addToCart merges by id), so it only ever arrives
   * from a hand-made request, which is the case worth closing.
   *
   * Merging rather than rejecting, because duplicate lines are not in
   * themselves wrong and the cart already treats them as one: the customer
   * asked for N of a thing. The merged total is then held to the same limit,
   * and reports the same message as a single oversized line would.
   */
  const merged = new Map<number, RawCheckoutItem>();

  for (const item of items) {
    const existing = merged.get(item.productId);
    if (!existing) {
      merged.set(item.productId, item);
      continue;
    }
    existing.quantity += item.quantity;
  }

  for (const item of merged.values()) {
    if (item.quantity > MAX_QUANTITY_PER_ITEM) {
      return { items: null, error: quantityLimitMessage(item.name) };
    }
  }

  return { items: [...merged.values()], error: null };
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
