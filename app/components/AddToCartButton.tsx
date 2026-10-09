"use client";

import { useState, type MouseEvent } from "react";
import { useCart } from "@/context/CartContext";
import { trackEvent } from "@/lib/analytics/client";
import { readSearchAttribution } from "@/lib/analytics/search-tracking";
import { catalogAllowsPurchase, productHasStock } from "@/lib/stock";
import {
  MAX_LINE_ITEMS,
  MAX_QUANTITY_PER_ITEM,
  lineItemLimitMessage,
  quantityLimitMessage,
} from "@/lib/checkout/limits";
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
  const { addToCart, decreaseQty, cart } = useCart();

  const handleAdd = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const neededQty = cart.find((i) => i.id === product.id)?.quantity ?? 0;
    const totalQty = neededQty + quantity;

    // Checked here rather than at checkout, where the API's rejection reached
    // the customer as "Invalid checkout payload" after they had already
    // entered their name and shipping address.
    if (totalQty > MAX_QUANTITY_PER_ITEM) {
      showToast(quantityLimitMessage(product.name));
      return;
    }

    const alreadyInCart = cart.some((i) => i.id === product.id);
    if (!alreadyInCart && cart.length >= MAX_LINE_ITEMS) {
      showToast(lineItemLimitMessage());
      return;
    }

    setLoading(true);

    try {
      /*
       * The click used to wait for /api/product (a database lookup that takes
       * one to four seconds) before touching the cart, with the button
       * disabled meanwhile, so presses seemed to do nothing. The catalog's own
       * stock answer is instant and authoritative for "not purchasable", so the
       * item is added at once and the live quantity is confirmed afterwards; if
       * it comes back short, this click's quantity is taken out again and the
       * customer is told. Checkout re-checks stock on the server regardless.
       */
      if (!productHasStock(product.id, totalQty)) {
        showToast("Out of stock");
        return;
      }

      addToCart(product, quantity);

      void (async () => {
        try {
          const res = await fetch(`/api/product?productId=${product.id}`);
          const data = await res.json().catch(() => null);
          if (!res.ok || !data) return; // keep the catalog answer
          const stillAvailable =
            catalogAllowsPurchase(product.id) &&
            Boolean(data.inStock) &&
            Number(data.stock) >= totalQty;
          if (stillAvailable) return;
          for (let i = 0; i < quantity; i += 1) decreaseQty(product.id);
          showToast("Out of stock");
        } catch {
          // Use catalog stock when the API is unavailable.
        }
      })();

      /*
       * Search attribution, when this product was reached from a search result.
       * Read-only lookup of a value stored at click time -- the cart call above
       * has already happened and is not affected by any of this.
       */
      const attribution = readSearchAttribution(product.id);

      trackEvent("add_to_cart", {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        ...(attribution
          ? {
              searchId: attribution.searchId,
              searchQuery: attribution.query,
              searchPosition: attribution.position,
              fromSearch: true,
            }
          : {}),
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
          ? "inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2.5 text-xs font-bold tracking-wide text-white transition hover:bg-accent-hover disabled:opacity-60"
          : "inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-3 py-3 text-sm font-bold text-white transition hover:bg-accent-hover disabled:opacity-60")
      }
    >
      {loading ? (
        "Adding..."
      ) : compact ? (
        <>
          <span aria-hidden="true">🛒</span>
          Add to Cart
        </>
      ) : (
        "Add to Cart"
      )}
    </button>
  );
}
