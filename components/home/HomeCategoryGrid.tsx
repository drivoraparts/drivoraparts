import Link from "next/link";
import { getCategories, routes } from "@/lib/inventory";
import { HOME_CATEGORY_BLURBS } from "@/lib/home/category-blurbs";

/** Server-rendered category tiles — no client JS, no prefetch storm. */
export default function HomeCategoryGrid() {
  const categories = getCategories();

  return (
    <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={routes.category(cat.slug)}
          prefetch={false}
          className="touch-manipulation rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:border-red-500 hover:bg-white active:bg-red-50"
        >
          <p className="font-semibold text-neutral-900">{cat.name}</p>
          <p className="mt-1 text-xs leading-snug text-neutral-500">
            {HOME_CATEGORY_BLURBS[cat.slug] ?? "Shop listings"}
          </p>
        </Link>
      ))}
    </div>
  );
}
