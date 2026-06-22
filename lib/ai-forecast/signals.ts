import { loadEvents } from "@/lib/analytics/store";
import { getAllProducts, getProductById } from "@/lib/inventory";
import { getOrders } from "@/lib/marketplace/orders";
import { getStock } from "@/lib/marketplace/stock";
import type { ProductSignal } from "./types";

const MS_DAY = 86_400_000;
const WINDOW_7D = 7 * MS_DAY;
const WINDOW_14D = 14 * MS_DAY;
const WINDOW_30D = 30 * MS_DAY;

function resolveStock(productId: number): number {
  const product = getProductById(productId);
  const liveStock = getStock(productId);

  if (liveStock > 0) return liveStock;
  if (typeof product?.stockQty === "number") return product.stockQty;
  if (product?.stock === false) return 0;
  return 10;
}

function inWindow(timestamp: number, start: number, end: number): boolean {
  return timestamp >= start && timestamp <= end;
}

export function buildProductSignals(): ProductSignal[] {
  const now = Date.now();
  const start7 = now - WINDOW_7D;
  const start14 = now - WINDOW_14D;
  const start30 = now - WINDOW_30D;
  const prev7Start = now - WINDOW_14D;
  const prev7End = start7;

  const signals = new Map<number, ProductSignal>();

  for (const product of getAllProducts()) {
    signals.set(product.id, {
      productId: product.id,
      productName: product.name,
      category: product.category,
      platform: product.platform,
      price: product.price,
      currentStock: resolveStock(product.id),
      views7d: 0,
      viewsPrev7d: 0,
      cartAdds7d: 0,
      cartAddsPrev7d: 0,
      unitsSold7d: 0,
      unitsSold30d: 0,
      revenue30d: 0,
    });
  }

  for (const event of loadEvents()) {
    const productId = Number(event.payload.productId);
    if (!Number.isFinite(productId)) continue;

    const product = getProductById(productId);
    if (!product) continue;

    if (!signals.has(productId)) {
      signals.set(productId, {
        productId,
        productName:
          typeof event.payload.productName === "string"
            ? event.payload.productName
            : product.name,
        category: product.category,
        platform: product.platform,
        price: product.price,
        currentStock: resolveStock(productId),
        views7d: 0,
        viewsPrev7d: 0,
        cartAdds7d: 0,
        cartAddsPrev7d: 0,
        unitsSold7d: 0,
        unitsSold30d: 0,
        revenue30d: 0,
      });
    }

    const signal = signals.get(productId)!;

    if (event.name === "product_view") {
      if (inWindow(event.createdAt, start7, now)) signal.views7d += 1;
      if (inWindow(event.createdAt, prev7Start, prev7End)) signal.viewsPrev7d += 1;
    }

    if (event.name === "add_to_cart") {
      const qty = Number(event.payload.quantity);
      const amount = Number.isFinite(qty) && qty > 0 ? qty : 1;
      if (inWindow(event.createdAt, start7, now)) signal.cartAdds7d += amount;
      if (inWindow(event.createdAt, prev7Start, prev7End)) {
        signal.cartAddsPrev7d += amount;
      }
    }
  }

  for (const order of getOrders()) {
    if (!inWindow(order.createdAt, start30, now)) continue;

    for (const item of order.items) {
      const signal = signals.get(item.productId);
      if (!signal) continue;

      signal.unitsSold30d += item.quantity;
      signal.revenue30d += item.price * item.quantity;

      if (inWindow(order.createdAt, start7, now)) {
        signal.unitsSold7d += item.quantity;
      }
    }
  }

  return [...signals.values()].filter(
    (signal) =>
      signal.views7d > 0 ||
      signal.viewsPrev7d > 0 ||
      signal.cartAdds7d > 0 ||
      signal.cartAddsPrev7d > 0 ||
      signal.unitsSold7d > 0 ||
      signal.unitsSold30d > 0
  );
}

export function estimateDailyDemand(signal: ProductSignal): number {
  const soldRate = signal.unitsSold7d / 7;
  const cartRate = signal.cartAdds7d / 7;
  const viewRate = signal.views7d / 7;

  const intentDemand = cartRate * 0.45 + viewRate * 0.06;

  if (soldRate > 0 && intentDemand > 0) {
    return soldRate * 0.65 + intentDemand * 0.35;
  }

  return Math.max(soldRate, intentDemand);
}

export function computeMomentum(current: number, previous: number): number {
  if (previous <= 0 && current <= 0) return 0;
  if (previous <= 0) return 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function computeDemandScore(signal: ProductSignal): number {
  return Number(
    (
      signal.views7d * 1 +
      signal.cartAdds7d * 4 +
      signal.unitsSold7d * 8 +
      signal.unitsSold30d * 2
    ).toFixed(2)
  );
}

export function computeConfidence(signal: ProductSignal): number {
  const dataPoints =
    signal.views7d +
    signal.cartAdds7d +
    signal.unitsSold7d +
    signal.unitsSold30d;

  if (dataPoints >= 40) return 95;
  if (dataPoints >= 20) return 80;
  if (dataPoints >= 8) return 65;
  if (dataPoints >= 3) return 45;
  if (dataPoints >= 1) return 25;
  return 10;
}
