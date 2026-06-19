import Link from "next/link";

const engineCategories = [
  {
    slug: "japanese-legends",
    title: "Japanese Legends",
    engines: [
      "Toyota 2JZ-GTE",
      "Toyota 1JZ-GTE",
      "Toyota 1UZ-FE V8",
      "Nissan RB26DETT",
      "Nissan SR20DET",
      "Honda K20A / K24",
      "Honda B18C Type R",
      "Mazda 13B Rotary",
    ],
  },
  {
    slug: "bmw-engines",
    title: "BMW Engines",
    engines: [
      "BMW N54 Twin Turbo",
      "BMW N55",
      "BMW S55",
      "BMW S58",
      "BMW M57 Diesel",
      "BMW N63 V8",
    ],
  },
  {
    slug: "american-v8",
    title: "American V8",
    engines: [
      "LS3",
      "LS7",
      "LT1 / LT4",
      "Ford Coyote 5.0",
      "Dodge Hellcat 6.2",
    ],
  },
  {
    slug: "euro-performance",
    title: "Euro Performance",
    engines: [
      "Mercedes M113",
      "Mercedes M157 AMG",
      "Audi 2.0 TFSI EA888",
      "Audi 4.0 TFSI V8",
      "VW VR6",
    ],
  },
  {
    slug: "turbo-kits",
    title: "Turbo / Performance Kits",
    engines: [
      "GTX3076R Kit",
      "GTX3582R Kit",
      "BorgWarner EFR",
      "Precision 6266",
      "Intercoolers",
      "Blow-off Valves",
      "Wastegates",
      "Intakes",
      "Exhaust Systems",
    ],
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
                  className="p-3 bg-black/40 rounded-lg hover:bg-white/10 transition"
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