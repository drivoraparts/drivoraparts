/** Semantic color coding shared by the orders list, order detail summary
 * row, and status badges -- so "paid/delivered" always reads positive and
 * "cancelled/refunded/failed" always reads negative, regardless of which
 * of the three status dimensions (payment/order/shipping) it came from. */
export type StatusTone = "positive" | "warning" | "info" | "negative" | "neutral";

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

// Matches GitHub's own Primer status colors (success/attention/danger/accent)
// so "in progress" reads as the exact same yellow as a spinning GitHub Actions
// check, and "resolved" reads as the exact same green as a passing one.
const TONE_CLASSES: Record<StatusTone, string> = {
  positive: "bg-[#dafbe1] text-[#1a7f37]",
  warning: "bg-[#fff8c5] text-[#9a6700]",
  info: "bg-[#ddf4ff] text-[#0969da]",
  negative: "bg-[#ffebe9] text-[#cf222e]",
  neutral: "bg-zinc-100 text-zinc-600",
};

export function statusBadgeClass(value: string): string {
  return TONE_CLASSES[TONE_MAP[value] ?? "neutral"];
}

export function getStatusTone(value: string): StatusTone {
  return TONE_MAP[value] ?? "neutral";
}
