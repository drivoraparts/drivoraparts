import Price from "@/components/currency/Price";
import CurrencyNotice from "@/components/currency/CurrencyNotice";
import { OrderDiscountBadge } from "@/components/product/DiscountBadge";
import {
  BULK_ORDER_DISCOUNT_PERCENT,
  type CartDiscountBreakdown,
} from "@/lib/inventory/discounts";
import { useTranslation } from "@/hooks/useTranslation";

export default function OrderTotalsSummary({
  breakdown,
  className = "",
  compact = false,
}: {
  breakdown: CartDiscountBreakdown;
  className?: string;
  /** Tighter rows for the cart drawer, where vertical space belongs to the
   *  products rather than the totals. Checkout keeps the roomier default. */
  compact?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className={`${compact ? "space-y-1" : "space-y-2"} ${className}`}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-neutral-500">{t("subtotal")}</span>
        <span className="text-neutral-800">
          <Price usd={breakdown.grossSubtotal} />
        </span>
      </div>

      {breakdown.bulkDiscount > 0 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-emerald-700">
            Bulk discount ({BULK_ORDER_DISCOUNT_PERCENT}%)
          </span>
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

      {breakdown.couponDiscount > 0 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-emerald-700">{breakdown.couponLabel}</span>
          <span className="text-emerald-700">
            −<Price usd={breakdown.couponDiscount} />
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-neutral-500">{t("shipping")}</span>
        <span className="text-neutral-800">
          {breakdown.shipping === 0 ? t("free") : <Price usd={breakdown.shipping} />}
        </span>
      </div>

      {compact ? (
        <div className="flex items-baseline justify-between gap-3 border-t border-neutral-200 pt-2">
          <span className="text-xs text-neutral-500">{t("total")}</span>
          <span className="text-lg font-semibold tracking-tight text-neutral-900">
            <Price usd={breakdown.total} />
          </span>
        </div>
      ) : (
        <div className="border-t border-neutral-200 pt-3">
          <p className="text-xs text-neutral-500">{t("total")}</p>
          <p className="text-2xl font-semibold tracking-tight text-neutral-900">
            <Price usd={breakdown.total} />
          </p>
        </div>
      )}

      <CurrencyNotice
        className={compact ? "text-[11px] text-neutral-500" : "text-xs text-neutral-500"}
      />
    </div>
  );
}
