import { getNowPaymentsApiKey, getNowPaymentsIpnSecret, isSupabaseConfigured } from "@/lib/env";
import { classifyAssistantIntent, getIntentSuggestions } from "./intents";
import {
  getAnalyticsOverview,
  getBusinessSnapshot,
  getDecisionBrainSnapshot,
  getInventoryStatus,
  getLiveOperations,
  getPaymentRecords,
  getRecentOrders,
  getRevenue,
  getTopProducts,
  getUsersOnline,
  simulateProductScenario,
} from "./tools";
import type { AssistantIntent, AssistantResponse } from "./types";

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

const DATA_DEPENDENT_INTENTS = new Set<AssistantIntent>([
  "revenue",
  "orders",
  "products",
  "inventory",
  "analytics",
  "users",
  "stock",
  "suppliers",
  "optimization",
  "forecast",
  "strategy",
  "decisions",
]);

function supabaseSetupReply(intent: AssistantIntent): AssistantResponse {
  return {
    reply:
      "Live analytics are offline because Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in Cloudflare Pages → Settings → Environment variables, then run supabase/migrations/001_initial_schema.sql in the Supabase SQL Editor. Until then, dashboard metrics stay at safe zeros and I cannot answer revenue or order questions accurately.",
    suggestions: [
      "Is NOWPayments configured?",
      "What works without Supabase?",
      "Show payment provider status",
    ],
    intent,
  };
}

function worksWithoutSupabaseReply(): AssistantResponse {
  return {
    reply:
      "Without Supabase you still have: storefront catalog, cart, NOWPayments checkout redirect, admin login, and system toggles. Missing: persisted orders in dashboard, analytics charts, inventory sync, and AI insights tied to live sales.",
    suggestions: [
      "Is NOWPayments configured?",
      "How do I connect Supabase?",
      "Show payment provider status",
    ],
    intent: "general",
  };
}

function explainDecision(
  action: string,
  productName: string,
  confidence: number,
  impact: string
): string {
  return `I'm recommending "${action}" on ${productName} (${confidence}% confidence) because ${impact.toLowerCase()}`;
}

export async function generateAdminAssistantReply(
  message: string
): Promise<AssistantResponse> {
  const text = message.toLowerCase().trim();
  const intent = classifyAssistantIntent(message);
  const suggestions = getIntentSuggestions(intent);
  const supabaseReady = isSupabaseConfigured();

  if (!message.trim()) {
    return {
      reply:
        "I'm your COO AI. I analyze the decision brain daily — ask what to advertise, restock, price, scale, or stop, and I'll explain why.",
      suggestions,
      intent,
    };
  }

  if (
    !supabaseReady &&
    (text.includes("supabase") ||
      text.includes("connect") ||
      text.includes("database") ||
      text.includes("analytics database"))
  ) {
    return supabaseSetupReply(intent);
  }

  if (!supabaseReady && (text.includes("without supabase") || text.includes("what works"))) {
    return worksWithoutSupabaseReply();
  }

  if (!supabaseReady && intent === "payments") {
    const nowpaymentsApiConfigured = Boolean(
      getNowPaymentsApiKey() && getNowPaymentsIpnSecret()
    );
    return {
      reply: nowpaymentsApiConfigured
        ? "NOWPayments API keys are set. Checkout creates crypto invoices and IPN webhooks can confirm payment. Order history in admin stays empty until Supabase is connected."
        : "NOWPayments checkout uses your hosted payment link. Add NOWPAYMENTS_API_KEY and NOWPAYMENTS_IPN_SECRET for dynamic invoices and automatic payment confirmation. Connect Supabase to persist orders in the admin dashboard.",
      suggestions,
      intent,
    };
  }

  if (!supabaseReady && DATA_DEPENDENT_INTENTS.has(intent)) {
    return supabaseSetupReply(intent);
  }

  if (intent === "strategy" || intent === "decisions" || text.includes("why")) {
    const { brain, report, actions } = await getDecisionBrainSnapshot();

    if (!brain) {
      return {
        reply: "Decision brain is warming up — need more analytics before strategic recommendations.",
        suggestions,
        intent,
      };
    }

    const top = brain.productDecisions.slice(0, 3);
    const high = actions?.highImpact.slice(0, 2) ?? [];

    if (text.includes("why") && top[0]) {
      return {
        reply: explainDecision(
          top[0].action,
          top[0].productName,
          top[0].confidence,
          top[0].expectedImpact
        ),
        suggestions,
        intent,
        data: { brain, report, actions },
      };
    }

    return {
      reply: `Today's plan (${brain.date}): ${brain.topActions.join(", ")}. ${top.length ? `Top product moves: ${top.map((d) => `${d.productName} → ${d.action}`).join("; ")}.` : ""}${high[0] ? ` Urgent: ${high[0].action}${high[0].productName ? ` for ${high[0].productName}` : ""}.` : ""}${report ? ` Revenue today ~${formatMoney(report.revenuePrediction.todayEstimate)}.` : ""}`,
      suggestions,
      intent,
      data: { brain, report, actions },
    };
  }

  if (text.includes("simulate") || text.includes("what if")) {
    const top = await getTopProducts();
    const productId = top[0]?.productId ?? 1;
    const sim = await simulateProductScenario(productId, "price_increase");
    if (!sim) {
      return {
        reply: "Simulation unavailable — pick a valid product to model scenarios.",
        suggestions,
        intent: "strategy",
      };
    }
    return {
      reply: `Simulation: ${sim.summary} Revenue change ${sim.projectedRevenueChangePercent >= 0 ? "+" : ""}${sim.projectedRevenueChangePercent}%, conversion ${sim.projectedConversionChange >= 0 ? "+" : ""}${sim.projectedConversionChange}%, risk ${sim.riskLevel}.`,
      suggestions,
      intent: "strategy",
      data: sim,
    };
  }

  switch (intent) {
    case "users": {
      const { realtime, live } = await getLiveOperations();
      const topPage = live?.pages[0];
      return {
        reply: `${live?.activeUsers ?? realtime?.activeUsers ?? 0} users active now. Avg session ${Math.round((live?.averageSessionTime ?? 0) / 1000)}s. Revenue last 60m: ${formatMoney(realtime?.revenueLast60Min ?? 0)}.${topPage ? ` Hottest page: ${topPage.page} (${topPage.activeUsers} users).` : ""}`,
        suggestions,
        intent,
        data: { live, realtime },
      };
    }

    case "inventory":
    case "stock": {
      const { stats, alerts } = await getInventoryStatus();
      if (!alerts.length) {
        return {
          reply: `Inventory stable. ${stats.totalSkus} SKUs tracked, ${stats.lowStock} low, ${stats.outOfStock} out.`,
          suggestions,
          intent,
        };
      }
      return {
        reply: `Inventory alert: ${alerts
          .slice(0, 4)
          .map((a) => `${a.productName} (${a.quantity} left, ${a.severity})`)
          .join("; ")}.`,
        suggestions,
        intent,
        data: { stats, alerts },
      };
    }

    case "suppliers": {
      const snapshot = await getBusinessSnapshot();
      const recs = snapshot.suppliers?.recommendations.slice(0, 3) ?? [];
      if (!recs.length) {
        return {
          reply: "No urgent supplier actions. Inventory risk is manageable.",
          suggestions,
          intent,
        };
      }
      return {
        reply: recs
          .map(
            (item) =>
              `${item.productName}: urgency ${item.urgencyScore}/100 — ${item.restockRecommendation} Est. profit impact ${formatMoney(item.estimatedProfitImpact)} via ${item.recommendedSupplier.name}.`
          )
          .join(" "),
        suggestions,
        intent,
        data: { recommendations: recs },
      };
    }

    case "payments": {
      const [payments, revenue] = await Promise.all([
        getPaymentRecords(30),
        getRevenue(),
      ]);
      const nowpaymentsApiConfigured = Boolean(
        getNowPaymentsApiKey() && getNowPaymentsIpnSecret()
      );
      return {
        reply: nowpaymentsApiConfigured
          ? `NOWPayments active. ${revenue.payments.paid} paid (${formatMoney(revenue.payments.paidAmount)}), ${revenue.payments.pending} pending. Crypto revenue: ${formatMoney(revenue.payments.cryptomusPaidAmount)}.`
          : `NOWPayments checkout uses your hosted payment link. ${revenue.payments.paid} paid (${formatMoney(revenue.payments.paidAmount)}), ${revenue.payments.pending} pending.`,
        suggestions,
        intent,
        data: { payments, nowpaymentsApiConfigured },
      };
    }

    case "orders": {
      const orders = await getRecentOrders(8);
      const pending = orders.filter((o) => o.status === "pending").length;
      return {
        reply: `${orders.length} recent orders, ${pending} pending. Latest: ${orders[0] ? `${formatMoney(orders[0].total)} (${orders[0].status})` : "none yet"}.`,
        suggestions,
        intent,
        data: { orders },
      };
    }

    case "products": {
      const top = await getTopProducts();
      if (!top.length) {
        return {
          reply: "Not enough product activity yet. More views and cart events will improve rankings.",
          suggestions,
          intent,
        };
      }
      return {
        reply: `Top demand products: ${top
          .slice(0, 5)
          .map((p) => `${p.name} (velocity ${p.demandVelocity})`)
          .join(", ")}.`,
        suggestions,
        intent,
        data: { topProducts: top },
      };
    }

    case "optimization": {
      const snapshot = await getBusinessSnapshot();
      const opt = snapshot.optimization;
      const pricing = opt?.pricingSuggestions.slice(0, 2) ?? [];
      const bundles = opt?.bundleSuggestions.slice(0, 1) ?? [];
      return {
        reply: `Optimization scan: ${pricing.length} pricing moves, ${bundles.length} bundle ideas, ${opt?.riskAlerts.length ?? 0} risk alerts.${pricing[0] ? ` Suggest ${pricing[0].direction} on ${pricing[0].productName} to ${formatMoney(pricing[0].suggestedPrice)}.` : ""}`,
        suggestions,
        intent,
        data: opt,
      };
    }

    case "forecast": {
      const snapshot = await getBusinessSnapshot();
      const ai = snapshot.ai;
      return {
        reply: `7-day revenue forecast: ${formatMoney(ai?.predictedRevenueNext7Days ?? 0)}. Top projected seller: ${ai?.predictedBestSellingProducts[0]?.name ?? "pending more data"}.`,
        suggestions,
        intent,
        data: ai,
      };
    }

    case "revenue":
    case "analytics": {
      const { analytics, orders } = await getRevenue();
      const overview = await getAnalyticsOverview();
      return {
        reply: `Revenue ${formatMoney(analytics.totalRevenue)} from ${orders.paidOrderCount} paid orders (${orders.pendingOrders} pending). Conversion ${analytics.conversionRate}% on ${analytics.productViews} views and ${analytics.cartAdds} cart adds.`,
        suggestions,
        intent,
        data: overview,
      };
    }

    default: {
      const { brain, report } = await getDecisionBrainSnapshot();
      const live = await getUsersOnline();
      const revenue = await getRevenue();

      return {
        reply: brain
          ? `COO snapshot — Revenue ${formatMoney(revenue.analytics.totalRevenue)}, ${live?.activeUsers ?? 0} live users. Today: ${brain.topActions.slice(0, 3).join(", ")}.${report?.growthOpportunities[0] ? ` Growth op: ${report.growthOpportunities[0]}` : ""}`
          : `Business snapshot — Revenue ${formatMoney(revenue.analytics.totalRevenue)}, ${live?.activeUsers ?? 0} live users. Ask for today's strategic decisions.`,
        suggestions,
        intent,
        data: { brain, report },
      };
    }
  }
}
