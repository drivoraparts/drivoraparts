"use client";

import { useState } from "react";

export default function AddToCartButton({
  product,
}: {
  product: {
    id: number;
    name: string;
    price: number;
    thumbnail: string;
  };
}) {
  const [loading, setLoading] = useState(false);

  const addToCart = () => {
    setLoading(true);

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existing = cart.find((item: any) => item.id === product.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    setTimeout(() => setLoading(false), 300);
    alert("Added to cart!");
  };

  return (
    <button
      onClick={addToCart}
      disabled={loading}
      style={{
        width: "100%",
        padding: "12px",
        background: "#e60000",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}