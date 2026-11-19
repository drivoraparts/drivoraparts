"use client";

import Link from "next/link";
import { useState } from "react";
import Price from "@/components/currency/Price";
import { useCartStore } from "@/lib/store/cartStore";
import { productHasStock } from "@/lib/stock";
import { trackEvent } from "@/lib/analytics/client";
import { showToast } from "@/lib/store/toastStore";
import { lineItemLimitMessage, quantityLimitMessage } from "@/lib/checkout/limits";
import type { ResolvedBundle } from "@/lib/catalog/bundles";

/*
 * "Complete the kit": approved kit bundles that include this listing, each
 * with one button that adds every component to the cart at its own listing
 * price. The total shown is simply the sum of those prices -- no bundle
 * discount, no struck-through figure.
 */
export default function ProductBundles({
  bundles,
  currentProductId,
}: {
  bundles: ResolvedBundle[];
  currentProductId: number;
}) {
  if (!bundles.length) return null;
  return (
    <section aria-labelledby="product-bundles-heading" className="mt-6 space-y-4">
      <h2
        id="product-bundles-heading"
        className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-700"
      >
        Complete the kit
      </h2>
      {bundles.map((bundle) => (
        <BundleCard key={bundle.id} bundle={bundle} currentProductId={currentProductId} />
      ))}
    </section>
  );
}

function BundleCard({
  bundle,
  currentProductId,
}: {
  bundle: ResolvedBundle;
  currentProductId: number;
}) {
  const addItems = useCartStore((s) => s.addItems);
  const [busy, setBusy] = useState(false);

  const handleAdd = () => {
    if (busy) return;
    setBusy(true);
    try {
      const cart = useCartStore.getState().items;
      for (const line of bundle.lines) {
        const inCart = cart.find((i) => i.id === line.product.id)?.quantity ?? 0;
        if (!productHasStock(line.product.id, inCart + line.quantity)) {
          showToast(`${line.product.name} is out of stock`);
          return;
        }
      }
      const result = addItems(bundle.lines.map((l) => ({ item: l.product, quantity: l.quantity })));
      if ("reason" in result) {
        showToast("name" in result ? quantityLimitMessage(result.name) : lineItemLimitMessage());
        return;
      }
      for (const line of bundle.lines) {
        trackEvent("add_to_cart", {
          productId: line.product.id,
          productName: line.product.name,
          price: line.product.price,
          quantity: line.quantity,
          bundleId: bundle.id,
        });
      }
      showToast(`Added ${bundle.itemCount} items to cart`);
    } catch {
      showToast("Unable to add to cart");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[3px] border border-neutral-300 bg-white p-4">
      <p className="font-semibold leading-snug text-neutral-900">{bundle.name}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">{bundle.summary}</p>
      <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200 text-[13px]">
        {bundle.lines.map((line) => (
          <li key={line.product.id} className="flex items-start justify-between gap-3 py-2">
            <span className="min-w-0">
              <span className="font-semibold text-neutral-900">{line.quantity} ×</span>{" "}
              {line.product.id === currentProductId ? (
                <span className="text-neutral-800">{line.product.name}</span>
              ) : (
                <Link
                  href={`/product/${line.product.id}`}
                  className="text-neutral-800 underline-offset-2 hover:text-accent-hover hover:underline"
                >
                  {line.product.name}
                </Link>
              )}
              <span className="block text-[11px] text-neutral-500">Part {line.partNumber}</span>
            </span>
            <Price usd={line.product.price * line.quantity} className="shrink-0 font-medium text-neutral-900" />
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">{bundle.notIncluded}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[13px] text-neutral-700">
          {bundle.itemCount} items ·{" "}
          <Price usd={bundle.total} className="text-base font-bold text-neutral-900" />
        </span>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={busy}
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-[3px] border border-neutral-900 px-4 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:opacity-60"
      >
        Add all {bundle.itemCount} items to cart
      </button>
      <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">
        Each part is added at its own listed price. Confirm fitment with your VIN before ordering.
      </p>
    </div>
  );
}
