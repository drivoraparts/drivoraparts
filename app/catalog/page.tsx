import CategoryGrid from "@/components/shared/CategoryGrid";

export default function CatalogPage() {
  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Browse Catalog</h1>

      <CategoryGrid />
    </main>
  );
}