"use client";

import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cart } = useCart();

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Checkout
      </h1>

      <p>Total: ${total.toFixed(2)}</p>

      <button className="mt-6 rounded-lg bg-red-600 px-6 py-3">
        Pay With Bitcoin
      </button>
    </main>
  );
}