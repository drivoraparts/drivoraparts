import ProductRail from "./ProductRail";
import { getAllProducts } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";

export default function RecentlyAddedRail({
  eyebrow = "Just Listed",
  title = "Fresh Inventory",
  tone,
}: {
  eyebrow?: string;
  title?: string;
  tone?: "light" | "muted";
}) {
  const products = getAllProducts().slice(0, 12);

  return (
    <ProductRail
      eyebrow={eyebrow}
      title={title}
      products={products}
      viewAllHref={routes.all}
      badge="New"
      tone={tone}
    />
  );
}
