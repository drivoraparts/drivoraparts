"use client";

import { useEffect, useState } from "react";
import CartContents from "@/components/cart/CartContents";
import { useCartStore } from "@/lib/store/cartStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function CartPageView() {
  const [hydrated, setHydrated] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const { t } = useTranslation();

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return (
    <main className="mx-auto box-border w-full min-w-0 max-w-6xl bg-white px-4 py-8 text-neutral-900 sm:px-6 sm:py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
          DrivoraParts
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t("cart")}</h1>
        {hydrated && itemCount > 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            {itemCount} {itemCount === 1 ? "item" : "items"} ready for checkout
          </p>
        ) : null}
      </div>

      {!hydrated ? (
        <p className="text-neutral-500">Loading your cart...</p>
      ) : (
        <CartContents variant="page" />
      )}
    </main>
  );
}
