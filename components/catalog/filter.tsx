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
                ? "border-red-500 bg-red-600 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
            }
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}