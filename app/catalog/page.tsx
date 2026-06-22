export const runtime = 'edge';

import CategoryGrid from "@/components/shared/CategoryGrid";
import PageHeading from "@/components/catalog/PageHeading";

export default function Page() {
  return (
    <main className="min-h-screen p-6 text-white">
      <PageHeading title="Catalog" />

      <CategoryGrid />
    </main>
  );
}
