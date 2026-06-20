import CategoryGrid from "@/components/shared/CategoryGrid";

export const runtime = "edge";

export default function Page() {
  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-bold capitalize mb-6">
        Catalog
      </h1>

      <CategoryGrid />
    </main>
  );
}
