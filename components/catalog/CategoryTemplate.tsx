import PageHeading from "./PageHeading";
import CatalogCard from "./CatalogCard";
import Price from "@/components/currency/Price";

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
};

type TemplateBrand = {
  name: string;
  href: string;
};

export default function CategoryTemplate({
  title,
  brands,
  products,
  showProducts = true,
}: {
  title: string;
  brands: TemplateBrand[];
  products: TemplateProduct[];
  showProducts?: boolean;
}) {
  return (
    <main className="min-h-screen p-6 text-white">
      <PageHeading title={title} />

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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <CatalogCard key={product.id} href={`/product/${product.id}`}>
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="h-40 w-full object-cover rounded-lg"
                  />
                  <h3 className="mt-3 font-semibold">{product.name}</h3>
                  <p className="text-sm text-red-500 font-bold">
                    <Price usd={product.price} />
                  </p>
                </CatalogCard>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
