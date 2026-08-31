/** Semantic color coding shared by the orders list, order detail summary
 * row, and status badges -- so "paid/delivered" always reads positive and
 * "cancelled/refunded/failed" always reads negative, regardless of which
 * of the three status dimensions (payment/order/shipping) it came from. */
export type StatusTone = "positive" | "warning" | "info" | "negative" | "neutral";

const TONE_MAP: Record<string, StatusTone> = {
  // Control Status
  active: "info",
  on_hold: "warning",
  cancelled: "negative",
  completed: "positive",
  // Payment Status
  pending: "warning",
  processing: "info",
  paid: "positive",
  failed: "negative",
  expired: "negative",
  refunded: "negative",
  partially_refunded: "negative",
  // Order Processing Status
  order_received: "warning",
  preparing_order: "info",
  verification: "info",
  ready_for_shipment: "info",
  processing_complete: "positive",
  // Shipping Status
  not_shipped: "neutral",
  preparing_shipment: "warning",
  shipped: "info",
  in_transit: "info",
  arrived_at_destination: "info",
  out_for_delivery: "info",
  delivered: "positive",
  delivery_exception: "negative",
};

// Status tints now come from the DrivoraParts palette rather than GitHub's
// Primer set, so admin badges read as the same brand as the storefront. Each
// pairs a *-subtle fill with its full-strength token for the text.
const TONE_CLASSES: Record<StatusTone, string> = {
  positive: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  info: "bg-info-subtle text-info",
  negative: "bg-error-subtle text-error",
  neutral: "bg-surface-muted text-muted",
};

export function statusBadgeClass(value: string): string {
  return TONE_CLASSES[TONE_MAP[value] ?? "neutral"];
}

export function getStatusTone(value: string): StatusTone {
  return TONE_MAP[value] ?? "neutral";
}
