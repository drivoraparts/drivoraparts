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
        <span className="text-white/50">{t("subtotal")}</span>
        <span className="text-white/80">
          <Price usd={breakdown.grossSubtotal} />
        </span>
      </div>

      {breakdown.bulkDiscount > 0 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-emerald-300/90">Bulk discount (20%)</span>
          <span className="text-emerald-300">
            −<Price usd={breakdown.bulkDiscount} />
          </span>
        </div>
      )}

      {breakdown.orderDiscount > 0 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-amber-200/90">
            Order discount (5%)
            <OrderDiscountBadge />
          </span>
          <span className="text-amber-200">
            −<Price usd={breakdown.orderDiscount} />
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-white/50">{t("shipping")}</span>
        <span className="text-white/80">
          {breakdown.shipping === 0 ? t("free") : <Price usd={breakdown.shipping} />}
        </span>
      </div>

      <div className="border-t border-white/10 pt-3">
        <p className="text-xs text-white/50">{t("total")}</p>
        <p className="text-2xl font-semibold tracking-tight text-white">
          <Price usd={breakdown.total} />
        </p>
      </div>

      <CurrencyNotice className="text-xs text-white/45" />
    </div>
  );
}
