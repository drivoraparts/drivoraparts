import { products } from "@/data/products";

export const runtime = "edge";

export default async function BrandPage({
  params,
}: {
  params: { category: string; brand: string };
}) {
  const { category, brand } = params;

  const filtered = products.filter(
    (p) =>
      p.category === category &&
      p.name.toLowerCase().includes(brand.toLowerCase())
  );

  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-bold capitalize mb-6">
        {brand} Parts
      </h1>

      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white/5 border border-white/10 p-4 rounded-xl"
          >
            <img
              src={p.thumbnail}
              className="h-40 w-full object-cover rounded-lg"
            />

            <h3 className="mt-3 font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-400">${p.price}</p>

            <button className="mt-3 w-full bg-red-600 py-2 rounded-lg">
              View Product
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}