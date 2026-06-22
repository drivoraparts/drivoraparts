import { buildEmptyDashboardCharts } from "@/lib/admin/fallbacks";
import { guardedSupabaseRead } from "@/lib/db/read-guard";
import { listAnalyticsEventsSince } from "@/lib/db/analytics";
import { listOrders } from "@/lib/db/orders";
import type { DashboardChartData } from "./chartTypes";

const RANGE_DAYS = 14;

function formatDayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDateKeys(days: number): string[] {
  const keys: string[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    keys.push(date.toISOString().slice(0, 10));
  }

  return keys;
}

function toDateKey(iso: string | number): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export async function getDashboardChartData(): Promise<DashboardChartData> {
  return guardedSupabaseRead(
    "getDashboardChartData",
    buildEmptyDashboardCharts(RANGE_DAYS),
    async () => {
      const since = new Date();
      since.setDate(since.getDate() - (RANGE_DAYS - 1));
      since.setHours(0, 0, 0, 0);

      const [events, orders] = await Promise.all([
        listAnalyticsEventsSince(since.toISOString()),
        listOrders(500),
      ]);

      const dateKeys = getDateKeys(RANGE_DAYS);
      const revenueByDay = new Map<string, number>();
      const ordersByDay = new Map<string, number>();
      const viewsByDay = new Map<string, number>();

      for (const key of dateKeys) {
        revenueByDay.set(key, 0);
        ordersByDay.set(key, 0);
        viewsByDay.set(key, 0);
      }

      for (const order of orders) {
        const key = toDateKey(order.created_at);
        if (!revenueByDay.has(key)) continue;
        if (order.status === "paid") {
          revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(order.total));
        }
        ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + 1);
      }

      for (const event of events) {
        if (event.name !== "product_view") continue;
        const key = toDateKey(event.created_at);
        if (!viewsByDay.has(key)) continue;
        viewsByDay.set(key, (viewsByDay.get(key) ?? 0) + 1);
      }

      const viewCounts = new Map<
        number,
        { name: string; views: number; cartAdds: number }
      >();

      for (const event of events) {
        if (event.name !== "product_view" && event.name !== "add_to_cart") continue;

        const productId = Number(event.payload?.productId);
        if (!Number.isFinite(productId)) continue;

        const productName =
          typeof event.payload?.productName === "string"
            ? event.payload.productName
            : `Product #${productId}`;

        const existing = viewCounts.get(productId) ?? {
          name: productName,
          views: 0,
          cartAdds: 0,
        };

        if (event.name === "product_view") existing.views += 1;
        if (event.name === "add_to_cart") existing.cartAdds += 1;

        viewCounts.set(productId, existing);
      }

      const topProducts = [...viewCounts.values()]
        .map((product) => ({
          name:
            product.name.length > 28
              ? `${product.name.slice(0, 28)}…`
              : product.name,
          views: product.views,
          cartAdds: product.cartAdds,
          score: product.views + product.cartAdds * 2,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      return {
        revenueOverTime: dateKeys.map((date) => ({
          date,
          label: formatDayLabel(date),
          revenue: Number((revenueByDay.get(date) ?? 0).toFixed(2)),
        })),
        ordersPerDay: dateKeys.map((date) => ({
          date,
          label: formatDayLabel(date),
          orders: ordersByDay.get(date) ?? 0,
        })),
        trafficOverTime: dateKeys.map((date) => ({
          date,
          label: formatDayLabel(date),
          views: viewsByDay.get(date) ?? 0,
        })),
        conversionOverTime: dateKeys.map((date) => {
          const views = viewsByDay.get(date) ?? 0;
          const dayOrders = ordersByDay.get(date) ?? 0;
          const rate = views > 0 ? Number(((dayOrders / views) * 100).toFixed(2)) : 0;

          return {
            date,
            label: formatDayLabel(date),
            rate,
          };
        }),
        topProducts,
      };
    }
  );
}
