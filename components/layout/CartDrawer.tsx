"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { showToast } from "@/lib/store/toastStore";
import Price from "@/components/currency/Price";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { useTranslation } from "@/hooks/useTranslation";

type CartDrawerProps = {
  onClose?: () => void;
};

export default function CartDrawer({ onClose }: CartDrawerProps) {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
    getTotal,
  } = useCart();

  const total = getTotal();
  const formatPrice = useFormatPrice();
  const { t } = useTranslation();

  const handleClear = () => {
    clearCart();
    showToast("Cart cleared");
  };

  return (
    <div className="flex h-full flex-col p-6 text-white">
      <h2 className="mb-4 text-xl font-bold">{t("cart")}</h2>

      {cart.length === 0 ? (
        <p className="text-gray-400">{t("cartEmpty")}</p>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {cart.map((item) => (
            <div
              key={item.id}
              className="mb-3 border-b border-white/10 pb-3"
            >
              <div className="flex gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-16 rounded object-cover"
                />

                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-400">
                    <Price usd={item.price} /> {t("each")}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => decreaseQty(item.id)}
                      className="rounded border border-white/20 px-2"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => {
                        increaseQty(item.id);
                        showToast("Cart updated");
                      }}
                      className="rounded border border-white/20 px-2"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  removeFromCart(item.id);
                  showToast("Removed from cart");
                }}
                className="mt-2 text-sm text-red-400"
              >
                {t("remove")}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 border-t border-white/10 pt-4">
        <p className="mb-4 text-lg font-semibold">
          {t("total")}: {formatPrice(total)}
        </p>

        <Link
          href="/checkout"
          onClick={onClose}
          className="mb-3 block w-full rounded-lg bg-red-600 py-3 text-center font-semibold"
        >
          {t("proceedCheckout")}
        </Link>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="w-full rounded-lg border border-white/20 py-2 text-sm"
          >
            {t("clearCart")}
          </button>
        )}
      </div>
    </div>
  );
}
