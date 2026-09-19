import MarketCatalogView, {
  marketMetadata,
  type MarketPageProps,
} from "@/components/catalog/MarketCatalogView";

// Per request, like /catalog/all: the vehicle, system and search come from
// the URL, and page one of the listings is rendered into the HTML.
export const dynamic = "force-dynamic";

export const metadata = marketMetadata("worldwide");

export default function Page({ searchParams }: MarketPageProps) {
  return <MarketCatalogView marketKey="worldwide" searchParams={searchParams} />;
}
