"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { productHasStock } from "@/lib/stock";
import { showToast } from "@/lib/store/toastStore";
import type { AddToCartProduct } from "@/app/components/AddToCartButton";

export default function BuyNowButton({
  product,
}: {
  product: AddToCartProduct;
}) {
  const router = useRouter();
  const replaceCart = useCartStore((s) => s.replaceCart);

  const handleBuyNow = () => {
    if (!productHasStock(product.id, 1)) {
      showToast("Out of stock");
      return;
    }

    replaceCart(product);
    showToast("Proceeding to checkout");
    router.push("/checkout");
  };

  return (
    <button
      type="button"
      onClick={handleBuyNow}
      style={{
        width: "100%",
        padding: "12px",
        background: "#232f3e",
        color: "white",
        border: "none",
        borderRadius: "6px",
        marginTop: "10px",
        cursor: "pointer",
      }}
    >
      Buy Now
    </button>
  );
}
