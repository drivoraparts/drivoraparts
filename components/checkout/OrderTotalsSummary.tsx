import Price from "@/components/currency/Price";
import CurrencyNotice from "@/components/currency/CurrencyNotice";
import { OrderDiscountBadge } from "@/components/product/DiscountBadge";
import type { CartDiscountBreakdown } from "@/lib/inventory/discounts";
import { useTranslation } from "@/hooks/useTranslation";

export default function OrderTotalsSummary({
  breakdown,
  className = "",
}: {
  breakdown: CartDiscountBreakdown;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-neutral-500">{t("subtotal")}</span>
        <span className="text-neutral-800">
          <Price usd={breakdown.grossSubtotal} />
        </span>
      </div>

      {breakdown.bulkDiscount > 0 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-emerald-700">Bulk discount (20%)</span>
          <span className="text-emerald-700">
            −<Price usd={breakdown.bulkDiscount} />
          </span>
        </div>
      )}

      {breakdown.orderDiscount > 0 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-amber-700">
            Order discount (5%)
            <OrderDiscountBadge />
          </span>
          <span className="text-amber-700">
            −<Price usd={breakdown.orderDiscount} />
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-neutral-500">{t("shipping")}</span>
        <span className="text-neutral-800">
          {breakdown.shipping === 0 ? t("free") : <Price usd={breakdown.shipping} />}
        </span>
      </div>

      <div className="border-t border-neutral-200 pt-3">
        <p className="text-xs text-neutral-500">{t("total")}</p>
        <p className="text-2xl font-semibold tracking-tight text-neutral-900">
          <Price usd={breakdown.total} />
        </p>
      </div>

      <CurrencyNotice className="text-xs text-neutral-500" />
    </div>
  );
}
