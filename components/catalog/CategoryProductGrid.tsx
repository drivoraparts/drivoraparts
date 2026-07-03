import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import { getProductsByCategory, toCatalogCardData } from "@/lib/inventory";

/** Flat grid of every listing in a category — shown below brand/platform navigation. */
export default function CategoryProductGrid({
  categorySlug,
}: {
  categorySlug: string;
}) {
  const products = getProductsByCategory(categorySlug).map(toCatalogCardData);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-neutral-200 pt-12">
      <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
        All products
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <CatalogProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
