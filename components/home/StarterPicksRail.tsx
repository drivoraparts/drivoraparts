import ProductRail from "@/components/catalog/ProductRail";
import { getStarterPickCount, getStarterPicks } from "@/lib/home/starter-picks";
import { routes } from "@/lib/inventory/routes";

/**
 * Sits high on the homepage, above the engine packages.
 *
 * A first-time visitor paying in crypto has no chargeback and no recourse, so
 * the shop window has to offer something worth risking on an unknown seller.
 * Leading with $5,900 engines asks for the largest possible commitment first.
 */
export default function StarterPicksRail() {
  const products = getStarterPicks(8);
  if (products.length === 0) return null;

  const count = getStarterPickCount();

  return (
    <ProductRail
      eyebrow="Everyday parts"
      title="Under $400, in stock now"
      description={`${count.toLocaleString()} listings you can order today — brakes, cooling, fuel, wheels and interior. Real photos, free worldwide shipping.`}
      products={products}
      viewAllHref={routes.all}
    />
  );
}
