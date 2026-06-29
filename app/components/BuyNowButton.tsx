"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { productHasStock } from "@/lib/stock";
import { showToast } from "@/lib/store/toastStore";
import type { AddToCartProduct } from "@/app/components/AddToCartButton";

export default function BuyNowButton({
  product,
  quantity = 1,
  className,
}: {
  product: AddToCartProduct;
  quantity?: number;
  className?: string;
}) {
  const router = useRouter();
  const replaceCart = useCartStore((s) => s.replaceCart);

  const handleBuyNow = () => {
    if (!productHasStock(product.id, quantity)) {
      showToast("Out of stock");
      return;
    }

    replaceCart(product, quantity);
    showToast("Proceeding to checkout");
    router.push("/checkout");
  };

  return (
    <button
      type="button"
      onClick={handleBuyNow}
      className={
        className ??
        "mt-2.5 w-full cursor-pointer rounded-md bg-neutral-900 px-3 py-3 text-sm font-bold text-white"
      }
    >
      Buy Now
    </button>
  );
}
