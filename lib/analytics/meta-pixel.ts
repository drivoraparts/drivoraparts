import type { AnalyticsEventName } from "./types";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq(...args);
}

export function trackMetaEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> = {}
): void {
  switch (eventName) {
    case "product_view":
      fbq("track", "ViewContent", {
        content_ids: [String(payload.productId ?? "")],
        content_name: payload.productName,
        content_type: "product",
        content_category: payload.category,
        currency: "USD",
      });
      break;
    case "add_to_cart":
      fbq("track", "AddToCart", {
        content_ids: [String(payload.productId ?? "")],
        content_name: payload.productName,
        content_type: "product",
        value: payload.price,
        currency: "USD",
      });
      break;
    case "checkout_start":
      fbq("track", "InitiateCheckout", {
        value: payload.total,
        currency: "USD",
        num_items: payload.itemCount,
      });
      break;
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
}): void {
  fbq("track", "Purchase", {
    value: input.value,
    currency: input.currency ?? "USD",
    content_type: "product",
    order_id: input.orderId,
  });
}
