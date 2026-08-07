import Link from "next/link";
import CatalogProductCard from "./CatalogProductCard";
import { toCatalogCardData } from "@/lib/catalog/to-card-data";
import type { Product } from "@/lib/inventory/types";

export default function ProductRail({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  badge,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
  viewAllHref?: string;
  /** Optional badge rendered on every card in this rail, e.g. "New". */
  badge?: string;
  tone?: "light" | "muted";
}) {
  if (products.length === 0) return null;

  return (
    <section
      className={`border-b border-neutral-200 px-4 py-10 sm:px-6 lg:px-8 ${
        tone === "muted" ? "bg-neutral-50" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-xl font-bold text-neutral-900 sm:text-2xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 max-w-xl text-sm text-neutral-600">
                {description}
              </p>
            ) : null}
          </div>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              prefetch={false}
              className="touch-manipulation text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
            >
              View all →
            </Link>
          ) : null}
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[220px] shrink-0 snap-start sm:w-[240px]"
            >
              <div className="relative">
                {badge ? (
                  <span className="absolute left-3 top-3 z-20 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {badge}
                  </span>
                ) : null}
                <CatalogProductCard product={toCatalogCardData(product)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
