/**
 * Which products an analytics event refers to.
 *
 * Events come in two shapes: product_view and add_to_cart name a single
 * product as `payload.productId`, while checkout_start and order_completed
 * describe a whole cart under `payload.items`. Every per-product report read
 * only the first shape, so `if (!productId) continue` silently discarded every
 * cart-level event — checkout and order counts came out as zero for every
 * product no matter what had actually sold, and demand rankings lost their
 * heaviest signal without any sign that a term was missing.
 *
 * Reading both shapes through one helper keeps the next report from
 * reintroducing the same gap.
 */

export type ProductEventLike = {
  name: string;
  payload?: Record<string, unknown> | null;
};

/** Product ids an event refers to. Deduplicated: one event counts once each. */
export function eventProductIds(event: ProductEventLike): number[] {
  const payload = event.payload ?? {};

  const single = Number(payload.productId);
  if (single) return [single];

  const items = payload.items;
  if (!Array.isArray(items)) return [];

  const ids = new Set<number>();
  for (const item of items) {
    const id = Number((item as { id?: unknown; productId?: unknown })?.id);
    if (id) {
      ids.add(id);
      continue;
    }
    const alt = Number((item as { productId?: unknown })?.productId);
    if (alt) ids.add(alt);
  }

  return [...ids];
}

/** Convenience for the common "does this event involve product X" test. */
export function eventIncludesProduct(event: ProductEventLike, productId: number): boolean {
  return eventProductIds(event).includes(productId);
}

/**
 * Display name carried by an event, when it has one. Cart-level events name
 * their line items rather than a single product, so callers fall back to the
 * catalog.
 */
export function eventProductName(event: ProductEventLike): string | null {
  const name = (event.payload ?? {}).productName;
  return typeof name === "string" && name ? name : null;
}
