"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import ProductPrice from "@/components/currency/ProductPrice";
import ProductImage from "@/components/media/ProductImage";
import { getProductThumbnail } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";

type QuickViewProduct = {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  condition?: string;
  description?: string;
  category: string;
  brand?: string;
  thumbnail?: string;
  image?: string;
  images?: string[];
};

export default function QuickViewModal({
  productId,
  triggerClassName = "",
}: {
  productId: number;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || product) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/product?productId=${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, product, productId]);

  return (
    <>
      <button
        type="button"
        aria-label="Quick view"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className={`flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-700 transition-colors hover:border-red-400 hover:text-accent-hover sm:text-[11px] ${triggerClassName}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-3 w-3 shrink-0"
          aria-hidden
        >
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Quick View
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product quick view"
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
          }}
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-white p-5 sm:flex-row sm:gap-6 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close quick view"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-600 transition hover:bg-neutral-100"
            >
              ✕
            </button>

            {loading ? (
              <div className="flex w-full items-center justify-center py-16 text-sm text-neutral-500">
                Loading…
              </div>
            ) : error || !product ? (
              <div className="flex w-full items-center justify-center py-16 text-sm text-neutral-500">
                Couldn&apos;t load this product.
              </div>
            ) : (
              <>
                <div className="w-full shrink-0 sm:w-64">
                  <div className="aspect-square w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                    <ProductImage
                      src={getProductThumbnail(product)}
                      alt={product.name}
                      profile="detail"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="mt-4 min-w-0 flex-1 sm:mt-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {product.category}
                    {product.brand ? ` · ${product.brand}` : ""}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-neutral-900">
                    {product.name}
                  </h3>

                  <div className="mt-2">
                    <ProductPrice
                      price={product.price}
                      compareAtPrice={product.compareAtPrice}
                      size="md"
                    />
                  </div>

                  {product.condition ? (
                    <p className="mt-2 text-xs font-semibold text-neutral-500">
                      Condition: {product.condition}
                    </p>
                  ) : null}

                  {product.description ? (
                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-neutral-600">
                      {product.description}
                    </p>
                  ) : null}

                  <div className="mt-5 space-y-2.5">
                    <AddToCartButton
                      product={
                        {
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: getProductThumbnail(product),
                          category: product.category,
                          brand: product.brand,
                        } satisfies AddToCartProduct
                      }
                    />
                    <Link
                      href={routes.product(product.id)}
                      prefetch={false}
                      className="block text-center text-sm font-semibold text-accent hover:text-accent-hover"
                    >
                      View full details →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
