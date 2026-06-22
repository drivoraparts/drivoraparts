"use client";

import { useEffect, useState } from "react";

type DecisionAction = {
  type: string;
  productId: number;
  productName: string;
  priority: string;
  reason: string;
  expectedImpact: string;
};

type DecisionsPayload = {
  summary: string;
  makingMoneyToday: DecisionAction[];
  willTrendTomorrow: DecisionAction[];
  fixNow: DecisionAction[];
};

function ActionList({
  title,
  items,
  empty,
}: {
  title: string;
  items: DecisionAction[];
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">{empty}</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {items.map((item) => (
            <li key={`${item.type}-${item.productId}-${item.productName}`} className="rounded-lg border border-white/5 p-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium">{item.productName}</span>
                <span
                  className={
                    item.priority === "critical"
                      ? "text-red-400"
                      : item.priority === "high"
                        ? "text-yellow-300"
                        : "text-gray-400"
                  }
                >
                  {item.priority}
                </span>
              </div>
              <p className="mt-2 text-gray-300">{item.reason}</p>
              <p className="mt-1 text-xs text-gray-500">{item.expectedImpact}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AutopilotIntelligence() {
  const [data, setData] = useState<DecisionsPayload | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai/decisions")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => setData(payload))
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <h2 className="text-xl font-bold">Autopilot Intelligence</h2>
        <p className="mt-2 text-sm text-gray-400">Loading AI decisions…</p>
      </section>
    );
  }

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-xl font-bold">Autopilot Intelligence</h2>
        <p className="mt-2 text-sm text-gray-300">{data.summary}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ActionList
          title="What is making money today"
          items={data.makingMoneyToday}
          empty="No winning products detected yet."
        />
        <ActionList
          title="What will trend tomorrow"
          items={data.willTrendTomorrow}
          empty="Trend signals still building."
        />
        <ActionList
          title="What to fix now"
          items={data.fixNow}
          empty="No critical fixes flagged."
        />
      </div>
    </section>
  );
}
