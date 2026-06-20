import Link from "next/link";

/* =========================================================
   UI LAYER — PURE PRESENTATIONAL TEMPLATE
   ---------------------------------------------------------
   Handles ONLY layout, grid, spacing, cards, responsiveness.
   - No filtering logic.
   - No category awareness / decisions.
   - No fallback logic.
   Everything it renders comes from props.
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
}: {
  title: string;
  brands: TemplateBrand[];
  products: TemplateProduct[];
}) {
  return (
    <main className="min-h-screen p-6 text-white">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>

      {/* BRANDS */}
      {brands.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">
            Brands
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.href}
                href={brand.href}
                className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-red-500/40 transition"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">
          Products
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group bg-white/5 border border-white/10 p-4 rounded-xl hover:border-red-500/40 transition"
              >
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="h-40 w-full object-cover rounded-lg"
                />
                <h3 className="mt-3 font-semibold">{product.name}</h3>
                <p className="text-sm text-red-500 font-bold">
                  ${product.price}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
