"use client";

import Link from "next/link";
import ProductImage from "@/components/media/ProductImage";
import { useCart } from "@/context/CartContext";
import { showToast } from "@/lib/store/toastStore";
import Price from "@/components/currency/Price";
import { useFormatPrice } from "@/hooks/useFormatPrice";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    getTotal,
  } = useCart();

  const total = getTotal();
  const formatPrice = useFormatPrice();

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-white px-6 py-10 text-neutral-900 sm:px-8">
      <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>

      {cart.length === 0 && <p className="text-neutral-500">Cart is empty</p>}

      {cart.map((item) => (
        <div
          key={item.id}
          className="mb-4 flex gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
        >
          <ProductImage
            src={item.image}
            alt={item.name}
            profile="grid"
            className="h-20 w-20 rounded-lg object-cover"
          />

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="mt-1 text-sm text-neutral-600">
              <Price usd={item.price} /> x {item.quantity}
            </p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => decreaseQty(item.id)}
                className="rounded border border-neutral-300 px-2 py-1"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => {
                  increaseQty(item.id);
                  showToast("Cart updated");
                }}
                className="rounded border border-neutral-300 px-2 py-1"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  removeFromCart(item.id);
                  showToast("Removed from cart");
                }}
                className="text-sm text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}

      {cart.length > 0 && (
        <>
          <div className="my-8 border-t border-neutral-200 pt-6">
            <h2 className="text-xl font-bold">Total: {formatPrice(total)}</h2>
          </div>

          <Link
            href="/checkout"
            className="inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
          >
            Proceed to Checkout
          </Link>
        </>
      )}
    </main>
  );
}
