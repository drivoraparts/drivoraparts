import { getInventoryAlerts } from "@/lib/db/inventory";
import { safeQuery } from "@/lib/db/safe-query";
import { generateAutopilotAds } from "@/lib/ads/autopilot";
import { analyzeCustomerBehavior } from "@/lib/ai/customers";
import { getPricingRecommendations } from "@/lib/ai/pricing";
import { detectViralProducts } from "@/lib/ai/viral-detector";
import { collectProductSignals } from "@/lib/ai/product-metrics";
import { getSupplierEngineRecommendations } from "@/lib/suppliers/engine";
import { generateSocialContentBatch } from "@/lib/content/social";
import { persistAiDecisions } from "@/lib/db/ai-decisions";
import { getDailyBusinessDecisions } from "./decision-brain";

export type DecisionAction = {
  type: "advertise" | "restock" | "increase_price" | "decrease_price" | "stop_selling" | "fix_now";
  productId: number;
  productName: string;
  priority: "critical" | "high" | "medium" | "low";
  reason: string;
  expectedImpact: string;
};

export type AutonomousDecisionReport = {
  generatedAt: number;
  makingMoneyToday: DecisionAction[];
  willTrendTomorrow: DecisionAction[];
  fixNow: DecisionAction[];
  advertiseToday: DecisionAction[];
  restockNow: DecisionAction[];
  increasePriceOn: DecisionAction[];
  stopSelling: DecisionAction[];
  summary: string;
  source: "live" | "fallback";
};

function action(
  partial: Omit<DecisionAction, "type"> & { type: DecisionAction["type"] }
): DecisionAction {
  return partial;
}

export async function getAutonomousDecisions(): Promise<AutonomousDecisionReport> {
  const brain = await safeQuery(() => getDailyBusinessDecisions(), null, "decisions-brain-bridge");

  const [viral, pricing, suppliers, behavior, autopilot, alerts, signals] =
    await Promise.all([
      safeQuery(() => detectViralProducts(8), null, "decisions-viral"),
      safeQuery(() => getPricingRecommendations(), null, "decisions-pricing"),
      safeQuery(() => getSupplierEngineRecommendations(), null, "decisions-suppliers"),
      safeQuery(() => analyzeCustomerBehavior(), null, "decisions-behavior"),
      safeQuery(() => generateAutopilotAds(4), null, "decisions-autopilot"),
      safeQuery(() => getInventoryAlerts(), [], "decisions-alerts"),
      collectProductSignals(),
    ]);

  const advertiseToday: DecisionAction[] = [];
  const restockNow: DecisionAction[] = [];
  const increasePriceOn: DecisionAction[] = [];
  const stopSelling: DecisionAction[] = [];
  const fixNow: DecisionAction[] = [];
  const makingMoneyToday: DecisionAction[] = [];
  const willTrendTomorrow: DecisionAction[] = [];

  for (const product of viral?.products ?? []) {
    if (product.viralScore >= 60) {
      advertiseToday.push(
        action({
          type: "advertise",
          productId: product.productId,
          productName: product.name,
          priority: product.viralScore >= 80 ? "critical" : "high",
          reason: `Viral score ${product.viralScore} with ${product.cartRate}% cart rate.`,
          expectedImpact: "Accelerate paid social and TikTok creative rotation.",
        })
      );
    }

    if (product.signal === "rising" || product.signal === "hot") {
      willTrendTomorrow.push(
        action({
          type: "advertise",
          productId: product.productId,
          productName: product.name,
          priority: "medium",
          reason: `Conversion lag ${product.conversionLag}% — demand building faster than checkout.`,
          expectedImpact: "Prepare ad budget for tomorrow's spike.",
        })
      );
    }
  }

  for (const rec of pricing?.recommendations ?? []) {
    if (rec.direction === "increase") {
      increasePriceOn.push(
        action({
          type: "increase_price",
          productId: rec.productId,
          productName: rec.productName,
          priority: "high",
          reason: rec.reason,
          expectedImpact: rec.expectedImpact,
        })
      );
    } else if (rec.direction === "decrease") {
      fixNow.push(
        action({
          type: "decrease_price",
          productId: rec.productId,
          productName: rec.productName,
          priority: "medium",
          reason: rec.reason,
          expectedImpact: rec.expectedImpact,
        })
      );
    }
  }

  for (const rec of suppliers?.recommendations ?? []) {
    if (rec.urgencyScore >= 55) {
      restockNow.push(
        action({
          type: "restock",
          productId: rec.productId,
          productName: rec.productName,
          priority: rec.urgencyScore >= 80 ? "critical" : "high",
          reason: rec.restockRecommendation,
          expectedImpact: `+$${rec.estimatedProfitImpact} profit if restocked via ${rec.recommendedSupplier.name}.`,
        })
      );
    }
  }

  for (const alert of alerts) {
    if (alert.severity === "out") {
      stopSelling.push(
        action({
          type: "stop_selling",
          productId: alert.productId,
          productName: alert.productName,
          priority: "critical",
          reason: "Out of stock — pause ads and storefront push until replenished.",
          expectedImpact: "Prevent paid traffic waste and negative CX.",
        })
      );

      fixNow.push(
        action({
          type: "fix_now",
          productId: alert.productId,
          productName: alert.productName,
          priority: "critical",
          reason: "Zero inventory blocks revenue capture.",
          expectedImpact: "Restore listing availability ASAP.",
        })
      );
    }
  }

  for (const row of signals.filter((s) => s.orders >= 1).slice(0, 5)) {
    makingMoneyToday.push(
      action({
        type: "advertise",
        productId: row.productId,
        productName: row.name,
        priority: "high",
        reason: `${row.orders} completed orders with ${row.conversionRate}% conversion.`,
        expectedImpact: "Scale winning creative on Meta + Google.",
      })
    );
  }

  if (behavior && behavior.overallCartAbandonmentRate >= 40) {
    fixNow.push(
      action({
        type: "fix_now",
        productId: 0,
        productName: "Checkout funnel",
        priority: "high",
        reason: `Cart abandonment at ${behavior.overallCartAbandonmentRate}%.`,
        expectedImpact: "Improve checkout trust, shipping clarity, and payment UX.",
      })
    );
  }

  const summary = [
    brain ? `Brain: ${brain.topActions.slice(0, 3).join(", ")}` : "",
    `${advertiseToday.length} products to advertise today`,
    `${restockNow.length} restock actions`,
    `${increasePriceOn.length} price increases`,
    `${stopSelling.length} listings to pause`,
    autopilot ? `${autopilot.ads.length} autopilot ad variants ready` : "Autopilot warming up",
  ].join(" · ");

  const report: AutonomousDecisionReport = {
    generatedAt: Date.now(),
    makingMoneyToday: makingMoneyToday.slice(0, 6),
    willTrendTomorrow: willTrendTomorrow.slice(0, 6),
    fixNow: fixNow.slice(0, 6),
    advertiseToday: advertiseToday.slice(0, 8),
    restockNow: restockNow.slice(0, 8),
    increasePriceOn: increasePriceOn.slice(0, 8),
    stopSelling: stopSelling.slice(0, 6),
    summary,
    source: signals.length ? "live" : "fallback",
  };

  const contentPacks = await generateSocialContentBatch(
    advertiseToday.slice(0, 4).map((a) => a.productId)
  );

  await persistAiDecisions({
    ...report,
    autopilotAdCount: autopilot?.ads.length ?? 0,
    contentPackCount: contentPacks.packs.length,
    topAdvertiseProduct: advertiseToday[0]?.productName ?? null,
  });

  return report;
}

export async function getMarketingAutopilotBundle() {
  const [decisions, viral, pricing, autopilot, content, suppliers, behavior] =
    await Promise.all([
      getAutonomousDecisions(),
      detectViralProducts(8),
      getPricingRecommendations(),
      generateAutopilotAds(5),
      generateSocialContentBatch(undefined, 6),
      getSupplierEngineRecommendations(),
      analyzeCustomerBehavior(),
    ]);

  return {
    decisions,
    viral,
    pricing,
    autopilot,
    content,
    suppliers,
    behavior,
    conversionPrediction: {
      next7DayLift: viral.products.length >= 3 ? "+12–18%" : "+4–8%",
      confidence: viral.source === "live" ? "medium" : "low",
    },
  };
}
