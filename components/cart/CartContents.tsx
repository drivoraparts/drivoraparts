"use client";

import Link from "next/link";
import ProductImage from "@/components/media/ProductImage";
import Price from "@/components/currency/Price";
import OrderTotalsSummary from "@/components/checkout/OrderTotalsSummary";
import { ProductDiscountBadge } from "@/components/product/DiscountBadge";
import { useCart } from "@/context/CartContext";
import {
  calculateCartDiscounts,
  cartQualifiesForBulkDiscount,
} from "@/lib/inventory/discounts";
import { routes } from "@/lib/inventory/routes";
import { showToast } from "@/lib/store/toastStore";
import { useTranslation } from "@/hooks/useTranslation";

type CartContentsProps = {
  variant?: "drawer" | "page";
  onClose?: () => void;
};

export default function CartContents({ variant = "drawer", onClose }: CartContentsProps) {
  const { cart, removeFromCart, increaseQty, decreaseQty, clearCart } = useCart();
  const { t } = useTranslation();
  const isPage = variant === "page";

  const discountLineItems = cart.map((item) => ({
    id: item.id,
    price: item.price,
    quantity: item.quantity,
    category: item.category,
  }));
  const breakdown = calculateCartDiscounts(discountLineItems);
  const bulkDiscountActive = cartQualifiesForBulkDiscount(discountLineItems);

  const handleClear = () => {
    clearCart();
    showToast("Cart cleared");
  };

  const lineItems = (
    <>
      {cart.length === 0 ? (
        <div className={isPage ? "rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center" : ""}>
          <p className="text-neutral-500">{t("cartEmpty")}</p>
          {isPage ? (
            <Link
              href={routes.all}
              className="mt-6 inline-block rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              {t("continueShopping")}
            </Link>
          ) : null}
        </div>
      ) : (
        cart.map((item) => (
          <div
            key={item.id}
            className={
              isPage
                ? "flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                : "mb-3 border-b border-neutral-200 pb-3"
            }
          >
            <Link
              href={routes.product(item.id)}
              onClick={onClose}
              className="shrink-0"
            >
              <ProductImage
                src={item.image}
                alt={item.name}
                profile="grid"
                className={
                  isPage
                    ? "h-24 w-24 rounded-lg object-cover sm:h-28 sm:w-28"
                    : "h-16 w-16 rounded object-cover"
                }
              />
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                href={routes.product(item.id)}
                onClick={onClose}
                className={`font-medium text-neutral-900 hover:text-red-600 ${isPage ? "text-base sm:text-lg" : ""}`}
              >
                {item.name}
              </Link>
              <div className="mt-1">
                <ProductDiscountBadge category={item.category} active={bulkDiscountActive} />
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                <Price usd={item.price} /> {t("each")}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decreaseQty(item.id)}
                    className="rounded border border-neutral-300 px-2.5 py-1 text-neutral-700 hover:bg-neutral-100"
                    aria-label={`Decrease quantity for ${item.name}`}
                  >
                    −
                  </button>
                  <span className="min-w-[1.5rem] text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      increaseQty(item.id);
                      showToast("Cart updated");
                    }}
                    className="rounded border border-neutral-300 px-2.5 py-1 text-neutral-700 hover:bg-neutral-100"
                    aria-label={`Increase quantity for ${item.name}`}
                  >
                    +
                  </button>
                </div>

                <span className="text-sm font-medium text-neutral-800">
                  <Price usd={item.price * item.quantity} />
                </span>

                <button
                  type="button"
                  onClick={() => {
                    removeFromCart(item.id);
                    showToast("Removed from cart");
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  {t("remove")}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );

  const summary = (
    <div className={isPage ? "rounded-xl border border-neutral-200 bg-neutral-50 p-6" : ""}>
      <OrderTotalsSummary
        breakdown={breakdown}
        className={isPage ? "mb-4" : "mb-3"}
        compact={!isPage}
      />

      {cart.length > 0 ? (
        <>
          <Link
            href="/checkout"
            onClick={onClose}
            className="mb-3 block w-full rounded-lg bg-red-600 py-3 text-center font-semibold text-white hover:bg-red-700"
          >
            {t("proceedCheckout")}
          </Link>

          {isPage ? (
            <>
              <Link
                href={routes.all}
                className="mb-3 block w-full rounded-lg border border-neutral-300 py-2.5 text-center text-sm font-medium text-neutral-800 hover:bg-white"
              >
                {t("continueShopping")}
              </Link>
              <button
                type="button"
                onClick={handleClear}
                className="w-full rounded-lg border border-neutral-300 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                {t("clearCart")}
              </button>
            </>
          ) : (
            // One row instead of two stacked full-width buttons: "Clear cart"
            // is a rare, destructive action and doesn't warrant the same
            // weight as checkout -- the ~80px it gives back goes to the
            // product list above.
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/cart"
                onClick={onClose}
                className="text-sm font-medium text-neutral-800 underline-offset-2 hover:text-red-600 hover:underline"
              >
                {t("viewAll")}
              </Link>
              <button
                type="button"
                onClick={handleClear}
                className="text-sm text-neutral-500 underline-offset-2 hover:text-red-600 hover:underline"
              >
                {t("clearCart")}
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );

  if (isPage) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-4">{lineItems}</div>
        {cart.length > 0 ? summary : null}
      </div>
    );
  }

  // The drawer's heading, item count and close button live in SideDrawer,
  // which owns the panel chrome for both the cart and nav drawers.
  return (
    <div className="flex h-full flex-col px-5 py-4 text-neutral-900">
      {cart.length === 0 ? (
        lineItems
      ) : (
        // min-h-0 lets this actually shrink-to-fit as a flex child, so the
        // products get every pixel the totals below don't need; shrink-0 on
        // the summary stops it growing back into them.
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">{lineItems}</div>
      )}

      <div className="mt-4 shrink-0 border-t border-neutral-200 pt-3">{summary}</div>
    </div>
  );
}
