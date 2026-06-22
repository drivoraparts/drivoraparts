import type { DailyBusinessDecisions, ProductDecision } from "./decision-brain";
import { getDailyBusinessDecisions } from "./decision-brain";

export type ActionPriority = "high" | "medium" | "low";

export type RankedAction = {
  priority: ActionPriority;
  action: string;
  productId?: number;
  productName?: string;
  confidence: number;
  reason: string;
  expectedImpact: string;
};

export type ActionRecommendationReport = {
  generatedAt: number;
  highImpact: RankedAction[];
  mediumImpact: RankedAction[];
  lowPriority: RankedAction[];
  source: "live" | "fallback";
};

function classifyPriority(confidence: number, action: string): ActionPriority {
  if (
    confidence >= 85 ||
    action === "stop selling" ||
    action === "restock product"
  ) {
    return "high";
  }
  if (confidence >= 65 || action === "run ad campaign" || action === "increase price") {
    return "medium";
  }
  return "low";
}

function decisionToRanked(decision: ProductDecision, reason: string): RankedAction {
  return {
    priority: classifyPriority(decision.confidence, decision.action),
    action: decision.action,
    productId: decision.productId,
    productName: decision.productName,
    confidence: decision.confidence,
    reason,
    expectedImpact: decision.expectedImpact,
  };
}

export async function getActionRecommendations(
  brain?: DailyBusinessDecisions
): Promise<ActionRecommendationReport> {
  const decisions = brain ?? (await getDailyBusinessDecisions());

  const highImpact: RankedAction[] = [];
  const mediumImpact: RankedAction[] = [];
  const lowPriority: RankedAction[] = [];

  for (const decision of decisions.productDecisions) {
    const ranked = decisionToRanked(
      decision,
      `${decision.action} recommended with ${decision.confidence}% confidence for ${decision.productName}.`
    );

    if (ranked.priority === "high") highImpact.push(ranked);
    else if (ranked.priority === "medium") mediumImpact.push(ranked);
    else lowPriority.push(ranked);
  }

  for (const action of decisions.topActions) {
    const generic: RankedAction = {
      priority: classifyPriority(70, action),
      action,
      confidence: 70,
      reason: `Strategic priority flagged in today's decision brain.`,
      expectedImpact: "Supports daily revenue and inventory balance.",
    };

    if (generic.priority === "high") highImpact.push(generic);
    else if (generic.priority === "medium") mediumImpact.push(generic);
    else lowPriority.push(generic);
  }

  return {
    generatedAt: Date.now(),
    highImpact: highImpact.slice(0, 8),
    mediumImpact: mediumImpact.slice(0, 10),
    lowPriority: lowPriority.slice(0, 10),
    source: decisions.source,
  };
}
