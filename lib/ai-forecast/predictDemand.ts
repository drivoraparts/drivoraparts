import {
  buildProductSignals,
  computeDemandScore,
  computeMomentum,
} from "./signals";
import type { DemandPrediction, DemandTrend } from "./types";

function resolveTrend(momentum: number): DemandTrend {
  if (momentum >= 15) return "rising";
  if (momentum <= -15) return "falling";
  return "stable";
}

export function predictDemand(
  signals = buildProductSignals()
): DemandPrediction[] {
  return signals
    .map((signal) => {
      const viewMomentum = computeMomentum(signal.views7d, signal.viewsPrev7d);
      const cartMomentum = computeMomentum(
        signal.cartAdds7d,
        signal.cartAddsPrev7d
      );
      const momentum = Number(((viewMomentum * 0.45 + cartMomentum * 0.55).toFixed(1)));

      return {
        productId: signal.productId,
        productName: signal.productName,
        trend: resolveTrend(momentum),
        momentum,
        demandScore: computeDemandScore(signal),
      };
    })
    .sort((a, b) => b.demandScore - a.demandScore);
}
