"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AddToCartButton from "@/app/components/AddToCartButton";
import { getConditionLabel } from "@/lib/inventory/condition";
import { routes } from "@/lib/inventory/routes";
import ProductImage from "@/components/media/ProductImage";
import ProductPrice from "@/components/currency/ProductPrice";
import TranslatedText from "@/components/i18n/TranslatedText";

export type AftermarketFeedItem = {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  thumbnail?: string;
  image?: string;
  brand: string;
  brandName: string;
  category: string;
  description?: string;
  condition?: string;
  stock?: boolean;
  stockQty?: number;
  createdAt?: number;
};

type SortOption = "price-asc" | "price-desc" | "newest" | "oldest";

export default function AftermarketFeed({
  products,
}: {
  products: AftermarketFeedItem[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let results = products.filter((product) => {
      if (!q) return true;

      return (
        product.name.toLowerCase().includes(q) ||
        product.brandName.toLowerCase().includes(q) ||
        (product.description ?? "").toLowerCase().includes(q) ||
        (product.condition ?? "").toLowerCase().includes(q)
      );
    });

    results = [...results].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return (b.createdAt ?? b.id) - (a.createdAt ?? a.id);
        case "oldest":
          return (a.createdAt ?? a.id) - (b.createdAt ?? b.id);
        default:
          return 0;
      }
    });

    return results;
  }, [products, query, sort]);

  return (
    <div className="space-y-8">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search aftermarket parts by name, brand, or type..."
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-9 text-neutral-900 placeholder:text-neutral-400 transition-colors duration-300 focus:border-red-500 focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-700"
          >
            ✕
          </button>
        ) : null}
      </div>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as SortOption)}
        className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-red-500 focus:outline-none"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="price-asc">Price Low → High</option>
        <option value="price-desc">Price High → Low</option>
      </select>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No aftermarket parts found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((product, index) => {
            const image = product.thumbnail ?? product.image;
            const inStock = product.stock !== false;

            return (
              // Not CatalogCard: that is a plain <Link> wrapper, so these
              // listings had no add-to-cart at all. Same structure as
              // CatalogProductCard instead -- a full-tile link underneath, the
              // cart button stacked above it -- so the whole card stays
              // clickable without nesting a button inside an anchor.
              <article
                key={product.id}
                className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 transition-all duration-300 hover:border-red-500 hover:shadow-md"
              >
                <Link
                  href={routes.product(product.id)}
                  className="absolute inset-0 z-10 rounded-xl"
                  aria-label={`View ${product.name}`}
                />
                <div className="pointer-events-none absolute inset-0 bg-red-500/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative text-neutral-900">
                {image ? (
                  <ProductImage
                    src={image}
                    alt={product.name}
                    profile="card"
                    loading={index < 4 ? "eager" : "lazy"}
                    fetchPriority={index < 2 ? "high" : undefined}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
                    No image
                  </div>
                )}
                <h3 className="mt-3 font-semibold">
                  <TranslatedText as="span">{product.name}</TranslatedText>
                </h3>
                <ProductPrice
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  size="md"
                  className="text-sm"
                />
                <div className="mt-2 space-y-1 text-xs text-gray-400">
                  <p>Condition: {getConditionLabel(product)}</p>
                  <p className={inStock ? "text-gray-300" : "text-red-400"}>
                    {product.stockQty != null
                      ? product.stockQty > 0
                        ? `${product.stockQty} in stock`
                        : "Out of Stock"
                      : inStock
                        ? "In Stock"
                        : "Out of Stock"}
                  </p>
                  <span className="inline-block rounded border border-neutral-200 px-2 py-0.5">
                    {product.brandName}
                  </span>
                </div>
                </div>

                <div className="relative z-20 mt-3">
                  <AddToCartButton
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: image ?? "",
                      category: product.category,
                      brand: product.brand,
                    }}
                    compact
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
