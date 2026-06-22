"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardChartData } from "@/lib/analytics/chartTypes";

const gridStroke = "rgba(255,255,255,0.08)";
const axisStroke = "#6b7280";
const tooltipStyle = {
  backgroundColor: "rgba(10,10,10,0.95)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "#fff",
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
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-md">
      <div className="mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-gray-400">{subtitle}</p> : null}
      </div>
      <div className="h-72 w-full">{children}</div>
    </section>
  );
}

export default function DashboardCharts({ data }: { data: DashboardChartData }) {
  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Revenue Over Time"
          subtitle="Daily revenue from completed orders (last 14 days)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.revenueOverTime}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 12 }} />
              <YAxis
                stroke={axisStroke}
                tick={{ fill: axisStroke, fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: "#ef4444", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Orders Per Day"
          subtitle="Daily order volume trend"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.ordersPerDay}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 12 }} />
              <YAxis stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="orders" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Traffic Tracking"
          subtitle="Product page views per day"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trafficOverTime}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 12 }} />
              <YAxis stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={{ fill: "#60a5fa", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Conversion Rate"
          subtitle="Daily orders divided by product views (%)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.conversionOverTime}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 12 }} />
              <YAxis
                stroke={axisStroke}
                tick={{ fill: axisStroke, fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`${value}%`, "Conversion"]}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: "#22c55e", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <ChartPanel
        title="Top Product Performance"
        subtitle="Views and cart adds for highest-performing products"
      >
        {data.topProducts.length === 0 ? (
          <p className="text-sm text-gray-400">No product performance data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.topProducts}
              layout="vertical"
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
              <XAxis type="number" stroke={axisStroke} tick={{ fill: axisStroke, fontSize: 12 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                stroke={axisStroke}
                tick={{ fill: axisStroke, fontSize: 11 }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: "#9ca3af" }} />
              <Bar dataKey="views" name="Views" fill="#60a5fa" radius={[0, 4, 4, 0]} />
              <Bar dataKey="cartAdds" name="Cart Adds" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartPanel>
    </div>
  );
}
