import { listAnalyticsEvents } from "@/lib/db/analytics";
import { listOrders } from "@/lib/db/orders";
import { safeQuery } from "@/lib/db/safe-query";
import { collectProductSignals } from "./product-metrics";

export type CustomerBehaviorSegment = {
  segment: string;
  userCountEstimate: number;
  cartAbandonmentProbability: number;
  purchaseLikelihood: number;
  topPages: string[];
  insight: string;
};

export type CustomerBehaviorReport = {
  generatedAt: number;
  overallCartAbandonmentRate: number;
  averagePurchaseLikelihood: number;
  segments: CustomerBehaviorSegment[];
  source: "live" | "fallback";
};

export async function analyzeCustomerBehavior(): Promise<CustomerBehaviorReport> {
  const [events, orders, signals] = await Promise.all([
    safeQuery(() => listAnalyticsEvents(3500), [], "customer-behavior-events"),
    safeQuery(() => listOrders(300), [], "customer-behavior-orders"),
    collectProductSignals(),
  ]);

  if (!events.length) {
    return {
      generatedAt: Date.now(),
      overallCartAbandonmentRate: 0,
      averagePurchaseLikelihood: 0,
      segments: [
        {
          segment: "All visitors",
          userCountEstimate: 0,
          cartAbandonmentProbability: 0,
          purchaseLikelihood: 0,
          topPages: [],
          insight: "Collecting browsing data — behavior model warming up.",
        },
      ],
      source: "fallback",
    };
  }

  const views = events.filter((e) => e.name === "product_view").length;
  const carts = events.filter((e) => e.name === "add_to_cart").length;
  const checkouts = events.filter((e) => e.name === "checkout_start").length;
  const completions = events.filter((e) => e.name === "order_completed").length;

  const cartAbandonment =
    carts > 0 ? Math.round(((carts - completions) / carts) * 1000) / 10 : 0;
  const checkoutDropoff =
    checkouts > 0
      ? Math.round(((checkouts - completions) / checkouts) * 1000) / 10
      : 0;

  const pageViews = new Map<string, number>();
  for (const event of events) {
    if (event.name !== "product_view") continue;
    const page =
      typeof event.payload?.path === "string"
        ? event.payload.path
        : typeof event.payload?.category === "string"
          ? `/catalog/${event.payload.category}`
          : "/product";
    pageViews.set(page, (pageViews.get(page) ?? 0) + 1);
  }

  const topPages = [...pageViews.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([page]) => page);

  const uniqueEmails = new Set(
    orders.map((o) => o.customer?.email).filter(Boolean)
  );
  const repeatBuyers = orders.length - uniqueEmails.size;

  const highIntentProducts = signals.filter((s) => s.cartRate >= 8).length;
  const purchaseLikelihood = Math.min(
    95,
    Math.round(
      (completions / Math.max(views, 1)) * 100 * 4 +
        highIntentProducts * 2 -
        cartAbandonment * 0.2
    )
  );

  const segments: CustomerBehaviorSegment[] = [
    {
      segment: "Product browsers",
      userCountEstimate: Math.max(views - carts, 0),
      cartAbandonmentProbability: Math.min(95, Math.round(cartAbandonment * 0.6)),
      purchaseLikelihood: Math.max(5, Math.round(purchaseLikelihood * 0.35)),
      topPages,
      insight: "Needs stronger hooks on high-view product pages.",
    },
    {
      segment: "Cart abandoners",
      userCountEstimate: Math.max(carts - completions, 0),
      cartAbandonmentProbability: Math.min(99, cartAbandonment),
      purchaseLikelihood: Math.max(10, Math.round(purchaseLikelihood * 0.55)),
      topPages,
      insight: "Retarget with urgency offers and crypto checkout reassurance.",
    },
    {
      segment: "Checkout starters",
      userCountEstimate: Math.max(checkouts - completions, 0),
      cartAbandonmentProbability: checkoutDropoff,
      purchaseLikelihood: Math.max(20, Math.round(purchaseLikelihood * 0.85)),
      topPages: ["/checkout", ...topPages.slice(0, 2)],
      insight: "Payment friction or trust gap likely at checkout step.",
    },
    {
      segment: "Repeat buyers",
      userCountEstimate: Math.max(repeatBuyers, 0),
      cartAbandonmentProbability: Math.max(5, Math.round(cartAbandonment * 0.3)),
      purchaseLikelihood: Math.min(98, purchaseLikelihood + 25),
      topPages,
      insight: "Upsell bundles and premium engine upgrades.",
    },
  ];

  return {
    generatedAt: Date.now(),
    overallCartAbandonmentRate: cartAbandonment,
    averagePurchaseLikelihood: purchaseLikelihood,
    segments,
    source: "live",
  };
}
