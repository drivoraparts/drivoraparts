import {
  SHIPPING_HOLD_REASON_LABELS,
  type OrderEventRecord,
  type OrderLifecycleStatus,
  type OrderWithDetails,
  type ShippingStatus,
} from "@/lib/db/orders";

export type CustomerStepState = "completed" | "current" | "upcoming";

export type CustomerStep = {
  key: string;
  label: string;
  state: CustomerStepState;
  /** Only set for completed/current steps -- sourced from a real, customer-
   * visible order_events row. Never fabricated for upcoming steps. */
  timestamp: string | null;
};

export type CustomerNotice = {
  key: "on_hold" | "delivery_exception";
  label: string;
};

export type CustomerBanner = {
  key: "cancelled" | "refunded";
  label: string;
};

export type CustomerHold = {
  reason: string;
  note: string | null;
  updatedAt: string | null;
};

export type CustomerTrackingView = {
  headline: string;
  /** null when `banner` is set -- a terminated order doesn't get a forward
   * looking stepper. */
  steps: CustomerStep[] | null;
  banner: CustomerBanner | null;
  notice: CustomerNotice | null;
  /** A genuine, active shipment hold (customs, documentation, etc.) -- shown
   * as its own prominent section, never buried in the timeline. */
  hold: CustomerHold | null;
};

const SHIPPED_OR_LATER: ShippingStatus[] = [
  "shipped",
  "in_transit",
  "customs_clearance",
  "arrived_at_destination",
  "out_for_delivery",
  "delivered",
];

const IN_TRANSIT_OR_LATER: ShippingStatus[] = [
  "in_transit",
  "customs_clearance",
  "arrived_at_destination",
  "out_for_delivery",
  "delivered",
];

const CUSTOMS_OR_LATER: ShippingStatus[] = [
  "customs_clearance",
  "arrived_at_destination",
  "out_for_delivery",
  "delivered",
];

const OUT_FOR_DELIVERY_OR_LATER: ShippingStatus[] = ["out_for_delivery", "delivered"];

const PROCESSING_OR_LATER: OrderLifecycleStatus[] = [
  "processing",
  "on_hold",
  "ready_for_shipment",
  "shipped",
  "completed",
];

const PREPARING_SHIPMENT_OR_LATER_ORDER: OrderLifecycleStatus[] = [
  "ready_for_shipment",
  "shipped",
  "completed",
];

const PREPARING_SHIPMENT_OR_LATER_SHIPPING: ShippingStatus[] = [
  "preparing_shipment",
  ...SHIPPED_OR_LATER,
];

function findEventTime(
  events: OrderEventRecord[],
  eventType: OrderEventRecord["event_type"],
  toValue: string
): string | null {
  return events.find((e) => e.event_type === eventType && e.to_value === toValue)?.created_at ?? null;
}

/**
 * Builds the customer-facing "Current Status" headline + stepper from the
 * order's own admin-controlled status fields and its real event history.
 * Never invents a timestamp for a step that hasn't happened; upcoming steps
 * carry no date. Steps are only marked done from their OWN status dimension
 * (shipping progress never implies payment was confirmed, and vice versa) --
 * an admin can legitimately mark a shipment "In Transit" while payment is
 * still pending, and this must not be shown as "Payment Confirmed".
 */
export function buildCustomerTrackingView(
  order: OrderWithDetails,
  events: OrderEventRecord[]
): CustomerTrackingView {
  const visibleEvents = events.filter((e) => e.customer_visible);
  const orderStatus = order.order_status;
  const shippingStatus = order.shipping_status;

  const hold: CustomerHold | null = order.shipping_hold_active
    ? {
        reason: order.shipping_hold_reason
          ? SHIPPING_HOLD_REASON_LABELS[order.shipping_hold_reason]
          : "Shipment On Hold",
        note: order.shipping_hold_note,
        updatedAt: order.shipping_hold_updated_at,
      }
    : null;

  if (orderStatus === "cancelled") {
    return {
      headline: "Cancelled",
      steps: null,
      banner: { key: "cancelled", label: "Cancelled" },
      notice: null,
      hold,
    };
  }
  if (orderStatus === "refunded") {
    return {
      headline: "Refunded",
      steps: null,
      banner: { key: "refunded", label: "Refunded" },
      notice: null,
      hold,
    };
  }

  const notice: CustomerNotice | null =
    orderStatus === "on_hold"
      ? { key: "on_hold", label: "On Hold" }
      : shippingStatus === "delivery_exception"
        ? { key: "delivery_exception", label: "Delivery Exception" }
        : null;

  const hasCustomsEvent = findEventTime(visibleEvents, "shipping_status", "customs_clearance") !== null;
  const includeCustoms = CUSTOMS_OR_LATER.includes(shippingStatus) || hasCustomsEvent;

  const stepDefs: { key: string; label: string; done: boolean; timestamp: string | null }[] = [
    {
      key: "order_placed",
      label: "Order Placed",
      done: true,
      timestamp: order.created_at,
    },
    {
      key: "payment_confirmed",
      label: "Payment Confirmed",
      done: orderStatus !== "pending",
      timestamp: findEventTime(visibleEvents, "order_status", "confirmed"),
    },
    {
      key: "processing",
      label: "Processing",
      done: PROCESSING_OR_LATER.includes(orderStatus),
      timestamp: findEventTime(visibleEvents, "order_status", "processing"),
    },
    {
      key: "preparing_shipment",
      label: "Preparing for Shipment",
      done:
        PREPARING_SHIPMENT_OR_LATER_ORDER.includes(orderStatus) ||
        PREPARING_SHIPMENT_OR_LATER_SHIPPING.includes(shippingStatus),
      timestamp:
        findEventTime(visibleEvents, "shipping_status", "preparing_shipment") ??
        findEventTime(visibleEvents, "order_status", "ready_for_shipment"),
    },
    {
      key: "shipped",
      label: "Shipped",
      done: SHIPPED_OR_LATER.includes(shippingStatus),
      timestamp: findEventTime(visibleEvents, "shipping_status", "shipped"),
    },
    {
      key: "in_transit",
      label: "In Transit",
      done: IN_TRANSIT_OR_LATER.includes(shippingStatus),
      timestamp: findEventTime(visibleEvents, "shipping_status", "in_transit"),
    },
    ...(includeCustoms
      ? [
          {
            key: "customs_clearance",
            label: "Customs Clearance",
            done: CUSTOMS_OR_LATER.includes(shippingStatus) || hasCustomsEvent,
            timestamp: findEventTime(visibleEvents, "shipping_status", "customs_clearance"),
          },
        ]
      : []),
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      done: OUT_FOR_DELIVERY_OR_LATER.includes(shippingStatus),
      timestamp: findEventTime(visibleEvents, "shipping_status", "out_for_delivery"),
    },
    {
      key: "delivered",
      label: "Delivered",
      done: shippingStatus === "delivered",
      timestamp: findEventTime(visibleEvents, "shipping_status", "delivered"),
    },
  ];

  let frontierIndex = -1;
  stepDefs.forEach((s, i) => {
    if (s.done) frontierIndex = i;
  });

  const steps: CustomerStep[] = stepDefs.map((s, i) => ({
    key: s.key,
    label: s.label,
    timestamp: s.timestamp,
    state: !s.done ? "upcoming" : i === frontierIndex ? "current" : "completed",
  }));

  const headline = frontierIndex >= 0 ? steps[frontierIndex].label : "Order Placed";

  return { headline, steps, banner: null, notice, hold };
}
