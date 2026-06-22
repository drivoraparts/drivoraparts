import { listAnalyticsEvents } from "@/lib/db/analytics";
import { getInventoryAlerts } from "@/lib/db/inventory";
import { safeQuery } from "@/lib/db/safe-query";
import { listOrders } from "@/lib/db/orders";
import { getProductById } from "@/lib/inventory";
import { products } from "@/lib/inventory/products";

export type PricingSuggestion = {
  productId: number;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  direction: "increase" | "decrease" | "hold";
  reason: string;
  expectedImpact: string;
};

export type BundleSuggestion = {
  title: string;
  productIds: number[];
  products: string[];
  estimatedLift: string;
  reason: string;
};

export type RevenueRiskAlert = {
  productId: number;
  productName: string;
  severity: "medium" | "high" | "critical";
  message: string;
};

export type RevenueOptimizationReport = {
  generatedAt: number;
  pricingSuggestions: PricingSuggestion[];
  bundleSuggestions: BundleSuggestion[];
  riskAlerts: RevenueRiskAlert[];
  source: "live" | "fallback";
};

export async function getRevenueOptimizationReport(): Promise<RevenueOptimizationReport> {
  const [events, alerts, orders] = await Promise.all([
    safeQuery(() => listAnalyticsEvents(3000), [], "revenue-opt-events"),
    safeQuery(() => getInventoryAlerts(), [], "revenue-opt-alerts"),
    safeQuery(() => listOrders(200), [], "revenue-opt-orders"),
  ]);

  const metrics = new Map<
    number,
    { views: number; carts: number; orders: number; name: string }
  >();

  for (const event of events) {
    const productId = Number(event.payload?.productId);
    if (!productId) continue;
    const name =
      typeof event.payload?.productName === "string"
        ? event.payload.productName
        : getProductById(productId)?.name ?? `Product ${productId}`;
    const row = metrics.get(productId) ?? { views: 0, carts: 0, orders: 0, name };
    if (event.name === "product_view") row.views += 1;
    if (event.name === "add_to_cart") row.carts += 1;
    if (event.name === "order_completed") row.orders += 1;
    metrics.set(productId, row);
  }

  const pricingSuggestions: PricingSuggestion[] = [];

  for (const [productId, row] of metrics.entries()) {
    const product = getProductById(productId);
    if (!product) continue;

    const conversion =
      row.views > 0 ? (row.orders / row.views) * 100 : row.carts > 3 ? 5 : 0;

    if (row.views >= 8 && conversion < 1.5 && row.carts >= 2) {
      const decrease = Math.round(product.price * 0.93);
      pricingSuggestions.push({
        productId,
        productName: row.name,
        currentPrice: product.price,
        suggestedPrice: decrease,
        direction: "decrease",
        reason: "High interest but low conversion — price friction likely.",
        expectedImpact: "+8–15% conversion lift estimate",
      });
    } else if (row.orders >= 2 && conversion >= 4) {
      const increase = Math.round(product.price * 1.07);
      pricingSuggestions.push({
        productId,
        productName: row.name,
        currentPrice: product.price,
        suggestedPrice: increase,
        direction: "increase",
        reason: "Strong demand velocity with healthy conversion.",
        expectedImpact: "+5–10% margin without major volume loss",
      });
    } else if (row.views <= 2 && row.carts === 0) {
      pricingSuggestions.push({
        productId,
        productName: row.name,
        currentPrice: product.price,
        suggestedPrice: product.price,
        direction: "hold",
        reason: "Underperforming visibility — optimize ads before repricing.",
        expectedImpact: "Bundle or ad push recommended first",
      });
    }
  }

  const riskAlerts: RevenueRiskAlert[] = alerts.map((alert) => {
    const velocity = metrics.get(alert.productId)?.carts ?? 0;
    const severity: RevenueRiskAlert["severity"] =
      alert.severity === "out"
        ? "critical"
        : velocity >= 4
          ? "high"
          : "medium";

    return {
      productId: alert.productId,
      productName: alert.productName,
      severity,
      message:
        alert.severity === "out"
          ? "Out of stock — revenue leakage on active demand."
          : `Only ${alert.quantity} units left with ${velocity} recent cart signals.`,
    };
  }).slice(0, 10);

  const topPerformers = [...metrics.entries()]
    .sort(
      (a, b) =>
        b[1].orders * 10 + b[1].carts * 3 + b[1].views -
        (a[1].orders * 10 + a[1].carts * 3 + a[1].views)
    )
    .slice(0, 3)
    .map(([id]) => getProductById(id))
    .filter(Boolean);

  const bundleSuggestions: BundleSuggestion[] = [];

  if (topPerformers.length >= 2) {
    bundleSuggestions.push({
      title: "Performance Build Bundle",
      productIds: topPerformers.map((p) => p!.id),
      products: topPerformers.map((p) => p!.name),
      estimatedLift: "+12–18% AOV",
      reason: "Top converters share enthusiast buyer intent — bundle for lift.",
    });
  }

  const sameCategory = products
    .filter((p) => p.category === topPerformers[0]?.category)
    .slice(0, 3);

  if (sameCategory.length >= 2) {
    bundleSuggestions.push({
      title: `${sameCategory[0].category} Essentials Pack`,
      productIds: sameCategory.map((p) => p.id),
      products: sameCategory.map((p) => p.name),
      estimatedLift: "+8–12% attach rate",
      reason: "Category affinity bundle for checkout upsell.",
    });
  }

  const paidCount = orders.filter((o) => o.status === "paid").length;

  return {
    generatedAt: Date.now(),
    pricingSuggestions: pricingSuggestions.slice(0, 8),
    bundleSuggestions,
    riskAlerts,
    source: events.length || paidCount ? "live" : "fallback",
  };
}
