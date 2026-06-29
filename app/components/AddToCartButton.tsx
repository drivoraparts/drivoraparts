"use client";

import { useState, type MouseEvent } from "react";
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
  className,
}: {
  product: AddToCartProduct;
  quantity?: number;
  compact?: boolean;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const { addToCart, cart } = useCart();

  const handleAdd = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

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
        className ??
        (compact
          ? "inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2.5 text-xs font-bold tracking-wide text-white transition hover:bg-red-500 disabled:opacity-60"
          : "inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-60")
      }
    >
      {loading ? (
        "Adding..."
      ) : compact ? (
        <>
          <span aria-hidden="true">🛒</span>
          ADD CART
        </>
      ) : (
        "Add to Cart"
      )}
    </button>
  );
}
