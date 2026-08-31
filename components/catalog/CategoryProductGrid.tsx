import Link from "next/link";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import { LIST_SCROLL_KEYS } from "@/lib/catalog/list-scroll-restore";
import { getProductsByCategory, toCatalogCardData } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";

/**
 * Preview of a category's listings, with the rest handed off to the paginated
 * /catalog/all view.
 *
 * This used to render every product in the category. On suspension that was
 * 334 cards in one response -- 1.5MB of HTML, and 334 client components each
 * with an add-to-cart and wishlist button to hydrate before any of them would
 * respond to a tap. The page looked loaded long before it was usable, which
 * read as "the products are hard to click".
 */
const PREVIEW_LIMIT = 24;

export default function CategoryProductGrid({
  categorySlug,
}: {
  categorySlug: string;
}) {
  const allProducts = getProductsByCategory(categorySlug);
  const products = allProducts.slice(0, PREVIEW_LIMIT).map(toCatalogCardData);
  const remaining = allProducts.length - products.length;
  const scrollListKey = LIST_SCROLL_KEYS.category(categorySlug);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-neutral-200 pt-12">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xs uppercase tracking-widest text-neutral-500">
          All products
        </h2>
        {remaining > 0 ? (
          <p className="text-xs text-neutral-500">
            Showing {products.length} of {allProducts.length.toLocaleString()}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <CatalogProductCard
            key={product.id}
            product={product}
            scrollListKey={scrollListKey}
          />
        ))}
      </div>

      {remaining > 0 ? (
        <div className="mt-8 text-center">
          <Link
            href={`${routes.all}?category=${encodeURIComponent(categorySlug)}`}
            className="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            View all {allProducts.length.toLocaleString()} products
          </Link>
        </div>
      ) : null}
    </section>
  );
}
