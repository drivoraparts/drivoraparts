import Link from "next/link";
import { categories } from "@/lib/inventory/categories";
import { routes } from "@/lib/inventory/routes";

/** Server-rendered catalog hub — CSS hover only, no client JS or product catalog import. */
export default function CategoryGrid() {
  const tileClass =
    "group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 transition-all duration-300 active:scale-95 hover:border-red-500 hover:bg-red-50 hover:shadow-md";

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={
            cat.slug === "aftermarket"
              ? routes.aftermarket
              : routes.category(cat.slug)
          }
          className={tileClass}
        >
          <div className="pointer-events-none absolute inset-0 bg-red-500/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative font-medium capitalize text-neutral-900">
            {cat.name}
          </span>
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-600 transition-all duration-300 group-hover:w-full" />
        </Link>
      ))}

      <Link href={routes.all} className={tileClass}>
        <div className="pointer-events-none absolute inset-0 bg-red-500/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
        <span className="relative font-medium text-neutral-900">All Products</span>
        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-600 transition-all duration-300 group-hover:w-full" />
      </Link>
    </div>
  );
}
