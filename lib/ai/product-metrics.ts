import { listAnalyticsEvents } from "@/lib/db/analytics";
import { safeQuery } from "@/lib/db/safe-query";
import { getProductById } from "@/lib/inventory";
import { products } from "@/lib/inventory/products";

export type ProductSignalMetrics = {
  productId: number;
  name: string;
  views: number;
  cartAdds: number;
  checkouts: number;
  orders: number;
  cartRate: number;
  conversionRate: number;
  demandVelocity: number;
};

export async function collectProductSignals(
  eventLimit = 4000
): Promise<ProductSignalMetrics[]> {
  const events = await safeQuery(
    () => listAnalyticsEvents(eventLimit),
    [],
    "product-signals"
  );

  const map = new Map<
    number,
    { views: number; cartAdds: number; checkouts: number; orders: number; name: string }
  >();

  for (const event of events) {
    const productId = Number(event.payload?.productId);
    if (!productId) continue;

    const name =
      typeof event.payload?.productName === "string"
        ? event.payload.productName
        : getProductById(productId)?.name ??
          products.find((p) => p.id === productId)?.name ??
          `Product ${productId}`;

    const row = map.get(productId) ?? {
      views: 0,
      cartAdds: 0,
      checkouts: 0,
      orders: 0,
      name,
    };

    if (event.name === "product_view") row.views += 1;
    if (event.name === "add_to_cart") row.cartAdds += 1;
    if (event.name === "checkout_start") row.checkouts += 1;
    if (event.name === "order_completed") row.orders += 1;

    map.set(productId, row);
  }

  return [...map.entries()]
    .map(([productId, row]) => {
      const cartRate =
        row.views > 0 ? Math.round((row.cartAdds / row.views) * 1000) / 10 : 0;
      const conversionRate =
        row.views > 0 ? Math.round((row.orders / row.views) * 1000) / 10 : 0;

      return {
        productId,
        name: row.name,
        views: row.views,
        cartAdds: row.cartAdds,
        checkouts: row.checkouts,
        orders: row.orders,
        cartRate,
        conversionRate,
        demandVelocity: row.views + row.cartAdds * 4 + row.orders * 10,
      };
    })
    .sort((a, b) => b.demandVelocity - a.demandVelocity);
}

export function estimateUnitCost(retailPrice: number, marginFloor = 0.25): number {
  return Math.round(retailPrice * (1 - marginFloor - 0.17));
}

export function minAllowedPrice(retailPrice: number, marginFloor = 0.25): number {
  const cost = estimateUnitCost(retailPrice, marginFloor);
  return Math.ceil(cost / (1 - marginFloor));
}
