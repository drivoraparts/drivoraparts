import PageHeading from "@/components/catalog/PageHeading";
import AftermarketFeed from "@/components/catalog/AftermarketFeed";

export const runtime = "edge";

export default function AftermarketPage() {
  return (
    <main className="min-h-screen p-6 text-white">
      <PageHeading
        title="Aftermarket"
        subtitle="Browse aftermarket parts and performance upgrades"
      />
      <AftermarketFeed />
    </main>
  );
}
