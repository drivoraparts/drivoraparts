import {
  SHIPPING_HOLD_REASON_LABELS,
  type ControlStatus,
  type OrderEventRecord,
  type OrderLifecycleStatus,
  type OrderWithDetails,
  type ShippingStatus,
} from "@/lib/db/orders";
import type { PaymentStatus } from "@/lib/db/payments";

export type CustomerStepState = "completed" | "current" | "upcoming";

export type CustomerStepGroup = "order" | "processing" | "shipping";

export type CustomerStep = {
  key: string;
  label: string;
  group: CustomerStepGroup;
  state: CustomerStepState;
  /** Only set for completed/current steps -- sourced from a real, customer-
   * visible order_events row (or the order's own created_at). Never
   * fabricated for upcoming steps. */
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

const PROCESSING_OR_LATER: OrderLifecycleStatus[] = [
  "processing",
  "preparing_order",
  "verification",
  "ready_for_shipment",
  "processing_complete",
];

const PREPARING_ORDER_OR_LATER: OrderLifecycleStatus[] = [
  "preparing_order",
  "verification",
  "ready_for_shipment",
  "processing_complete",
];

const VERIFICATION_OR_LATER: OrderLifecycleStatus[] = [
  "verification",
  "ready_for_shipment",
  "processing_complete",
];

const READY_FOR_SHIPMENT_OR_LATER: OrderLifecycleStatus[] = ["ready_for_shipment", "processing_complete"];

const PAYMENT_CONFIRMED_STATUSES: PaymentStatus[] = ["paid", "refunded", "partially_refunded"];

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

const ARRIVED_OR_LATER: ShippingStatus[] = ["arrived_at_destination", "out_for_delivery", "delivered"];

const OUT_FOR_DELIVERY_OR_LATER: ShippingStatus[] = ["out_for_delivery", "delivered"];

const PREPARING_SHIPMENT_OR_LATER_SHIPPING: ShippingStatus[] = ["preparing_shipment", ...SHIPPED_OR_LATER];

function findEventTime(
  events: OrderEventRecord[],
  eventType: OrderEventRecord["event_type"],
  toValue: string
): string | null {
  return events.find((e) => e.event_type === eventType && e.to_value === toValue)?.created_at ?? null;
}

/**
 * Builds the customer-facing "Current Status" headline + three-part
 * stepper (Order / Processing / Shipping) from the order's admin-controlled
 * status fields, the real payment status, and real event history. Never
 * invents a timestamp for a step that hasn't happened; upcoming steps carry
 * no date. "Payment Confirmed" is derived from the real payments table, not
 * an admin-editable field -- it can't be set by clicking through a list.
 * Order Processing and Shipping are independent lifecycles: shipping steps
 * are only marked done from shipping_status itself, regardless of whether
 * processing has been marked complete, so real shipping data is never
 * hidden -- but the admin UI is the layer that discourages starting
 * shipping before processing is done.
 */
export function buildCustomerTrackingView(
  order: OrderWithDetails,
  events: OrderEventRecord[],
  paymentStatus: PaymentStatus | null
): CustomerTrackingView {
  const visibleEvents = events.filter((e) => e.customer_visible);
  const controlStatus = order.control_status;
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

  if (controlStatus === "cancelled") {
    return {
      headline: "Cancelled",
      steps: null,
      banner: { key: "cancelled", label: "Cancelled" },
      notice: null,
      hold,
    };
  }
  if (controlStatus === "refunded" || paymentStatus === "refunded") {
    return {
      headline: "Refunded",
      steps: null,
      banner: { key: "refunded", label: "Refunded" },
      notice: null,
      hold,
    };
  }

  const notice: CustomerNotice | null =
    controlStatus === "on_hold"
      ? { key: "on_hold", label: "On Hold" }
      : shippingStatus === "delivery_exception"
        ? { key: "delivery_exception", label: "Delivery Exception" }
        : null;

  const hasCustomsEvent = findEventTime(visibleEvents, "shipping_status", "customs_clearance") !== null;
  // Only show a Customs Clearance step when customs actually happened (or is
  // happening) -- reaching a later status like Arrived at Destination
  // doesn't imply the shipment passed through customs (e.g. domestic orders
  // skip it entirely).
  const includeCustoms = shippingStatus === "customs_clearance" || hasCustomsEvent;

  const stepDefs: {
    key: string;
    label: string;
    group: CustomerStepGroup;
    done: boolean;
    timestamp: string | null;
  }[] = [
    {
      key: "order_placed",
      label: "Order Placed",
      group: "order",
      done: true,
      timestamp: order.created_at,
    },
    {
      key: "payment_confirmed",
      label: "Payment Confirmed",
      group: "order",
      done: paymentStatus != null && PAYMENT_CONFIRMED_STATUSES.includes(paymentStatus),
      timestamp: findEventTime(visibleEvents, "payment_status", "paid"),
    },
    {
      key: "processing",
      label: "Processing",
      group: "processing",
      done: PROCESSING_OR_LATER.includes(orderStatus),
      timestamp: findEventTime(visibleEvents, "order_status", "processing"),
    },
    {
      key: "preparing_order",
      label: "Preparing Order",
      group: "processing",
      done: PREPARING_ORDER_OR_LATER.includes(orderStatus),
      timestamp: findEventTime(visibleEvents, "order_status", "preparing_order"),
    },
    {
      key: "verification",
      label: "Order Verification",
      group: "processing",
      done: VERIFICATION_OR_LATER.includes(orderStatus),
      timestamp: findEventTime(visibleEvents, "order_status", "verification"),
    },
    {
      key: "ready_for_shipment",
      label: "Ready for Shipment",
      group: "processing",
      done: READY_FOR_SHIPMENT_OR_LATER.includes(orderStatus),
      timestamp: findEventTime(visibleEvents, "order_status", "ready_for_shipment"),
    },
    {
      key: "processing_complete",
      label: "Processing Complete",
      group: "processing",
      done: orderStatus === "processing_complete",
      timestamp: findEventTime(visibleEvents, "order_status", "processing_complete"),
    },
    {
      key: "preparing_shipment",
      label: "Preparing for Shipment",
      group: "shipping",
      done: PREPARING_SHIPMENT_OR_LATER_SHIPPING.includes(shippingStatus),
      timestamp: findEventTime(visibleEvents, "shipping_status", "preparing_shipment"),
    },
    {
      key: "shipped",
      label: "Shipped",
      group: "shipping",
      done: SHIPPED_OR_LATER.includes(shippingStatus),
      timestamp: findEventTime(visibleEvents, "shipping_status", "shipped"),
    },
    {
      key: "in_transit",
      label: "In Transit",
      group: "shipping",
      done: IN_TRANSIT_OR_LATER.includes(shippingStatus),
      timestamp: findEventTime(visibleEvents, "shipping_status", "in_transit"),
    },
    ...(includeCustoms
      ? [
          {
            key: "customs_clearance",
            label: "Customs Clearance",
            group: "shipping" as CustomerStepGroup,
            done: CUSTOMS_OR_LATER.includes(shippingStatus) || hasCustomsEvent,
            timestamp: findEventTime(visibleEvents, "shipping_status", "customs_clearance"),
          },
        ]
      : []),
    {
      key: "arrived_at_destination",
      label: "Arrived at Destination",
      group: "shipping",
      done: ARRIVED_OR_LATER.includes(shippingStatus),
      timestamp: findEventTime(visibleEvents, "shipping_status", "arrived_at_destination"),
    },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      group: "shipping",
      done: OUT_FOR_DELIVERY_OR_LATER.includes(shippingStatus),
      timestamp: findEventTime(visibleEvents, "shipping_status", "out_for_delivery"),
    },
    {
      key: "delivered",
      label: "Delivered",
      group: "shipping",
      done: shippingStatus === "delivered",
      timestamp: findEventTime(visibleEvents, "shipping_status", "delivered"),
    },
  ];

  let frontierIndex = -1;
  stepDefs.forEach((s, i) => {
    if (s.done) frontierIndex = i;
  });

  // A delivery exception is its own distinct condition, not a fallback to
  // whatever step was last reached -- the frontier step is real progress
  // that already happened, but it's not what's "current" anymore. Mark it
  // completed instead of current so the stepper doesn't imply that step is
  // still in progress, and let the headline say "Delivery Exception"
  // directly rather than the stale milestone underneath it.
  const isDeliveryException = notice?.key === "delivery_exception";

  const steps: CustomerStep[] = stepDefs.map((s, i) => ({
    key: s.key,
    label: s.label,
    group: s.group,
    timestamp: s.timestamp,
    state: !s.done ? "upcoming" : i === frontierIndex && !isDeliveryException ? "current" : "completed",
  }));

  const headline = isDeliveryException
    ? "Delivery Exception"
    : frontierIndex >= 0
      ? steps[frontierIndex].label
      : "Order Placed";

  return { headline, steps, banner: null, notice, hold };
}

export type { ControlStatus };
