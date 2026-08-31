"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/media/ProductImage";
import ProductPrice from "@/components/currency/ProductPrice";
import {
  COMPARE_CHANGE_EVENT,
  clearCompare,
  readCompareList,
  removeFromCompare,
} from "@/lib/compare";
import { getProductThumbnail } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";

type FullProduct = {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  brand?: string;
  category: string;
  condition?: string;
  mileage?: string;
  warranty?: string;
  weight?: string;
  coreCharge?: string;
  fitment?: string;
  drivetrain?: string;
  partNumber?: string;
  thumbnail?: string;
  image?: string;
  images?: string[];
};

const SPEC_ROWS: { label: string; key: keyof FullProduct }[] = [
  { label: "Brand", key: "brand" },
  { label: "Category", key: "category" },
  { label: "Condition", key: "condition" },
  { label: "Mileage", key: "mileage" },
  { label: "Warranty", key: "warranty" },
  { label: "Weight", key: "weight" },
  { label: "Core Charge", key: "coreCharge" },
  { label: "Drivetrain", key: "drivetrain" },
  { label: "Part / Code", key: "partNumber" },
  { label: "Fitment", key: "fitment" },
];

export default function ComparePage() {
  const [ids, setIds] = useState<number[]>([]);
  const [products, setProducts] = useState<FullProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onChange = () => setIds(readCompareList().map((item) => item.id));
    onChange();
    window.addEventListener(COMPARE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(COMPARE_CHANGE_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      ids.map((id) =>
        fetch(`/api/product?productId=${id}`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return;
      setProducts(results.filter(Boolean) as FullProduct[]);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <main className="mx-auto max-w-6xl bg-white px-4 py-12 text-neutral-900 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold">Compare Parts</h1>
          <p className="mt-2 text-neutral-600">
            Side-by-side, straight from the listing data.
          </p>
        </div>
        {products.length > 0 ? (
          <button
            type="button"
            onClick={() => clearCompare()}
            className="text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-800"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-10 text-center">
          <p className="text-sm text-neutral-600">
            Nothing to compare yet. Add products from the catalog using the
            Compare button on any listing.
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-32 border-b border-neutral-200 pb-4 text-left align-bottom text-xs font-bold uppercase tracking-wide text-neutral-500">
                  &nbsp;
                </th>
                {products.map((product) => (
                  <th
                    key={product.id}
                    className="min-w-[180px] border-b border-neutral-200 px-3 pb-4 text-left align-bottom"
                  >
                    <button
                      type="button"
                      aria-label={`Remove ${product.name} from compare`}
                      onClick={() => removeFromCompare(product.id)}
                      className="mb-2 text-xs font-semibold text-muted hover:text-accent-hover"
                    >
                      ✕ Remove
                    </button>
                    <Link href={routes.product(product.id)} prefetch={false}>
                      <div className="aspect-square w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                        <ProductImage
                          src={getProductThumbnail(product)}
                          alt={product.name}
                          profile="card"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-bold text-neutral-900 hover:text-accent-hover">
                        {product.name}
                      </p>
                    </Link>
                    <ProductPrice
                      price={product.price}
                      compareAtPrice={product.compareAtPrice}
                      size="sm"
                      className="mt-1"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPEC_ROWS.map((row) => (
                <tr key={row.key}>
                  <td className="border-b border-neutral-100 py-3 pr-3 text-xs font-bold uppercase tracking-wide text-neutral-500">
                    {row.label}
                  </td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className="border-b border-neutral-100 px-3 py-3 text-neutral-700"
                    >
                      {(product[row.key] as string) || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
