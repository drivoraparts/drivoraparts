"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart } = useCart();

  const total = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  return (
    <div
      style={{
        padding: 40,
        background: "#0b0f19",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <h1>Your Cart</h1>

      {cart.length === 0 && <p>Cart is empty</p>}

      {cart.map((item: any) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: 20,
            marginTop: 20,
            background: "#111827",
            padding: 15,
            borderRadius: 10,
          }}
        >
          <img src={item.thumbnail} width={80} />

          <div style={{ flex: 1 }}>
            <h3>{item.name}</h3>
            <p>
              ${item.price} x {item.quantity}
            </p>

            <button
              onClick={() => removeFromCart(item.id)}
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
          fontWeight: "bold",
        }}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}