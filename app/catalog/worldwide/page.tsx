import MarketCatalogView, {
  marketViewMetadata,
  type MarketPageProps,
} from "@/components/catalog/MarketCatalogView";

// Per request, like /catalog/all: the vehicle, system and search come from
// the URL, and page one of the listings is rendered into the HTML.
export const dynamic = "force-dynamic";

export function generateMetadata({ searchParams }: MarketPageProps) {
  return marketViewMetadata("worldwide", searchParams);
}

export default function Page({ searchParams }: MarketPageProps) {
  return <MarketCatalogView marketKey="worldwide" searchParams={searchParams} />;
}
