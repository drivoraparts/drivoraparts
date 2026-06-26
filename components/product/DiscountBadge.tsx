import {
  getOrderDiscountLabel,
  getProductDiscountLabel,
} from "@/lib/inventory/discounts";

export function ProductDiscountBadge({
  category,
  className = "",
}: {
  category?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300 ${className}`}
    >
      {getProductDiscountLabel(category)}
    </span>
  );
}

export function OrderDiscountBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200 ${className}`}
    >
      {getOrderDiscountLabel()}
    </span>
  );
}
