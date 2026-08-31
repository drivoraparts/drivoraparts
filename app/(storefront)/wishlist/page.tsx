"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AllProductsGridCard from "@/components/catalog/AllProductsGridCard";
import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";
import { WISHLIST_CHANGE_EVENT, readWishlist } from "@/lib/wishlist";
import { routes } from "@/lib/inventory/routes";

export default function WishlistPage() {
  const [items, setItems] = useState<CatalogProductCardData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(readWishlist());

    const onChange = () => setItems(readWishlist());
    window.addEventListener(WISHLIST_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(WISHLIST_CHANGE_EVENT, onChange);
  }, []);

  return (
    <main className="mx-auto max-w-6xl bg-white px-4 py-12 text-neutral-900 sm:px-6">
      <h1 className="mb-2 text-4xl font-bold">Your Wishlist</h1>
      <p className="mb-8 text-neutral-600">
        Saved from your browsing — kept on this device.
      </p>

      {!mounted ? null : items.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-10 text-center">
          <p className="text-sm text-neutral-600">
            Nothing saved yet. Tap the heart on any product to add it here.
          </p>
          <Link
            href={routes.all}
            prefetch={false}
            className="mt-4 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-accent-active"
          >
            Browse marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((product) => (
            <AllProductsGridCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
