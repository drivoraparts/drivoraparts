export const runtime = "edge";

import Link from "next/link";

const engineCategories = [
  {
    slug: "japanese-legends",
    title: "Japanese Legends",
    engines: ["2JZ", "1JZ", "RB26DETT", "SR20DET"],
  },
  {
    slug: "bmw-engines",
    title: "BMW Engines",
    engines: ["N54", "N55", "S55", "S58"],
  },
  {
    slug: "american-v8",
    title: "American V8",
    engines: ["LS3", "LS7", "Coyote 5.0"],
  },
];

export default function EnginePage() {
  return (
    <main className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-8">Engine Categories</h1>

      <div className="grid gap-6">
        {engineCategories.map((group) => (
          <div
            key={group.slug}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <h2 className="text-xl font-semibold mb-4 text-red-500">
              {group.title}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {group.engines.map((engine) => (
                <Link
                  key={engine}
                  href={`/catalog/engine/${group.slug}/${engine
                    .toLowerCase()
                    .replace(/ /g, "-")}`}
                  className="p-3 bg-black/40 rounded-lg hover:bg-white/10"
                >
                  {engine}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}