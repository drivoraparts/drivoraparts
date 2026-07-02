import { TIKTOK_PIXEL_ID } from "@/lib/env";
import type { AnalyticsEventName } from "./types";
import {
  readMetaCheckoutItems,
  type MetaCatalogLineItem,
} from "./meta-pixel";

declare global {
  interface Window {
    ttq?: {
      track?: (event: string, payload?: Record<string, unknown>) => void;
      page?: () => void;
      ready?: (callback: () => void) => void;
      instance?: (pixelId: string) => {
        track: (event: string, payload?: Record<string, unknown>) => void;
      };
    };
  }
}

function ttqTrack(event: string, payload: Record<string, unknown> = {}): void {
  if (typeof window === "undefined" || !window.ttq) return;

  const run = () => {
    const bound = window.ttq?.instance?.(TIKTOK_PIXEL_ID);
    if (bound?.track) {
      bound.track(event, payload);
      return;
    }
    window.ttq?.track?.(event, payload);
  };

  if (typeof window.ttq.ready === "function") {
    window.ttq.ready(run);
  } else {
    run();
  }
}

function catalogId(value: unknown): string | null {
  const id = String(value ?? "").trim();
  return id ? id : null;
}

function tiktokContents(
  items: MetaCatalogLineItem[],
  productName?: unknown
): Record<string, unknown> {
  const contents = items
    .map((item) => {
      const content_id = catalogId(item.id);
      if (!content_id) return null;
      return {
        content_id,
        content_type: "product",
        ...(productName ? { content_name: String(productName) } : {}),
        quantity:
          typeof item.quantity === "number" && item.quantity > 0
            ? item.quantity
            : 1,
      };
    })
    .filter((line): line is NonNullable<typeof line> => line != null);

  if (!contents.length) return { content_type: "product" };
  return { contents, content_type: "product" };
}

export function trackTikTokEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> = {}
): void {
  switch (eventName) {
    case "product_view": {
      const id = catalogId(payload.productId);
      if (!id) break;
      ttqTrack("ViewContent", {
        ...tiktokContents([{ id, quantity: 1 }], payload.productName),
        value: typeof payload.price === "number" ? payload.price : undefined,
        currency: "USD",
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
      ttqTrack("AddToCart", {
        ...tiktokContents([{ id, quantity }], payload.productName),
        value: payload.price,
        currency: "USD",
      });
      break;
    }
    case "checkout_start": {
      const items = Array.isArray(payload.items)
        ? (payload.items as MetaCatalogLineItem[])
        : [];
      ttqTrack("InitiateCheckout", {
        ...tiktokContents(items),
        value: payload.total,
        currency: "USD",
      });
      break;
    }
    case "order_completed":
      break;
    default:
      break;
  }
}

export function trackTikTokPurchase(input: {
  orderId: string;
  value: number;
  currency?: string;
  items?: MetaCatalogLineItem[];
}): void {
  const items = input.items?.length ? input.items : readMetaCheckoutItems();
  ttqTrack("CompletePayment", {
    ...tiktokContents(items),
    value: input.value,
    currency: input.currency ?? "USD",
  });
}
