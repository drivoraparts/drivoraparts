import { getProductById } from "@/lib/inventory";
import { collectProductSignals } from "./product-metrics";

export type ViralProduct = {
  productId: number;
  name: string;
  viralScore: number;
  views: number;
  cartAdds: number;
  cartRate: number;
  conversionRate: number;
  conversionLag: number;
  signal: "rising" | "hot" | "watch";
};

export type ViralProductsReport = {
  generatedAt: number;
  products: ViralProduct[];
  source: "live" | "fallback";
};

function computeViralScore(metrics: {
  views: number;
  cartAdds: number;
  cartRate: number;
  conversionRate: number;
  orders: number;
}): { score: number; conversionLag: number; signal: ViralProduct["signal"] } {
  const conversionLag = Math.max(0, metrics.cartRate - metrics.conversionRate * 2);

  if (metrics.views < 2 && metrics.cartAdds === 0) {
    return { score: 0, conversionLag, signal: "watch" };
  }

  const viewScore = Math.min(30, metrics.views * 2);
  const cartScore = Math.min(35, metrics.cartRate * 3.5);
  const lagBonus = Math.min(25, conversionLag * 2.5);
  const orderBonus = Math.min(10, metrics.orders * 5);

  const score = Math.min(
    100,
    Math.round(viewScore + cartScore + lagBonus + orderBonus)
  );

  const signal: ViralProduct["signal"] =
    score >= 75 ? "hot" : score >= 45 ? "rising" : "watch";

  return { score, conversionLag, signal };
}

export async function detectViralProducts(limit = 12): Promise<ViralProductsReport> {
  const signals = await collectProductSignals();

  if (!signals.length) {
    return { generatedAt: Date.now(), products: [], source: "fallback" };
  }

  const products: ViralProduct[] = signals
    .map((row) => {
      const { score, conversionLag, signal } = computeViralScore(row);
      return {
        productId: row.productId,
        name: row.name,
        viralScore: score,
        views: row.views,
        cartAdds: row.cartAdds,
        cartRate: row.cartRate,
        conversionRate: row.conversionRate,
        conversionLag: Math.round(conversionLag * 10) / 10,
        signal,
      };
    })
    .filter((p) => p.viralScore >= 20 && getProductById(p.productId))
    .sort((a, b) => b.viralScore - a.viralScore)
    .slice(0, limit);

  return {
    generatedAt: Date.now(),
    products,
    source: products.length ? "live" : "fallback",
  };
}
