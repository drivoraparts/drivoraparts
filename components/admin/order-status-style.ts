/** Semantic color coding shared by the orders list, order detail summary
 * row, and status badges -- so "paid/delivered" always reads positive and
 * "cancelled/refunded/failed" always reads negative, regardless of which
 * of the three status dimensions (payment/order/shipping) it came from. */
type StatusTone = "positive" | "warning" | "info" | "negative" | "neutral";

const TONE_MAP: Record<string, StatusTone> = {
  pending: "warning",
  processing: "info",
  paid: "positive",
  failed: "negative",
  expired: "negative",
  refunded: "negative",
  partially_refunded: "negative",
  confirmed: "positive",
  on_hold: "warning",
  ready_for_shipment: "info",
  shipped: "info",
  completed: "positive",
  cancelled: "negative",
  not_shipped: "neutral",
  preparing_shipment: "warning",
  in_transit: "info",
  customs_clearance: "info",
  arrived_at_destination: "info",
  out_for_delivery: "info",
  delivered: "positive",
  delivery_exception: "negative",
};

const TONE_CLASSES: Record<StatusTone, string> = {
  positive: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  info: "bg-blue-50 text-blue-700",
  negative: "bg-red-50 text-red-700",
  neutral: "bg-zinc-100 text-zinc-600",
};

export function statusBadgeClass(value: string): string {
  return TONE_CLASSES[TONE_MAP[value] ?? "neutral"];
}
