"use client";

export default function Filter({
  categories,
  active,
  setActive,
}: {
  categories: string[];
  active: string;
  setActive: (val: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto py-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={`
            px-4 py-2 rounded-full text-sm border transition
            ${
              active === cat
                ? "bg-red-600 border-red-500 text-white"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            }
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}