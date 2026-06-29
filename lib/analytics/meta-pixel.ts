import type { AnalyticsEventName } from "./types";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function getMetaPixelId(): string | null {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  return id || null;
}

export function trackMetaEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined" || !window.fbq) return;

  switch (eventName) {
    case "product_view":
      window.fbq("track", "ViewContent", {
        content_ids: payload.productId ? [String(payload.productId)] : undefined,
        content_name: payload.productName,
        content_category: payload.category,
        content_type: "product",
        value: payload.price,
        currency: "USD",
      });
      break;
    case "add_to_cart":
      window.fbq("track", "AddToCart", {
        content_ids: payload.productId ? [String(payload.productId)] : undefined,
        content_name: payload.productName,
        content_type: "product",
        value: payload.price,
        currency: "USD",
      });
      break;
    case "checkout_start":
      window.fbq("track", "InitiateCheckout", {
        value: payload.total,
        currency: "USD",
        num_items: payload.itemCount,
      });
      break;
    case "order_completed":
      window.fbq("track", "Purchase", {
        value: payload.total,
        currency: "USD",
        num_items: payload.itemCount,
      });
      break;
    default:
      break;
  }
}
