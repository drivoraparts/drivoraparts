import ProductRail from "./ProductRail";
import { getAllProducts } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";

export default function RecentlyAddedRail() {
  const products = getAllProducts().slice(0, 12);

  return (
    <ProductRail
      eyebrow="Just Listed"
      title="Recently Added"
      products={products}
      viewAllHref={routes.all}
      badge="New"
    />
  );
}
