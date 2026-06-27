import PageHeading from "./PageHeading";
import CatalogCard from "./CatalogCard";
import CatalogProductCard from "./CatalogProductCard";

/* =========================================================
   UI LAYER — PURE PRESENTATIONAL TEMPLATE (SYSTEM A)
   ---------------------------------------------------------
   Same architecture, headers, cards, and animations as the
   engine system — unified red/white brand language.
   No filtering, no category awareness, no fallback.
========================================================= */

type TemplateProduct = {
  id: number;
  name: string;
  price: number;
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
}: {
  title: string;
  intro?: string;
  brands: TemplateBrand[];
  products: TemplateProduct[];
  showProducts?: boolean;
}) {
  return (
    <main className="min-h-screen p-6 text-white">
      <PageHeading title={title} />
      {intro ? (
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-gray-400">
          {intro}
        </p>
      ) : null}

      {/* BRANDS */}
      {brands.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">
            Brands
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {brands.map((brand) => (
              <CatalogCard key={brand.href} href={brand.href}>
                <span className="font-medium">{brand.name}</span>
              </CatalogCard>
            ))}
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      {showProducts && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">
            Products
          </h2>

          {products.length === 0 ? (
            <p className="text-gray-500">No products in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <CatalogProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
