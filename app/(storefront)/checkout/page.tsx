"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { trackEvent } from "@/lib/analytics/client";
import { showToast } from "@/lib/store/toastStore";
import Price from "@/components/currency/Price";
import CurrencyNotice from "@/components/currency/CurrencyNotice";
import { useTranslation } from "@/hooks/useTranslation";

const glassCard =
  "rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-md";

export default function CheckoutPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cart = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const checkoutTracked = useRef(false);

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
    const checkoutTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    trackEvent("checkout_start", {
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      total: checkoutTotal,
    });
  }, [hydrated, cart]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping: number = 0;
  const total = subtotal + shipping;
  const { t } = useTranslation();

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
          provider: "cryptomus",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showToast(data.error ?? "Checkout failed");
        setSubmitting(false);
        return;
      }

      trackEvent("order_completed", {
        orderId: data.orderId,
        total: data.total,
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      });

      clearCart();

      if (data.payment?.paymentUrl) {
        window.location.href = data.payment.paymentUrl;
        return;
      }

      router.push(`/success?orderId=${data.orderId}`);
    } catch {
      showToast("Checkout failed");
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <main className="mx-auto w-full max-w-4xl overflow-x-hidden px-4 py-6 sm:px-8 sm:py-8 text-white">
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t("checkout")}</h1>
        <p className="text-gray-400">Loading your cart...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl overflow-x-hidden px-4 py-6 sm:px-8 sm:py-8 text-white">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Checkout</h1>

      {cart.length === 0 ? (
        <div>
          <p className="mb-4 text-gray-400">Your cart is empty.</p>
          <Link href="/catalog" className="text-red-500 hover:underline">
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="grid min-w-0 gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <section className={glassCard}>
              <h2 className="mb-4 text-xl font-bold">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="checkout-name" className="mb-1 block text-sm text-gray-400">
                    Full Name
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-email" className="mb-1 block text-sm text-gray-400">
                    Email
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="mb-1 block text-sm text-gray-400">
                    Phone
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-address" className="mb-1 block text-sm text-gray-400">
                    Shipping Address
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, Country"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </section>

            <section className={glassCard}>
              <h2 className="mb-4 text-xl font-bold">Payment</h2>
              <p className="mb-2 font-medium">Cryptomus (Bitcoin / Crypto)</p>
              <p className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
                After placing your order you will be redirected to a secure Cryptomus
                payment page when configured. Otherwise your order is saved as pending
                and confirmation is emailed.
              </p>
            </section>
          </div>

          <div className="space-y-6">
            <section className={`${glassCard} min-w-0`}>
              <div className="mb-4 flex min-w-0 items-start justify-between gap-3 sm:items-center">
                <h2 className="shrink-0 text-sm font-medium text-white/70">
                  {t("orderSummary")}
                </h2>
                <span className="flex min-w-0 shrink items-center gap-1.5 text-xs text-gray-400">
                  <img
                    src="/brand/drivora-logo.png"
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] shrink-0 object-contain"
                  />
                  <span className="truncate">{t("secureCheckout")}</span>
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
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
                      <h3 className="truncate text-sm font-medium text-white">
                        {item.name}
                      </h3>
                      <p className="text-xs text-white/50">
                        Qty {item.quantity}
                        {item.quantity > 1 ? (
                          <>
                            {" · "}
                            <Price usd={item.price} /> each
                          </>
                        ) : (
                          ""
                        )}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-medium text-white">
                      <Price usd={item.price * item.quantity} />
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">{t("subtotal")}</span>
                  <span className="text-white/80">
                    <Price usd={subtotal} />
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">{t("shipping")}</span>
                  <span className="text-white/80">
                    {shipping === 0 ? t("free") : <Price usd={shipping} />}
                  </span>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-white/50">{t("total")}</p>
                  <p className="text-2xl font-semibold tracking-tight text-white">
                    <Price usd={total} />
                  </p>
                </div>

                <CurrencyNotice className="text-xs text-white/45" />

                <div className="flex items-center gap-2 pt-1 text-xs text-white/50">
                  <svg
                    className="h-3.5 w-3.5"
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
              className="w-full rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500 active:scale-[0.99] disabled:opacity-60 disabled:active:scale-100"
            >
              {submitting ? t("processing") : t("payNow")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
