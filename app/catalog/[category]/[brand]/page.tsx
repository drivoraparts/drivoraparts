import { products } from "@/data/products";

export default function Page({ params }: any) {
  const { category, brand, engine } = params;

  const filtered = (products as any).filter((p: any) => {
    return (
      (!category || p.category === category) &&
      (!brand || p.brand === brand) &&
      (!engine || p.engine === engine)
    );
  });

  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">
        {category} {brand} {engine}
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
          </div>
        ))}
      </div>
    </main>
  );
}