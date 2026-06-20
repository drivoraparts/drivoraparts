"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { hasStock } from "@/lib/marketplace";

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
  const { addToCart } = useCart();

  const handleAdd = () => {
    if (!hasStock(product.id)) {
      alert("Out of stock");
      return;
    }

    setLoading(true);
    addToCart(product);
    setTimeout(() => setLoading(false), 300);
    alert("Added to cart!");
  };

  return (
    <button
      onClick={handleAdd}
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
