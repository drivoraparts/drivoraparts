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
      className={`inline-flex items-center rounded-md border border-emerald-700 bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${className}`}
    >
      {getProductDiscountLabel(category)}
    </span>
  );
}

export function OrderDiscountBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-amber-600 bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${className}`}
    >
      {getOrderDiscountLabel()}
    </span>
  );
}
