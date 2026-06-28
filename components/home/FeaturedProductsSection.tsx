import Link from "next/link";
import CatalogProductCard, {
  type CatalogProductCardData,
} from "@/components/catalog/CatalogProductCard";
import { getAllProducts } from "@/lib/inventory";
import { getProductThumbnail } from "@/lib/inventory/media";
import { routes } from "@/lib/inventory";

function toCardData(
  product: ReturnType<typeof getAllProducts>[number]
): CatalogProductCardData {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    thumbnail: getProductThumbnail(product),
    images: product.images,
    category: product.category,
    brand: product.brand,
  };
}

export default function FeaturedProductsSection() {
  const featured = getAllProducts()
    .filter((product) => product.thumbnail || product.images?.length)
    .slice(0, 6)
    .map(toCardData);

  return (
    <section className="border-t border-white/10 bg-zinc-950 px-6 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
              In stock now
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Featured performance parts</h2>
            <p className="mt-2 max-w-2xl text-gray-400">
              Real listings with live prices — add to cart and checkout securely on DrivoraParts.
            </p>
          </div>
          <Link
            href={routes.all}
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-red-500/40 hover:text-red-300"
          >
            View all products
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((product) => (
            <CatalogProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
