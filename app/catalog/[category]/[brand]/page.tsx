import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, getBrand } from "@/data/store";

export const runtime = "edge";

export default async function Page({ params }: any) {
  const { category: categorySlug, brand: brandSlug } = await params;

  const category = getCategory(categorySlug);
  if (!category) return notFound();

  const brand = getBrand(categorySlug, brandSlug);
  if (!brand) return notFound();

  const products = category.products.filter((p) => p.brand === brand);

  return (
    <main className="min-h-screen p-6 text-white">
      <h1 className="text-3xl font-bold mb-2">{brand}</h1>
      <p className="text-sm text-gray-400 mb-8">{category.name}</p>

      {products.length === 0 ? (
        <p className="text-gray-500">No products for this brand yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-red-500/40 transition"
            >
              <img
                src={product.thumbnail}
                alt={product.name}
                className="h-40 w-full object-cover rounded-lg"
              />
              <h3 className="mt-3 font-semibold">{product.name}</h3>
              <p className="text-sm text-red-500 font-bold">${product.price}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
