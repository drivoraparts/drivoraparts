import { buildProductSignals, computeMomentum } from "./signals";
import type { TrendingEngine } from "./types";

function formatPlatformLabel(platform: string): string {
  return platform
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getTrendingEngines(
  signals = buildProductSignals()
): TrendingEngine[] {
  const engineSignals = signals.filter(
    (signal) => signal.category === "engine" && signal.platform
  );

  const platforms = new Map<
    string,
    {
      views7d: number;
      viewsPrev7d: number;
      cartAdds7d: number;
      cartAddsPrev7d: number;
      unitsSold7d: number;
      topProductId: number;
      topProductName: string;
      topScore: number;
    }
  >();

  for (const signal of engineSignals) {
    const platform = signal.platform!;
    const score = signal.views7d * 1.5 + signal.cartAdds7d * 4 + signal.unitsSold7d * 6;
    const existing = platforms.get(platform);

    if (!existing) {
      platforms.set(platform, {
        views7d: signal.views7d,
        viewsPrev7d: signal.viewsPrev7d,
        cartAdds7d: signal.cartAdds7d,
        cartAddsPrev7d: signal.cartAddsPrev7d,
        unitsSold7d: signal.unitsSold7d,
        topProductId: signal.productId,
        topProductName: signal.productName,
        topScore: score,
      });
      continue;
    }

    existing.views7d += signal.views7d;
    existing.viewsPrev7d += signal.viewsPrev7d;
    existing.cartAdds7d += signal.cartAdds7d;
    existing.cartAddsPrev7d += signal.cartAddsPrev7d;
    existing.unitsSold7d += signal.unitsSold7d;

    if (score > existing.topScore) {
      existing.topScore = score;
      existing.topProductId = signal.productId;
      existing.topProductName = signal.productName;
    }
  }

  return [...platforms.entries()]
    .map(([platform, data]) => {
      const viewMomentum = computeMomentum(data.views7d, data.viewsPrev7d);
      const cartMomentum = computeMomentum(data.cartAdds7d, data.cartAddsPrev7d);
      const momentum = Number(((viewMomentum * 0.4 + cartMomentum * 0.6).toFixed(1)));

      return {
        platform,
        platformLabel: formatPlatformLabel(platform),
        momentum,
        views7d: data.views7d,
        cartAdds7d: data.cartAdds7d,
        unitsSold7d: data.unitsSold7d,
        topProductId: data.topProductId,
        topProductName: data.topProductName,
      };
    })
    .sort((a, b) => b.momentum - a.momentum || b.views7d - a.views7d)
    .slice(0, 10);
}
