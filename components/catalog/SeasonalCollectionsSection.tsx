import ProductRail from "./ProductRail";
import { getEditorialCollections } from "@/lib/catalog/collections";

export default function SeasonalCollectionsSection() {
  const collections = getEditorialCollections();

  return (
    <>
      {collections.map((collection, index) => (
        <ProductRail
          key={collection.slug}
          eyebrow="Editorial Collection"
          title={collection.title}
          description={collection.blurb}
          products={collection.products}
          viewAllHref={collection.href}
          tone={index % 2 === 0 ? "light" : "muted"}
        />
      ))}
    </>
  );
}
