"use client";

import { useCart } from "@/app/context/CartContext";

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
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(product)}
      style={{
        width: "100%",
        padding: "12px",
        background: "#ff9900",
        border: "none",
        borderRadius: "6px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      Add to Cart
    </button>
  );
}