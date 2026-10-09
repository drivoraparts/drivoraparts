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
  shippingQuote,
}: {
  breakdown: CartDiscountBreakdown;
  /**
   * The shipping charge from /api/shipping/quote. When it is "calculated",
   * breakdown.shipping is that amount and 0 genuinely means free. Otherwise
   * `note` says why there is no figure yet (freight, outside the US).
   * Absent (the cart drawer): shipping shows as still to be calculated.
   */
  shippingQuote?: { calculated: boolean; note?: string };
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

      {/*
        Without a calculated quote, a zero here means "not priced yet", never
        "free": printing t("free") for a missing number would promise delivery
        at no charge on orders that have none. A calculated quote of 0 comes
        from the published US rate table and IS free.
      */}
      <div className="flex items-start justify-between gap-3 text-sm">
        <span className="text-neutral-500">{t("shipping")}</span>
        <span className="text-right text-neutral-800">
          {shippingQuote?.calculated ? (
            breakdown.shipping > 0 ? (
              <Price usd={breakdown.shipping} />
            ) : (
              t("free")
            )
          ) : (
            shippingQuote?.note || t("shippingTbc")
          )}
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
