"use client";

import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/marketplace";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    const order = createOrder();
    if (order) {
      clearCart();
    }
  };

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Checkout
      </h1>

      <p>Total: ${total.toFixed(2)}</p>

      <button
        onClick={handleCheckout}
        className="mt-6 rounded-lg bg-red-600 px-6 py-3"
      >
        Pay With Bitcoin
      </button>
    </main>
  );
}
