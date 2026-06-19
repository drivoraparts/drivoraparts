"use client";

import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }: any) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() =>
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          thumbnail: product.images?.[0],
        })
      }
      style={{
        padding: "10px 15px",
        background: "#ff6600",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      Add to Cart
    </button>
  );
}