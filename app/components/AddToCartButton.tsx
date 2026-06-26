"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { trackEvent } from "@/lib/analytics/client";
import { productHasStock } from "@/lib/stock";
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
  compact = false,
}: {
  product: AddToCartProduct;
  quantity?: number;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const { addToCart, cart } = useCart();

  const handleAdd = async () => {
    const neededQty = cart.find((i) => i.id === product.id)?.quantity ?? 0;
    const totalQty = neededQty + quantity;

    setLoading(true);

    try {
      let canAdd = productHasStock(product.id, totalQty);

      try {
        const res = await fetch(`/api/product?productId=${product.id}`);
        const data = await res.json().catch(() => null);

        if (res.ok && data) {
          canAdd = Boolean(data.inStock) && Number(data.stock) >= totalQty;
        }
      } catch {
        // Use catalog stock when the API is unavailable.
      }

      if (!canAdd) {
        showToast("Out of stock");
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
      showToast("Unable to add to cart");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={loading}
      className={
        compact
          ? "w-full rounded-lg bg-red-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
          : "w-full rounded-md bg-red-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-60"
      }
    >
      {loading ? "Adding..." : compact ? "Add" : "Add to Cart"}
    </button>
  );
}
