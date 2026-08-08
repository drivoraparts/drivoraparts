"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type OrderStatusResult = {
  status: string;
  total: number;
  orderId: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending payment",
  processing: "Processing",
  paid: "Paid — preparing for shipment",
  shipped: "Shipped",
  delivered: "Delivered",
  failed: "Payment failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(() => searchParams.get("orderId") ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderStatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookupOrder = async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/public/order-status?orderId=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          res.status === 404
            ? "We couldn't find an order with that ID. Double-check it and try again."
            : "Order tracking is temporarily unavailable. Please try again shortly."
        );
        return;
      }

      setResult(data as OrderStatusResult);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Deep-linked from an order email (e.g. /track-order?orderId=...) --
  // look it up automatically instead of leaving the customer to retype it.
  useEffect(() => {
    const fromUrl = searchParams.get("orderId");
    if (fromUrl?.trim()) void lookupOrder(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void lookupOrder(orderId);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          required
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. 6d75bfb5-26c9-4328-87d8-874ee155cbae"
          aria-label="Order ID"
          className="w-full min-w-0 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-red-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
        >
          {loading ? "Checking..." : "Track Order"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Order {result.orderId.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 text-lg font-semibold text-neutral-900">
            {STATUS_LABELS[result.status] ?? result.status}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Total: ${result.total.toFixed(2)}
          </p>
        </div>
      )}

      <p className="mt-6 text-sm text-neutral-500">
        Order not showing up, or need more detail?{" "}
        <Link href="/contact" className="text-red-600 hover:text-red-700">
          Contact support
        </Link>{" "}
        with your order ID.
      </p>
    </div>
  );
}
