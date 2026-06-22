import { getCryptomusMerchantId, getCryptomusPaymentKey } from "@/lib/env";
import { classifyAssistantIntent, getIntentSuggestions } from "./intents";
import {
  getAnalyticsOverview,
  getBusinessSnapshot,
  getInventoryStatus,
  getLiveOperations,
  getPaymentRecords,
  getRecentOrders,
  getRevenue,
  getTopProducts,
  getUsersOnline,
} from "./tools";
import type { AssistantResponse } from "./types";

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

export async function generateAdminAssistantReply(
  message: string
): Promise<AssistantResponse> {
  const intent = classifyAssistantIntent(message);
  const suggestions = getIntentSuggestions(intent);

  if (!message.trim()) {
    return {
      reply:
        "I'm your business operator AI. Ask about revenue, live users, orders, inventory, suppliers, pricing optimization, or payments.",
      suggestions,
      intent,
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
      const cryptomusEnabled = Boolean(
        getCryptomusMerchantId() && getCryptomusPaymentKey()
      );
      return {
        reply: cryptomusEnabled
          ? `Cryptomus active. ${revenue.payments.paid} paid (${formatMoney(revenue.payments.paidAmount)}), ${revenue.payments.pending} pending. Crypto revenue: ${formatMoney(revenue.payments.cryptomusPaidAmount)}.`
          : "Cryptomus not configured. Manual fallback checkout is active.",
        suggestions,
        intent,
        data: { payments, cryptomusEnabled },
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
      const live = await getUsersOnline();
      const revenue = await getRevenue();
      return {
        reply: `Business snapshot — Revenue ${formatMoney(revenue.analytics.totalRevenue)}, ${live?.activeUsers ?? 0} live users, ${revenue.orders.pendingOrders} pending orders. Ask about stock, suppliers, ads, or optimization.`,
        suggestions,
        intent,
      };
    }
  }
}
