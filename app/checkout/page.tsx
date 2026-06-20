"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { showToast } from "@/lib/store/toastStore";

export default function CheckoutPage() {
  const { cart, clearCart, getTotal } = useCart();
  const subtotal = getTotal();
  const total = subtotal;

  const handleCheckout = async () => {
    if (!cart.length) return;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        showToast("Checkout failed");
        return;
      }

      clearCart();
      showToast("Order placed");
    } catch {
      showToast("Checkout failed");
    }
  };

  return (
    <main className="mx-auto max-w-4xl p-8 text-white">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      {cart.length === 0 ? (
        <div>
          <p className="mb-4 text-gray-400">Your cart is empty.</p>
          <Link href="/catalog" className="text-red-500 hover:underline">
            Browse catalog
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-lg border border-white/10 bg-[#111827] p-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.category}</p>
                  {item.brand && (
                    <p className="text-sm text-gray-400">{item.brand}</p>
                  )}
                  <p className="mt-1">
                    ${item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>

                <p className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-white/10 bg-[#111827] p-6">
            <div className="mb-2 flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            className="mt-6 rounded-lg bg-red-600 px-6 py-3 font-semibold"
          >
            Pay With Bitcoin
          </button>
        </>
      )}
    </main>
  );
}
