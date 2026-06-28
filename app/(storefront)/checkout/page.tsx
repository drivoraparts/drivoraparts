"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { trackEvent } from "@/lib/analytics/client";
import { showToast } from "@/lib/store/toastStore";
import Price from "@/components/currency/Price";
import OrderTotalsSummary from "@/components/checkout/OrderTotalsSummary";
import { CheckoutBrandMark } from "@/components/brand/CheckoutBrandMark";
import { ProductDiscountBadge } from "@/components/product/DiscountBadge";
import { calculateCartDiscounts } from "@/lib/inventory/discounts";
import { useTranslation } from "@/hooks/useTranslation";

const glassCard =
  "box-border w-full max-w-full rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-md sm:p-6";

export default function CheckoutPage() {
  const [hydrated, setHydrated] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cart = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const checkoutTracked = useRef(false);
  const { t } = useTranslation();

  const breakdown = useMemo(
    () =>
      calculateCartDiscounts(
        cart.map((item) => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
        }))
      ),
    [cart]
  );

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated || !cart.length || checkoutTracked.current) return;

    checkoutTracked.current = true;
    trackEvent("checkout_start", {
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      total: breakdown.total,
    });
  }, [hydrated, cart, breakdown.total]);

  const handleCheckout = async () => {
    if (!cart.length || submitting) return;

    if (!fullName.trim() || !email.trim()) {
      showToast("Please enter your name and email");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            brand: item.brand,
            quantity: item.quantity,
          })),
          customer: {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            address: address.trim() || undefined,
          },
          provider: "nowpayments",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showToast(data.error ?? "Checkout failed");
        setSubmitting(false);
        return;
      }

      const paymentUrl =
        (typeof data.redirectUrl === "string" && data.redirectUrl) ||
        data.payment?.paymentUrl;

      if (!paymentUrl) {
        showToast(
          data.payment?.message ??
            "Payment page unavailable. Please try again or contact support."
        );
        setSubmitting(false);
        return;
      }

      trackEvent("order_completed", {
        orderId: data.orderId,
        total: data.total,
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      });

      clearCart();
      window.location.assign(paymentUrl);
    } catch {
      showToast("Checkout failed");
      setSubmitting(false);
    }
  };

  const shellClass =
    "mx-auto box-border w-full max-w-3xl px-4 py-6 text-white sm:px-6 sm:py-8";

  if (!hydrated) {
    return (
      <div className="w-full overflow-x-clip">
        <main className={shellClass}>
          <h1 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            {t("checkout")}
          </h1>
          <p className="text-center text-gray-400">Loading your cart...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-clip">
      <main className={shellClass}>
        <h1 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
          {t("checkout")}
        </h1>

        {cart.length === 0 ? (
          <div className="text-center">
            <p className="mb-4 text-gray-400">Your cart is empty.</p>
            <Link href="/catalog" className="text-red-500 hover:underline">
              Browse catalog
            </Link>
          </div>
        ) : (
          <div className="mx-auto grid w-full min-w-0 max-w-3xl gap-6 lg:max-w-none lg:grid-cols-2 lg:gap-8">
            <div className="min-w-0 space-y-6">
              <section className={glassCard}>
                <h2 className="mb-4 text-xl font-bold">Customer Information</h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="checkout-name"
                      className="mb-1 block text-sm text-gray-400"
                    >
                      Full Name
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="box-border w-full max-w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-email"
                      className="mb-1 block text-sm text-gray-400"
                    >
                      Email
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="box-border w-full max-w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-phone"
                      className="mb-1 block text-sm text-gray-400"
                    >
                      Phone
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 000 0000"
                      className="box-border w-full max-w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="mb-1 block text-sm text-gray-400"
                    >
                      Shipping Address
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, Country"
                      className="box-border w-full max-w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </section>

              <section className={glassCard}>
                <h2 className="mb-4 text-xl font-bold">Payment</h2>
                <p className="mb-4 font-medium">NOWPayments — crypto checkout</p>
                <p className="mb-4 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
                  Click Pay Now to place your order and open the secure NOWPayments
                  payment page. Bitcoin and 300+ cryptocurrencies accepted.
                </p>
                <img
                  src="https://nowpayments.io/images/embeds/payments-button-black.svg"
                  alt="Crypto payments by NOWPayments"
                  className="h-10 w-auto opacity-90"
                />
              </section>
            </div>

            <div className="min-w-0 space-y-6">
              <section className={glassCard}>
                <div className="mb-4 flex min-w-0 items-center justify-between gap-2">
                  <h2 className="shrink-0 text-sm font-medium text-white/70">
                    {t("orderSummary")}
                  </h2>
                  <span className="flex min-w-0 max-w-[58%] items-center justify-end gap-1.5 sm:max-w-[65%]">
                    <CheckoutBrandMark />
                    <span className="truncate text-[11px] leading-tight text-gray-400 sm:text-xs">
                      {t("secureCheckout")}
                    </span>
                  </span>
                </div>

                <div className="divide-y divide-white/5">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex min-w-0 items-start gap-3 py-3"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                        <img
                          src={item.image || "/product-media/avatars/default.svg"}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium leading-snug text-white">
                          {item.name}
                        </h3>
                        <div className="mt-1">
                          <ProductDiscountBadge category={item.category} />
                        </div>
                        <p className="mt-1 text-xs text-white/50">
                          Qty {item.quantity}
                          {item.quantity > 1 ? (
                            <>
                              {" · "}
                              <Price usd={item.price} /> each
                            </>
                          ) : null}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-medium text-white">
                        <Price usd={item.price * item.quantity} />
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-white/10 pt-4">
                  <OrderTotalsSummary breakdown={breakdown} />

                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-white/50">
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    <span>{t("secureCheckout")}</span>
                  </div>
                </div>
              </section>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting}
                className="box-border w-full max-w-full rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500 active:scale-[0.99] disabled:opacity-60 disabled:active:scale-100"
              >
                {submitting ? t("processing") : t("payNow")}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
