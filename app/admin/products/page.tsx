import AdminShell from "@/components/admin/AdminShell";
import ProductsManager from "@/components/admin/ProductsManager";
import { getAnalyticsSummary } from "@/lib/analytics";
import { products } from "@/lib/inventory/products";

export const dynamic = "force-dynamic";
export default async function AdminProductsPage() {
  const summary = await getAnalyticsSummary();

  const viewMap = new Map(
    summary.topViewedProducts.map((item) => [item.productId, item.count])
  );
  const cartMap = new Map(
    summary.topCartProducts.map((item) => [item.productId, item.count])
  );

  return (
    <AdminShell title="Products">
      <ProductsManager initialProducts={products} viewMap={viewMap} cartMap={cartMap} />
    </AdminShell>
  );
}
