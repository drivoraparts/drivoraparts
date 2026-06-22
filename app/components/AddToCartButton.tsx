"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { trackEvent } from "@/lib/analytics/client";
import { showToast } from "@/lib/store/toastStore";

export type AddToCartProduct = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  brand?: string;
};

export default function AddToCartButton({
  product,
  quantity = 1,
}: {
  product: AddToCartProduct;
  quantity?: number;
}) {
  const [loading, setLoading] = useState(false);
  const { addToCart, cart } = useCart();

  const handleAdd = async () => {
    const currentQty = cart.find((i) => i.id === product.id)?.quantity ?? 0;

    setLoading(true);

    try {
      const res = await fetch(`/api/product?productId=${product.id}`);
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.inStock || data.stock < currentQty + quantity) {
        showToast("Out of stock");
        setLoading(false);
        return;
      }

      addToCart(product, quantity);
      trackEvent("add_to_cart", {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
      });
      showToast("Added to cart");
    } catch {
      showToast("Unable to verify stock");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
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
