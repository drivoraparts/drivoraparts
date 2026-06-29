"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function updateStatus(nextStatus: string) {
    if (nextStatus === status) return;

    setLoading(true);
    setMessage("");
    setError(false);

    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: nextStatus }),
    });

    const data = (await res.json().catch(() => null)) as { error?: string } | null;

    if (!res.ok) {
      setError(true);
      setMessage(data?.error ?? "Update failed");
      setLoading(false);
      return;
    }

    setStatus(nextStatus);
    setMessage("Updated");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <select
        value={status}
        disabled={loading}
        onChange={(e) => updateStatus(e.target.value)}
        className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm capitalize"
      >
        {STATUSES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      {message ? (
        <span className={`text-xs ${error ? "text-red-600" : "text-green-700"}`}>
          {message}
        </span>
      ) : null}
    </div>
  );
}
