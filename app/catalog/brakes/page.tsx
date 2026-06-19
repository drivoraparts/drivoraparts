import Link from "next/link";

const items = [
  "Brembo GT Kits",
  "Wilwood Big Brake Kits",
  "EBC Rotors & Pads",
  "ATE OEM Kits",
];

export default function BrakesPage() {
  return (
    <main className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-8">Brakes</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item}
            href={`/catalog/brakes/${item.toLowerCase().replace(/ /g, "-")}`}
            className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
          >
            {item}
          </Link>
        ))}
      </div>
    </main>
  );
}