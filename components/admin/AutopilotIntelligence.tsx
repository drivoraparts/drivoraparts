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
  source?: "live" | "fallback";
};

type LoadState = "loading" | "ready" | "error";

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
    <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-600">{empty}</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {items.map((item) => (
            <li key={`${item.type}-${item.productId}-${item.productName}`} className="rounded-lg border border-zinc-100 p-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium">{item.productName}</span>
                <span
                  className={
                    item.priority === "critical"
                      ? "text-red-600"
                      : item.priority === "high"
                        ? "text-amber-700"
                        : "text-zinc-600"
                  }
                >
                  {item.priority}
                </span>
              </div>
              <p className="mt-2 text-zinc-600">{item.reason}</p>
              <p className="mt-1 text-xs text-gray-500">{item.expectedImpact}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AutopilotIntelligence({
  hasPaidHistory = false,
}: {
  hasPaidHistory?: boolean;
}) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<DecisionsPayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/ai/decisions")
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setLoadState("error");
          return;
        }
        const payload = (await res.json()) as DecisionsPayload;
        setData(payload);
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!hasPaidHistory) {
    return (
      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Autopilot Intelligence</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Action recommendations need at least one confirmed paid order. Pending
          checkouts are tracked above — run payment reconciliation if a customer
          already paid on NOWPayments.
        </p>
      </section>
    );
  }

  if (loadState === "loading") {
    return (
      <section className="mt-8 rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
        <h2 className="text-xl font-bold">Autopilot Intelligence</h2>
        <p className="mt-2 text-sm text-zinc-600">Loading AI decisions…</p>
      </section>
    );
  }

  if (loadState === "error" || !data) {
    return (
      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Autopilot Intelligence</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Could not load AI decisions right now. Sidebar navigation and the storefront
          are unaffected.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-red-300"
        >
          Retry
        </button>
      </section>
    );
  }

  const usingFallback = data.source === "fallback";

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-xl font-bold">Autopilot Intelligence</h2>
        <p className="mt-2 text-sm text-zinc-600">{data.summary}</p>
        {usingFallback ? (
          <p className="mt-2 text-xs text-amber-700">
            Limited data — estimates only, not confirmed sales.
          </p>
        ) : (
          <p className="mt-2 text-xs text-zinc-500">
            Suggested actions — verify against Orders and Payments before acting.
          </p>
        )}
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
