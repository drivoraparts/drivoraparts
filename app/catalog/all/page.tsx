import PageHeading from "@/components/catalog/PageHeading";
import AllProductsFeed from "@/components/catalog/AllProductsFeed";

export const runtime = "edge";

export default function AllProductsPage() {
  return (
    <main className="min-h-screen p-6 text-white">
      <PageHeading
        title="All Products"
        subtitle="Browse everything in the marketplace"
      />
      <AllProductsFeed />
    </main>
  );
}
