import Link from "next/link";
import PageHeading from "./PageHeading";
import CatalogCard from "./CatalogCard";
import CatalogProductCard from "./CatalogProductCard";
import { routes } from "@/lib/inventory/routes";

const PREVIEW_LIMIT = 24;

type TemplateProduct = {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  thumbnail: string;
  images?: string[];
  category: string;
  brand?: string;
};

type TemplateBrand = {
  name: string;
  href: string;
};

export default function CategoryTemplate({
  title,
  intro,
  brands,
  products,
  showProducts = true,
  scrollListKey,
}: {
  title: string;
  intro?: string;
  brands: TemplateBrand[];
  products: TemplateProduct[];
  showProducts?: boolean;
  scrollListKey?: string;
}) {
  // Category hubs used to render every listing they had: 334 cards on
  // suspension, 1.5MB of HTML, and that many client components to hydrate
  // before a single tap registered. The rest is handed to /catalog/all, which
  // is already paginated.
  const visibleProducts = products.slice(0, PREVIEW_LIMIT);
  const hiddenCount = products.length - visibleProducts.length;
  const categorySlug = products[0]?.category;

  return (
    <main className="box-border min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-white p-4 text-neutral-900 sm:p-6">
      <PageHeading title={title} />
      {intro ? (
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-neutral-500">
          {intro}
        </p>
      ) : null}

      {brands.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
            Brands
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {brands.map((brand) => (
              <CatalogCard key={brand.href} href={brand.href}>
                <span className="font-medium">{brand.name}</span>
              </CatalogCard>
            ))}
          </div>
        </section>
      )}

      {showProducts && products.length > 0 && (
        <section className="border-t border-neutral-200 pt-12">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xs uppercase tracking-widest text-neutral-500">
              All products
            </h2>
            {hiddenCount > 0 ? (
              <p className="text-xs text-neutral-500">
                Showing {visibleProducts.length} of {products.length.toLocaleString()}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {visibleProducts.map((product) => (
              <CatalogProductCard
                key={product.id}
                product={product}
                scrollListKey={scrollListKey}
              />
            ))}
          </div>

          {hiddenCount > 0 && categorySlug ? (
            <div className="mt-8 text-center">
              <Link
                href={`${routes.all}?category=${encodeURIComponent(categorySlug)}`}
                className="inline-block rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                View all {products.length.toLocaleString()} products
              </Link>
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}
