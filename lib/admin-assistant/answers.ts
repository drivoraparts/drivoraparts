import { extractEmail, extractOrderNumber, findMentionedProduct } from "./entities";
import {
  findOrderByNumber,
  getInventoryStatus,
  getProductActivity,
  getRecentOrders,
  getRevenue,
} from "./tools";
import type { AssistantResponse } from "./types";

/**
 * Handlers for questions that name something specific, or ask for a figure the
 * topic replies don't carry.
 *
 * Each returns null when the question isn't its business, so the engine can try
 * the next one and fall through to its topic replies. Nothing here estimates:
 * where a number isn't available the reply says so, because a plausible wrong
 * figure on a dashboard is worse than an admitted gap.
 */

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

/** Guards every ratio in this file — a 0% built from 0/0 reads as a real finding. */
function percent(part: number, whole: number): string | null {
  if (!whole) return null;
  return `${((part / whole) * 100).toFixed(1)}%`;
}

const ORDER_STATUS_WORDS = /\border\b|\bpurchase\b|\bbought\b/;

export async function answerOrderQuestion(
  message: string,
  suggestions: string[]
): Promise<AssistantResponse | null> {
  const orderNumber = extractOrderNumber(message);

  if (orderNumber) {
    const order = await findOrderByNumber(orderNumber);
    if (!order) {
      return {
        reply: `No order found with number ${orderNumber}. Order numbers are DRV- followed by 7 characters, and never contain the letters O or I or the digits 0 or 1.`,
        suggestions,
        intent: "orders",
      };
    }

    const items = order.items ?? [];
    const itemSummary = items
      .slice(0, 4)
      .map((item) => `${item.quantity}× ${item.name}`)
      .join(", ");

    return {
      reply: `${order.order_number}: ${formatMoney(Number(order.total))}, status ${order.status}, placed ${new Date(order.created_at).toLocaleDateString()}. Customer ${order.customer?.email ?? "unknown"}.${itemSummary ? ` Items: ${itemSummary}${items.length > 4 ? `, +${items.length - 4} more` : ""}.` : ""}`,
      suggestions,
      intent: "orders",
      data: { order },
    };
  }

  const email = extractEmail(message);
  if (email) {
    // No query-by-customer exists, so this scans the recent window and says so
    // rather than implying it searched the whole order history.
    const recent = await getRecentOrders(100);
    const theirs = recent.filter((order) => order.customer.toLowerCase() === email);

    if (!theirs.length) {
      return {
        reply: `No orders from ${email} in the 100 most recent orders. They may have ordered further back than that.`,
        suggestions,
        intent: "orders",
      };
    }

    const spent = theirs.reduce((sum, order) => sum + order.total, 0);
    return {
      reply: `${email} has ${theirs.length} order${theirs.length === 1 ? "" : "s"} in the recent window, ${formatMoney(spent)} total. Latest: ${formatMoney(theirs[0].total)} (${theirs[0].status}).`,
      suggestions,
      intent: "orders",
      data: { orders: theirs },
    };
  }

  return null;
}

export async function answerProductQuestion(
  message: string,
  suggestions: string[]
): Promise<AssistantResponse | null> {
  const match = findMentionedProduct(message);
  if (!match) return null;

  const { product } = match;
  const [activity, inventory] = await Promise.all([
    getProductActivity(product.id),
    getInventoryStatus(),
  ]);

  const alert = inventory.alerts.find((item) => item.productId === product.id);
  const priceLabel =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? `${formatMoney(product.price)} (down from ${formatMoney(product.compareAtPrice)})`
      : formatMoney(product.price);

  const stockLabel = alert
    ? `${alert.quantity} left — ${alert.severity === "out" ? "out of stock" : "low stock"}`
    : product.stock === false
      ? "marked out of stock"
      : "in stock";

  const viewToCart = percent(activity.cartAdds, activity.views);

  /*
   * Checkouts and orders are only stated when there are some. Events recorded
   * before order_completed carried its cart contents cannot be attributed to a
   * product at all, so printing "0 completed orders" would assert something
   * about a listing that may well have sold — an absence of data reported as a
   * fact about the business.
   */
  const checkoutPart = activity.checkouts ? `, ${activity.checkouts} checkouts` : "";
  const orderPart = activity.orders ? `, ${activity.orders} completed orders` : "";

  const engagement = activity.views
    ? `${activity.views} views, ${activity.cartAdds} cart adds${viewToCart ? ` (${viewToCart} of views)` : ""}${checkoutPart}${orderPart}.`
    : activity.windowSaturated
      ? "No activity in the recent event window — older activity may exist beyond it."
      : "No recorded views or cart adds yet.";

  return {
    reply: `${product.name} — ${priceLabel}, ${stockLabel}. ${engagement}`,
    suggestions,
    intent: "products",
    data: { product, activity, alert: alert ?? null },
  };
}

const AVERAGE_ORDER_PATTERN = /average order|order value|\baov\b|average sale|per order/;
const FUNNEL_PATTERN =
  /funnel|drop(ping|ped)? ?-?off|abandon|leaving|view to cart|cart to checkout|where.*(lose|losing)/;
const COUNT_PATTERN = /how many|how much|total number|count of/;

export async function answerMetricQuestion(
  message: string,
  suggestions: string[]
): Promise<AssistantResponse | null> {
  const text = message.toLowerCase();

  if (AVERAGE_ORDER_PATTERN.test(text)) {
    const { analytics, orders } = await getRevenue();
    if (!orders.paidOrderCount) {
      return {
        reply: "No paid orders yet, so there's no average order value to report.",
        suggestions,
        intent: "revenue",
      };
    }
    const average = analytics.totalRevenue / orders.paidOrderCount;
    return {
      reply: `Average order value is ${formatMoney(average)} — ${formatMoney(analytics.totalRevenue)} across ${orders.paidOrderCount} paid orders.`,
      suggestions,
      intent: "revenue",
      data: { average, orders },
    };
  }

  if (FUNNEL_PATTERN.test(text)) {
    const { analytics, orders } = await getRevenue();

    /*
     * A checkout can start without a matching add_to_cart in the same window —
     * a cart restored from storage carries no fresh event — so this step can
     * exceed 100%. Printing "171% of cart adds" reads as a broken stat, so the
     * ratio is dropped and the anomaly is stated instead.
     */
    const checkoutsExceedCarts = analytics.checkoutCount > analytics.cartAdds;
    const viewToCart = percent(analytics.cartAdds, analytics.productViews);
    const cartToCheckout = checkoutsExceedCarts
      ? null
      : percent(analytics.checkoutCount, analytics.cartAdds);
    const checkoutToPaid = percent(orders.paidOrderCount, analytics.checkoutCount);

    const steps = [
      `${analytics.productViews} product views`,
      `${analytics.cartAdds} cart adds${viewToCart ? ` (${viewToCart} of views)` : ""}`,
      `${analytics.checkoutCount} checkouts started${cartToCheckout ? ` (${cartToCheckout} of cart adds)` : ""}`,
      `${orders.paidOrderCount} paid${checkoutToPaid ? ` (${checkoutToPaid} of checkouts)` : ""}`,
    ];

    const anomaly = checkoutsExceedCarts
      ? " Note: more checkouts started than cart adds were recorded, so that step isn't a clean ratio — a restored cart starts checkout without a fresh add-to-cart event."
      : "";

    return {
      reply: `Funnel: ${steps.join(" → ")}. ${orders.abandonedCheckouts} checkouts were abandoned.${anomaly} Pending orders are usually abandoned carts rather than sales awaiting fulfilment.`,
      suggestions,
      intent: "analytics",
      data: { analytics, orders },
    };
  }

  // Inventory counts asked as a direct number, which the topic reply buries.
  if (COUNT_PATTERN.test(text) && /stock|sku|unit|inventory|product/.test(text)) {
    const { stats } = await getInventoryStatus();

    if (/out of stock/.test(text)) {
      return {
        reply: `${stats.outOfStock} SKUs are out of stock, out of ${stats.totalSkus} tracked.`,
        suggestions,
        intent: "inventory",
        data: stats,
      };
    }
    if (/low stock|running low|restock/.test(text)) {
      return {
        reply: `${stats.lowStock} SKUs are at or below their restock threshold, out of ${stats.totalSkus} tracked.`,
        suggestions,
        intent: "inventory",
        data: stats,
      };
    }
    if (/unit/.test(text)) {
      return {
        reply: `${stats.totalUnits} units in stock across ${stats.totalSkus} SKUs.`,
        suggestions,
        intent: "inventory",
        data: stats,
      };
    }
    return {
      reply: `${stats.totalSkus} SKUs tracked, holding ${stats.totalUnits} units. ${stats.lowStock} low, ${stats.outOfStock} out of stock.`,
      suggestions,
      intent: "inventory",
      data: stats,
    };
  }

  return null;
}

/**
 * What the assistant can actually answer, shown when a question matches nothing.
 *
 * The old default returned a business snapshot for anything unrecognised, which
 * read as an answer and hid the fact that the question hadn't been understood.
 */
export const CAPABILITY_SUMMARY =
  "I can answer questions about revenue and conversion, a specific product by name, an order by its DRV- number or the customer's email, inventory and restocking, payments, live traffic, and averages like order value.";

export { ORDER_STATUS_WORDS };
