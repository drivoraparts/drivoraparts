"use client";

import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { cart, removeFromCart } = useCart();

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-bold">
        Cart
      </h2>

      {cart.map((item) => (
        <div
          key={item.id}
          className="mb-3 border-b border-white/10 pb-3"
        >
          <p>{item.name}</p>

          <p>
            {item.quantity} × ${item.price}
          </p>

          <button
            onClick={() =>
              removeFromCart(item.id)
            }
          >
            Remove
          </button>
        </div>
      ))}

      <div className="mt-6">
        <p>Total: ${total.toFixed(2)}</p>
      </div>
    </div>
  );
}