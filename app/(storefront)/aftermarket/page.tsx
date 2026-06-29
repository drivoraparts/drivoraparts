import PageHeading from "@/components/catalog/PageHeading";
import AftermarketFeed from "@/components/catalog/AftermarketFeed";

export default function AftermarketPage() {
  return (
    <main className="box-border min-h-screen w-full min-w-0 max-w-full overflow-x-hidden p-4 text-white sm:p-6">
      <PageHeading
        title="Aftermarket"
        subtitle="Used / Performance Marketplace — browse pre-owned and refurbished parts"
      />
      <AftermarketFeed />
    </main>
  );
}
