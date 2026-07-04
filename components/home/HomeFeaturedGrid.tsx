import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";
import HomeFeaturedCard from "./HomeFeaturedCard";

/** Featured row on the homepage. Scroll restore handled globally on back navigation. */
export default function HomeFeaturedGrid({
  products,
}: {
  products: CatalogProductCardData[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {products.map((product) => (
          <HomeFeaturedCard key={product.id} product={product} />
        ))}
    </div>
  );
}
