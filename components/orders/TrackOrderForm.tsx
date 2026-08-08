"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type TimelineEntry = {
  type: "payment_status" | "order_status" | "shipping_status" | "note";
  value: string | null;
  createdAt: string;
};

type TrackOrderResult = {
  orderNumber: string;
  createdAt: string;
  total: number;
  orderStatus: string;
  shippingStatus: string;
  carrier: string | null;
  trackingNumber: string | null;
  estimatedDeliveryStart: string | null;
  estimatedDeliveryEnd: string | null;
  items: { name: string; quantity: number; image: string | null }[];
  timeline: TimelineEntry[];
};

const EVENT_STEP_LABELS: Record<string, string> = {
  "order_status:confirmed": "Payment confirmed",
  "order_status:processing": "Processing",
  "order_status:on_hold": "On hold",
  "order_status:ready_for_shipment": "Ready for shipment",
  "order_status:shipped": "Shipped",
  "order_status:completed": "Completed",
  "order_status:cancelled": "Order cancelled",
  "order_status:refunded": "Order refunded",
  "shipping_status:preparing_shipment": "Preparing shipment",
  "shipping_status:shipped": "Shipped",
  "shipping_status:in_transit": "In transit",
  "shipping_status:customs_clearance": "Customs clearance",
  "shipping_status:arrived_at_destination": "Arrived at destination",
  "shipping_status:out_for_delivery": "Out for delivery",
  "shipping_status:delivered": "Delivered",
  "shipping_status:delivery_exception": "Delivery exception",
  "payment_status:paid": "Payment received",
  "payment_status:refunded": "Payment refunded",
  "payment_status:partially_refunded": "Payment partially refunded",
  "payment_status:failed": "Payment failed",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  on_hold: "On hold",
  ready_for_shipment: "Ready for shipment",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const SHIPPING_STATUS_LABELS: Record<string, string> = {
  not_shipped: "Not shipped yet",
  preparing_shipment: "Preparing shipment",
  shipped: "Shipped",
  in_transit: "In transit",
  customs_clearance: "Customs clearance",
  arrived_at_destination: "Arrived at destination",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  delivery_exception: "Delivery exception",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Date-only strings (e.g. "2026-08-15" ETA fields) have no time component --
 * parsing them with `new Date()` treats them as UTC midnight and can roll
 * back a day once converted to the viewer's local timezone. Format the
 * calendar date directly instead. */
function formatCalendarDate(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(() => searchParams.get("orderId") ?? "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackOrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookupOrder = async (id: string, customerEmail?: string) => {
    const trimmed = id.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams({ orderId: trimmed });
      if (customerEmail?.trim()) params.set("email", customerEmail.trim());

      const res = await fetch(`/api/public/track-order?${params.toString()}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          res.status === 404
            ? "We couldn't find an order with that ID. Double-check it and try again."
            : "Order tracking is temporarily unavailable. Please try again shortly."
        );
        return;
      }

      setResult(data as TrackOrderResult);
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
    void lookupOrder(orderId, email);
  };

  const steps = result
    ? [
        { label: "Order placed", createdAt: result.createdAt },
        ...result.timeline
          .filter((entry) => entry.type !== "note" && entry.value)
          .map((entry) => ({
            label: EVENT_STEP_LABELS[`${entry.type}:${entry.value}`] ?? entry.value ?? "",
            createdAt: entry.createdAt,
          })),
      ]
    : [];

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          required
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. DRV-7K2QX9F"
          aria-label="Order number"
          className="w-full min-w-0 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-red-500"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email used at checkout (optional)"
          aria-label="Email"
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
        <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Order {result.orderNumber}
              </p>
              <p className="mt-1 text-lg font-semibold text-neutral-900">
                {ORDER_STATUS_LABELS[result.orderStatus] ?? result.orderStatus}
              </p>
            </div>
            <p className="text-right text-sm text-neutral-600">
              ${result.total.toFixed(2)}
              <br />
              {formatDate(result.createdAt)}
            </p>
          </div>

          {result.shippingStatus !== "not_shipped" && (
            <p className="mt-2 text-sm text-neutral-700">
              Shipping: {SHIPPING_STATUS_LABELS[result.shippingStatus] ?? result.shippingStatus}
            </p>
          )}

          {(result.carrier || result.trackingNumber || result.estimatedDeliveryStart) && (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">
              {result.carrier && <p>Carrier: {result.carrier}</p>}
              {result.trackingNumber && <p>Tracking #: {result.trackingNumber}</p>}
              {result.estimatedDeliveryStart && (
                <p>
                  Estimated delivery: {formatCalendarDate(result.estimatedDeliveryStart)}
                  {result.estimatedDeliveryEnd ? ` – ${formatCalendarDate(result.estimatedDeliveryEnd)}` : ""}
                </p>
              )}
            </div>
          )}

          {steps.length > 0 && (
            <ol className="mt-5 space-y-4 border-l border-neutral-300 pl-4">
              {steps.map((step, index) => (
                <li key={`${step.label}-${index}`} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-red-600" />
                  <p className="text-sm font-medium text-neutral-900">{step.label}</p>
                  <p className="text-xs text-neutral-500">{formatDate(step.createdAt)}</p>
                </li>
              ))}
            </ol>
          )}

          {result.items.length > 0 && (
            <ul className="mt-5 space-y-1 border-t border-neutral-200 pt-4 text-sm text-neutral-700">
              {result.items.map((item, index) => (
                <li key={index}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-neutral-500">
        Order not showing up, or need more detail?{" "}
        <Link href="/contact" className="text-red-600 hover:text-red-700">
          Contact support
        </Link>{" "}
        with your order number.
      </p>
    </div>
  );
}
