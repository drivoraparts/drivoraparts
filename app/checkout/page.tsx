"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { trackEvent } from "@/lib/analytics/client";
import { showToast } from "@/lib/store/toastStore";

const glassCard =
  "rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-md";

export default function CheckoutPage() {
  const [hydrated, setHydrated] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

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
  const shipping = 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!cart.length) return;

    if (!fullName.trim() || !email.trim()) {
      showToast("Please enter your name and email");
      return;
    }

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
            address: address.trim() || undefined,
          },
        }),
      });

      if (!res.ok) {
        showToast("Checkout failed");
        return;
      }

      const order = await res.json();
      trackEvent("order_completed", {
        orderId: order.id,
        total: order.total,
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      });

      clearCart();
      showToast("Order placed");
    } catch {
      showToast("Checkout failed");
    }
  };

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-4xl overflow-x-hidden p-8 text-white">
        <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
        <p className="text-gray-400">Loading your cart...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl overflow-x-hidden p-8 text-white">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      {cart.length === 0 ? (
        <div>
          <p className="mb-4 text-gray-400">Your cart is empty.</p>
          <Link href="/catalog" className="text-red-500 hover:underline">
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
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
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
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
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="checkout-address"
                    className="mb-1 block text-sm text-gray-400"
                  >
                    Shipping Address (optional)
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
              <p className="mb-2 font-medium">Cryptomus Payment (Pending Integration)</p>
              <p className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                Payment gateway not yet connected. Order details will be saved,
                but BTC payment is not active yet.
              </p>
            </section>
          </div>

          <div className="space-y-6">
            <section className={glassCard}>
              <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 shrink-0 rounded object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.brand && (
                        <p className="text-sm text-gray-400">{item.brand}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-400">
                        Unit: ${item.price.toFixed(2)}
                      </p>
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>

                    <p className="shrink-0 font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold"
            >
              Pay With Bitcoin
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
