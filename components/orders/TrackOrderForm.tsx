"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type TimelineEntry = {
  type: "payment_status" | "control_status" | "order_status" | "shipping_status" | "shipment_hold" | "note";
  value: string | null;
  createdAt: string;
};

type StepState = "completed" | "current" | "upcoming";
type StepGroup = "order" | "processing" | "shipping";

type Step = {
  key: string;
  label: string;
  group: StepGroup;
  state: StepState;
  timestamp: string | null;
};

const GROUP_LABELS: Record<StepGroup, string> = {
  order: "Order",
  processing: "Processing",
  shipping: "Shipping",
};

type Banner = { key: "cancelled" | "refunded"; label: string } | null;
type Notice = { key: "on_hold" | "delivery_exception"; label: string } | null;
type Hold = { reason: string; note: string | null; updatedAt: string | null } | null;

type OrderItem = {
  name: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  partNumber: string | null;
  fitment: string | null;
};

type Receiver = { name: string; address: string | null; phone: string | null } | null;

type Shipment = {
  weight: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  origin: string | null;
  destination: string | null;
  currentLocation: string | null;
  currentLocationUpdatedAt: string | null;
  estimatedDeliveryStart: string | null;
  estimatedDeliveryEnd: string | null;
  shipmentType: string | null;
};

type TrackOrderResult = {
  orderNumber: string;
  createdAt: string;
  total: number;
  headline: string;
  steps: Step[] | null;
  banner: Banner;
  notice: Notice;
  hold: Hold;
  customerMessage: string | null;
  items: OrderItem[];
  receiver: Receiver;
  shipment: Shipment;
  timeline: TimelineEntry[];
};

const HEADLINE_ICONS: Record<string, string> = {
  "Order Placed": "📦",
  "Payment Confirmed": "💳",
  Processing: "⚙️",
  "Preparing for Shipment": "📦",
  Shipped: "🚚",
  "In Transit": "🚛",
  "Customs Clearance": "🛃",
  "Arrived at Destination": "📍",
  "Out for Delivery": "🚗",
  Delivered: "🏠",
  Cancelled: "✕",
  Refunded: "↩️",
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  processing: "Order is being processed at our facility.",
  preparing_order: "Order contents are being prepared and packed.",
  verification: "Order is undergoing a final quality/accuracy check.",
  ready_for_shipment: "Order is packed and staged, waiting to be handed to the carrier.",
  preparing_shipment: "Order is being packed and prepared for carrier pickup.",
  in_transit: "Shipment is currently moving toward its destination.",
  customs_clearance: "Shipment is being processed by customs.",
  arrived_at_destination: "Shipment has arrived at the destination facility.",
  out_for_delivery: "Shipment is with the local delivery carrier.",
};

const EVENT_STEP_LABELS: Record<string, string> = {
  "order_status:processing": "Processing",
  "order_status:preparing_order": "Preparing order",
  "order_status:verification": "Order verification",
  "order_status:ready_for_shipment": "Ready for shipment",
  "order_status:processing_complete": "Processing complete",
  "control_status:on_hold": "Order on hold",
  "control_status:cancelled": "Order cancelled",
  "control_status:completed": "Order completed",
  "control_status:refunded": "Order refunded",
  "shipping_status:preparing_shipment": "Preparing for shipment",
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

// Same GitHub Primer colors as the admin status pills: yellow spins while
// something is actively moving/in-progress, green is a resolved success,
// red flags something that needs attention (never spinning -- a hold is
// paused, not in motion).
type Tone = "green" | "pending" | "red" | "neutral";

const TONE_STYLES: Record<Tone, { bg: string; text: string; border: string }> = {
  green: { bg: "bg-[#1a7f37]", text: "text-[#1a7f37]", border: "border-[#1a7f37]" },
  pending: { bg: "bg-[#9a6700]", text: "text-[#9a6700]", border: "border-[#9a6700]" },
  red: { bg: "bg-[#cf222e]", text: "text-[#cf222e]", border: "border-[#cf222e]" },
  neutral: { bg: "bg-neutral-300", text: "text-neutral-400", border: "border-neutral-300" },
};

function stepTone(step: Step, notice: Notice): Tone {
  if (step.state === "upcoming") return "neutral";
  if (notice && step.state === "current") return "red";
  if (step.key === "delivered") return "green";
  if (step.state === "completed") return "green";
  return "pending";
}

function SpinnerIcon({ className }: { className: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function StepMarker({ state, tone }: { state: StepState; tone: Tone }) {
  const styles = TONE_STYLES[tone];
  if (state === "completed") {
    return (
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${styles.bg} text-[10px] font-bold text-white`}
      >
        ✓
      </span>
    );
  }
  if (state === "current") {
    if (tone === "pending") {
      return (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#9a6700] bg-white">
          <SpinnerIcon className="h-3 w-3 text-[#9a6700]" />
        </span>
      );
    }
    return (
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white ${styles.border}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${styles.bg}`} />
      </span>
    );
  }
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-neutral-300 bg-white" />;
}

function StepConnector({ tone }: { tone: Tone }) {
  const styles = TONE_STYLES[tone];
  return (
    <div className="relative w-0.5 flex-1 self-stretch">
      <div className={`absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 ${styles.bg} opacity-40`} />
      <svg
        viewBox="0 0 12 12"
        className={`absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 ${styles.text}`}
        fill="currentColor"
      >
        <path d="M6 9 2 4h8z" />
      </svg>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{children}</p>;
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
            ? "We couldn't find an order matching that ID. Please check the ID and try again."
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

  // Used only for cancelled/refunded orders, which get the real history log
  // instead of a forward-looking stepper (there's no "next step" to show).
  const historyEvents = result
    ? [
        { label: "Order placed", createdAt: result.createdAt },
        ...result.timeline
          .filter((entry) => entry.type !== "note" && entry.type !== "shipment_hold" && entry.value)
          .map((entry) => ({
            label: EVENT_STEP_LABELS[`${entry.type}:${entry.value}`] ?? entry.value ?? "",
            createdAt: entry.createdAt,
          })),
      ]
    : [];

  const holdHistory = result
    ? result.timeline.filter((entry) => entry.type === "shipment_hold")
    : [];

  const hasShipmentDetails = result
    ? Boolean(
        result.shipment.carrier ||
          result.shipment.trackingNumber ||
          result.shipment.origin ||
          result.shipment.destination ||
          result.shipment.currentLocation ||
          result.shipment.estimatedDeliveryStart ||
          result.shipment.shipmentType ||
          result.shipment.weight
      )
    : false;

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <input
          type="text"
          required
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter your Order ID or Payment ID (e.g. DRV-7K2QX9F)"
          aria-label="Order ID or Payment ID"
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
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          {/* ORDER HEADER */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                Order {result.orderNumber} · Current Status
              </p>
              <p className="mt-0.5 text-base font-semibold text-neutral-900">
                {HEADLINE_ICONS[result.headline] ? `${HEADLINE_ICONS[result.headline]} ` : ""}
                {result.headline}
              </p>
            </div>
            <p className="whitespace-nowrap text-right text-xs text-neutral-500">
              ${result.total.toFixed(2)}
              <br />
              {formatDate(result.createdAt)}
            </p>
          </div>

          {result.notice && (
            <p className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-sm font-medium text-amber-800">
              <SpinnerIcon className="h-3.5 w-3.5 text-[#9a6700]" />
              {result.notice.label}
            </p>
          )}

          {/* CLEARANCE / HOLD -- only when a genuine hold is active, never
              buried in the timeline. */}
          {result.hold && (
            <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-3">
              <p className="text-sm font-bold text-amber-900">⚠ Shipment On Hold</p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">Reason</p>
              <p className="text-sm text-amber-900">{result.hold.reason}</p>
              {result.hold.note && (
                <>
                  <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                    Clearance Information
                  </p>
                  <p className="text-sm text-amber-900">{result.hold.note}</p>
                </>
              )}
              {result.hold.updatedAt && (
                <p className="mt-1.5 text-[11px] text-amber-700">Last updated {formatDate(result.hold.updatedAt)}</p>
              )}
            </div>
          )}

          {result.customerMessage && (
            <p className="mt-2.5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-neutral-800">
              {result.customerMessage}
            </p>
          )}

          {/* ORDER DETAILS */}
          {result.items.length > 0 && (
            <div className="mt-4 border-t border-neutral-200 pt-3">
              <SectionLabel>Order Details</SectionLabel>
              <ul className="mt-2 space-y-2.5">
                {result.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-md border border-neutral-200 object-cover"
                      />
                    ) : (
                      <div className="h-11 w-11 shrink-0 rounded-md border border-neutral-200 bg-white" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
                      <p className="text-xs text-neutral-500">
                        Qty {item.quantity} · ${item.unitPrice.toFixed(2)} each
                        {item.partNumber ? ` · Part #${item.partNumber}` : ""}
                      </p>
                      {item.fitment && <p className="mt-0.5 text-xs text-neutral-500">Fits: {item.fitment}</p>}
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-neutral-900">${item.lineTotal.toFixed(2)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* RECEIVER */}
          {result.receiver && (
            <div className="mt-4 border-t border-neutral-200 pt-3">
              <SectionLabel>Receiver</SectionLabel>
              <p className="mt-1.5 text-sm font-medium text-neutral-900">{result.receiver.name}</p>
              {result.receiver.address && (
                <p className="whitespace-pre-line text-sm text-neutral-700">{result.receiver.address}</p>
              )}
              {result.receiver.phone && <p className="text-sm text-neutral-700">{result.receiver.phone}</p>}
            </div>
          )}

          {/* SHIPMENT DETAILS */}
          {hasShipmentDetails ? (
            <div className="mt-4 border-t border-neutral-200 pt-3">
              <SectionLabel>Shipment Details</SectionLabel>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {result.shipment.weight && (
                  <div>
                    <p className="text-neutral-500">Weight</p>
                    <p className="mt-0.5 font-medium text-neutral-900">{result.shipment.weight}</p>
                  </div>
                )}
                {result.shipment.shipmentType && (
                  <div>
                    <p className="text-neutral-500">Shipment Type</p>
                    <p className="mt-0.5 font-medium text-neutral-900">{result.shipment.shipmentType}</p>
                  </div>
                )}
                {result.shipment.carrier && (
                  <div>
                    <p className="text-neutral-500">Carrier</p>
                    <p className="mt-0.5 font-medium text-neutral-900">{result.shipment.carrier}</p>
                  </div>
                )}
                {result.shipment.trackingNumber && (
                  <div>
                    <p className="text-neutral-500">Tracking Number</p>
                    <p className="mt-0.5 font-medium text-neutral-900">{result.shipment.trackingNumber}</p>
                  </div>
                )}
                {result.shipment.origin && (
                  <div>
                    <p className="text-neutral-500">Origin</p>
                    <p className="mt-0.5 font-medium text-neutral-900">{result.shipment.origin}</p>
                  </div>
                )}
                {result.shipment.destination && (
                  <div>
                    <p className="text-neutral-500">Destination</p>
                    <p className="mt-0.5 font-medium text-neutral-900">{result.shipment.destination}</p>
                  </div>
                )}
                {result.shipment.currentLocation && (
                  <div className="col-span-2">
                    <p className="text-neutral-500">Current Location</p>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {result.shipment.currentLocation}
                      {result.shipment.currentLocationUpdatedAt && (
                        <span className="ml-1.5 font-normal text-neutral-500">
                          · updated {formatDate(result.shipment.currentLocationUpdatedAt)}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {result.shipment.estimatedDeliveryStart && (
                  <div className="col-span-2">
                    <p className="text-neutral-500">Estimated Delivery</p>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatCalendarDate(result.shipment.estimatedDeliveryStart)}
                      {result.shipment.estimatedDeliveryEnd
                        ? ` – ${formatCalendarDate(result.shipment.estimatedDeliveryEnd)}`
                        : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            !result.banner && (
              <div className="mt-4 border-t border-neutral-200 pt-3">
                <SectionLabel>Shipment Details</SectionLabel>
                <p className="mt-1.5 text-xs text-neutral-500">
                  Shipment details will appear here once your order ships.
                </p>
              </div>
            )
          )}

          {/* TIMELINE -- grouped into Order / Processing / Shipping phases */}
          {result.steps ? (
            <div className="mt-4 border-t border-neutral-200 pt-3">
              <SectionLabel>Shipment Timeline</SectionLabel>
              {(["order", "processing", "shipping"] as StepGroup[]).map((group) => {
                const groupSteps = result.steps!.filter((s) => s.group === group);
                if (groupSteps.length === 0) return null;
                return (
                  <div key={group} className="mt-3 first:mt-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                      {GROUP_LABELS[group]}
                    </p>
                    <ol className="mt-1.5">
                      {groupSteps.map((step, index) => {
                        const tone = stepTone(step, result.notice);
                        const isLast = index === groupSteps.length - 1;
                        const connectorTone = !isLast ? stepTone(groupSteps[index + 1], result.notice) : null;
                        return (
                          <li key={step.key} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <StepMarker state={step.state} tone={tone} />
                              {!isLast && <StepConnector tone={connectorTone!} />}
                            </div>
                            <div className={isLast ? "pb-0.5" : "pb-4"}>
                              <p
                                className={`text-sm font-medium ${
                                  step.state === "upcoming" ? "text-neutral-400" : "text-neutral-900"
                                }`}
                              >
                                {step.label}
                              </p>
                              {step.timestamp && step.state !== "upcoming" && (
                                <p className="text-xs text-neutral-500">{formatDate(step.timestamp)}</p>
                              )}
                              {step.state === "current" && STEP_DESCRIPTIONS[step.key] && (
                                <p className="mt-0.5 text-xs text-neutral-500">{STEP_DESCRIPTIONS[step.key]}</p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}
            </div>
          ) : (
            historyEvents.length > 0 && (
              <div className="mt-4 border-t border-neutral-200 pt-3">
                <SectionLabel>Order History</SectionLabel>
                <ol className="mt-3 space-y-3 border-l border-neutral-300 pl-4">
                  {historyEvents.map((event, index) => (
                    <li key={`${event.label}-${index}`} className="relative">
                      <span className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-red-600" />
                      <p className="text-sm font-medium text-neutral-900">{event.label}</p>
                      <p className="text-xs text-neutral-500">{formatDate(event.createdAt)}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )
          )}

          {/* HOLD HISTORY -- preserved even after the shipment resumes. */}
          {holdHistory.length > 0 && (
            <div className="mt-4 border-t border-neutral-200 pt-3">
              <SectionLabel>Clearance History</SectionLabel>
              <ol className="mt-2 space-y-2">
                {holdHistory.map((entry, index) => (
                  <li key={index} className="text-xs">
                    <span className="text-neutral-500">{formatDate(entry.createdAt)} — </span>
                    <span className="text-neutral-800">
                      {entry.value === "Resumed" ? "Shipment resumed" : `Shipment placed on hold — ${entry.value}`}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <p className="mt-5 text-xs text-neutral-500">
        Order not showing up, or need more detail?{" "}
        <Link href="/contact" className="text-red-600 hover:text-red-700">
          Contact support
        </Link>{" "}
        with your order ID.
      </p>
    </div>
  );
}
