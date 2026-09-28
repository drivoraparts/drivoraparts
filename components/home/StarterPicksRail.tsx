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
      title="Under $400"
      /*
       * The count is getStarterPickCount(): listings priced $40-$400, flagged
       * in stock, carrying a hosted photograph, with trivial hardware and
       * merch excluded. It said "listings you can order today", which reads
       * as a dispatch guarantee -- nothing here checks a shelf, only a
       * boolean. The line now describes the filter it actually ran.
       */
      description={`${count.toLocaleString()} photographed listings between $40 and $400 — brakes, cooling, fuel, wheels and interior.`}
      products={products}
      viewAllHref={routes.all}
    />
  );
}
