import {
  getOrderDiscountLabel,
  getProductDiscountLabel,
} from "@/lib/inventory/discounts";

export function ProductDiscountBadge({
  category,
  className = "",
  active = true,
}: {
  category?: string;
  className?: string;
  /** Pass false in cart/checkout contexts when the current cart doesn't
   *  actually qualify for the bulk discount yet — showing it as if active
   *  when it isn't misleads customers into thinking it's already applied.
   *  Defaults to true for catalog/product pages, which advertise the
   *  policy generally rather than a specific cart's live state. */
  active?: boolean;
}) {
  if (!active) return null;

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
