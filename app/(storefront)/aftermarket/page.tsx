import PageHeading from "@/components/catalog/PageHeading";
import AftermarketFeed from "@/components/catalog/AftermarketFeed";

export default function AftermarketPage() {
  return (
    <main className="min-h-screen p-6 text-white">
      <PageHeading
        title="Aftermarket"
        subtitle="Used / Performance Marketplace — browse pre-owned and refurbished parts"
      />
      <AftermarketFeed />
    </main>
  );
}
