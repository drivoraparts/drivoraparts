import PageHeading from "@/components/catalog/PageHeading";
import AftermarketFeed, {
  type AftermarketFeedItem,
} from "@/components/catalog/AftermarketFeed";
import {
  getBrandBySlug,
  getProductsByCategory,
} from "@/lib/inventory";

export const dynamic = "force-static";

export default function AftermarketPage() {
  const products: AftermarketFeedItem[] = getProductsByCategory("aftermarket").map(
    (product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      thumbnail: product.thumbnail,
      image: product.image,
      brand: product.brand,
      category: product.category,
      brandName: getBrandBySlug(product.brand)?.name ?? product.brand,
      description: product.description,
      condition: product.condition,
      stock: product.stock,
      stockQty: product.stockQty,
      createdAt: product.createdAt,
    })
  );

  return (
    <main className="box-border min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-white p-4 text-neutral-900 sm:p-6">
      <PageHeading
        title="Aftermarket"
        subtitle="Used / Performance Marketplace — browse pre-owned and refurbished parts"
      />
      <AftermarketFeed products={products} />
    </main>
  );
}
