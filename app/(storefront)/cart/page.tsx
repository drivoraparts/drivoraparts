"use client";

import Link from "next/link";
import Image from "next/image";
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

      {cart.map((item) => (
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
          <Image
            src={item.image}
            width={80}
            height={80}
            alt={item.name}
            style={{ objectFit: "cover", borderRadius: 8 }}
          />

          <div style={{ flex: 1 }}>
            <h3>{item.name}</h3>
            <p>
              <Price usd={item.price} /> x {item.quantity}
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button type="button" onClick={() => decreaseQty(item.id)}>
                −
              </button>
              <button
                type="button"
                onClick={() => {
                  increaseQty(item.id);
                  showToast("Cart updated");
                }}
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  removeFromCart(item.id);
                  showToast("Removed from cart");
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}

      <hr style={{ margin: "30px 0" }} />

      <h2>Total: {formatPrice(total)}</h2>

      {cart.length > 0 && (
        <Link
          href="/checkout"
          style={{
            display: "inline-block",
            marginTop: 20,
            padding: "14px 20px",
            background: "#22c55e",
            border: "none",
            borderRadius: 10,
            fontWeight: "bold",
            color: "white",
            textDecoration: "none",
          }}
        >
          Proceed to Checkout
        </Link>
      )}
    </div>
  );
}
