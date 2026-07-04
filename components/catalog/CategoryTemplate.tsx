import PageHeading from "./PageHeading";
import CatalogCard from "./CatalogCard";
import CatalogProductCard from "./CatalogProductCard";

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
          <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
            All products
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <CatalogProductCard
                key={product.id}
                product={product}
                scrollListKey={scrollListKey}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
