"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const gridStroke = "rgba(255,255,255,0.08)";
const axisStroke = "#6b7280";
const tooltipStyle = {
  backgroundColor: "rgba(10,10,10,0.95)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "#fff",
};

type RealtimePayload = {
  activeUsers: number;
  revenueLast60Min: number;
  conversionRate: number;
  checkoutDropoffRate: number;
  topTrendingProducts: Array<{ name: string; score: number; velocity: number }>;
};

type AiInsightsPayload = {
  predictedRevenueNext7Days: number;
  productRankingScores: Array<{ name: string; demandVelocity: number; rank: number }>;
};

type AnalyticsPayload = {
  checkoutCount: number;
  cartAdds: number;
  productViews: number;
  totalOrders: number;
};

function ChartPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6 shadow-sm ">
      <div className="mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-zinc-600">{subtitle}</p> : null}
      </div>
      <div className="h-72 w-full">{children}</div>
    </section>
  );
}

export default function AdvancedCharts() {
  const [realtime, setRealtime] = useState<RealtimePayload | null>(null);
  const [ai, setAi] = useState<AiInsightsPayload | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [liveHistory, setLiveHistory] = useState<
    Array<{ time: string; users: number; revenue: number }>
  >([]);

  const load = useCallback(async () => {
    try {
      const [realtimeRes, aiRes, analyticsRes] = await Promise.all([
        fetch("/api/realtime/dashboard"),
        fetch("/api/admin/insights/ai"),
        fetch("/api/analytics"),
      ]);

      if (realtimeRes.ok) {
        const data = (await realtimeRes.json()) as RealtimePayload;
        setRealtime(data);
        const label = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        setLiveHistory((prev) =>
          [...prev, { time: label, users: data.activeUsers, revenue: data.revenueLast60Min }].slice(
            -12
          )
        );
      }

      if (aiRes.ok) {
        setAi((await aiRes.json()) as AiInsightsPayload);
      }

      if (analyticsRes.ok) {
        setAnalytics((await analyticsRes.json()) as AnalyticsPayload);
      }
    } catch {
      // Graceful degradation — charts stay on last good data
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  const funnelData = analytics
    ? [
        { stage: "Views", count: analytics.productViews },
        { stage: "Cart", count: analytics.cartAdds },
        { stage: "Checkout", count: analytics.checkoutCount },
        { stage: "Orders", count: analytics.totalOrders },
      ]
    : [];

  const trendingData =
    realtime?.topTrendingProducts.slice(0, 6).map((p) => ({
      name: p.name.length > 22 ? `${p.name.slice(0, 22)}…` : p.name,
      velocity: p.velocity,
    })) ?? [];

  const rankingData =
    ai?.productRankingScores.slice(0, 6).map((p) => ({
      name: p.name.length > 22 ? `${p.name.slice(0, 22)}…` : p.name,
      score: p.demandVelocity,
    })) ?? [];

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-600">Live users</p>
          <p className="text-2xl font-bold">{realtime?.activeUsers ?? "—"}</p>
        </div>
        <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-600">Revenue (60m)</p>
          <p className="text-2xl font-bold">
            {realtime ? `$${realtime.revenueLast60Min.toFixed(2)}` : "—"}
          </p>
        </div>
        <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-600">Live conversion</p>
          <p className="text-2xl font-bold">
            {realtime ? `${realtime.conversionRate}%` : "—"}
          </p>
        </div>
        <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-600">7-day forecast</p>
          <p className="text-2xl font-bold">
            {ai ? `$${ai.predictedRevenueNext7Days.toLocaleString()}` : "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel title="Live Users Stream" subtitle="Real-time active users (polled every 20s)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={liveHistory}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 11 }} />
              <YAxis stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="users" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Conversion Funnel" subtitle="Views → cart → checkout → orders">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
              <XAxis dataKey="stage" stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 12 }} />
              <YAxis stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel title="Hot Products (Live)" subtitle="Trending in the last 60 minutes">
          {trendingData.length === 0 ? (
            <p className="text-sm text-zinc-600">Waiting for live product activity…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendingData} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
                <XAxis type="number" stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  stroke={axisStroke}
                  tick={{ fill: axisStroke, fontSize: 10 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="velocity" fill="#60a5fa" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        <ChartPanel title="Demand Velocity Rankings" subtitle="AI product ranking scores">
          {rankingData.length === 0 ? (
            <p className="text-sm text-zinc-600">Collecting demand signals…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankingData} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
                <XAxis type="number" stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  stroke={axisStroke}
                  tick={{ fill: axisStroke, fontSize: 10 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="score" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </div>
    </div>
  );
}
