"use client";

import { useState } from "react";

const STATUSES = [
  "pending",
  "processing",
  "paid",
  "failed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export default function OrderStatusControl({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function updateStatus(nextStatus: string) {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: nextStatus }),
    });

    if (!res.ok) {
      setMessage("Update failed");
      setLoading(false);
      return;
    }

    setStatus(nextStatus);
    setMessage("Updated");
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <select
        value={status}
        disabled={loading}
        onChange={(e) => updateStatus(e.target.value)}
        className="rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm capitalize"
      >
        {STATUSES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      {message ? <span className="text-xs text-zinc-600">{message}</span> : null}
    </div>
  );
}
