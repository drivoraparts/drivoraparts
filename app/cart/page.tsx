"use client";

import { useEffect, useState } from "react";
import { getCart, removeFromCart } from "@/lib/cart";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ padding: 40, background: "#0b0f19", color: "white", minHeight: "100vh" }}>
      <h1>Your Cart</h1>

      {cart.length === 0 && <p>Cart is empty</p>}

      {cart.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: 20,
            marginTop: 20,
            background: "#111827",
            padding: 15,
            borderRadius: 10
          }}
        >
          <img src={item.thumbnail} width={80} />

          <div style={{ flex: 1 }}>
            <h3>{item.name}</h3>
            <p>${item.price} x {item.quantity}</p>

            <button
              onClick={() => {
                const updated = removeFromCart(item.id);
                setCart([...updated]);
              }}
              style={{ marginTop: 10 }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <hr style={{ margin: "30px 0" }} />

      <h2>Total: ${total}</h2>

      <button
        style={{
          marginTop: 20,
          padding: "14px 20px",
          background: "#22c55e",
          border: "none",
          borderRadius: 10,
          fontWeight: "bold"
        }}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}