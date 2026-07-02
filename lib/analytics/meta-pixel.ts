import type { AnalyticsEventName } from "./types";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const META_CHECKOUT_ITEMS_KEY = "drivora_meta_checkout_items";

export type MetaCatalogLineItem = {
  id: number | string;
  quantity?: number;
};

function fbq(...args: unknown[]): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq(...args);
}

function catalogId(value: unknown): string | null {
  const id = String(value ?? "").trim();
  return id ? id : null;
}

/** Params Meta uses to match pixel events to catalogue rows (id column in feed). */
function catalogMatchParams(
  items: MetaCatalogLineItem[]
): Record<string, unknown> {
  const lines = items
    .map((item) => {
      const id = catalogId(item.id);
      if (!id) return null;
      const quantity =
        typeof item.quantity === "number" && item.quantity > 0
          ? item.quantity
          : 1;
      return { id, quantity };
    })
    .filter((line): line is { id: string; quantity: number } => line != null);

  if (!lines.length) return { content_type: "product" };

  return {
    content_ids: lines.map((line) => line.id),
    content_type: "product",
    contents: lines.map((line) => ({ id: line.id, quantity: line.quantity })),
  };
}

export function storeMetaCheckoutItems(items: MetaCatalogLineItem[]): void {
  if (typeof window === "undefined" || !items.length) return;
  try {
    sessionStorage.setItem(META_CHECKOUT_ITEMS_KEY, JSON.stringify(items));
  } catch {
    // ignore quota / private mode
  }
}

export function readMetaCheckoutItems(): MetaCatalogLineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(META_CHECKOUT_ITEMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is MetaCatalogLineItem =>
        item != null && typeof item === "object" && "id" in item
    );
  } catch {
    return [];
  }
}

export function clearMetaCheckoutItems(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(META_CHECKOUT_ITEMS_KEY);
  } catch {
    // ignore
  }
}

export function trackMetaEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> = {}
): void {
  switch (eventName) {
    case "product_view": {
      const id = catalogId(payload.productId);
      if (!id) break;
      fbq("track", "ViewContent", {
        ...catalogMatchParams([{ id, quantity: 1 }]),
        content_name: payload.productName,
        content_category: payload.category,
        currency: "USD",
        ...(typeof payload.price === "number" ? { value: payload.price } : {}),
      });
      break;
    }
    case "add_to_cart": {
      const id = catalogId(payload.productId);
      if (!id) break;
      const quantity =
        typeof payload.quantity === "number" && payload.quantity > 0
          ? payload.quantity
          : 1;
      fbq("track", "AddToCart", {
        ...catalogMatchParams([{ id, quantity }]),
        content_name: payload.productName,
        value: payload.price,
        currency: "USD",
      });
      break;
    }
    case "checkout_start": {
      const items = Array.isArray(payload.items)
        ? (payload.items as MetaCatalogLineItem[])
        : [];
      fbq("track", "InitiateCheckout", {
        ...catalogMatchParams(items),
        value: payload.total,
        currency: "USD",
        num_items: payload.itemCount,
      });
      break;
    }
    case "order_completed":
      break;
    default:
      break;
  }
}

export function trackMetaPurchase(input: {
  orderId: string;
  value: number;
  currency?: string;
  items?: MetaCatalogLineItem[];
}): void {
  const items = input.items?.length ? input.items : readMetaCheckoutItems();
  fbq("track", "Purchase", {
    ...catalogMatchParams(items),
    value: input.value,
    currency: input.currency ?? "USD",
    order_id: input.orderId,
  });
  clearMetaCheckoutItems();
}
