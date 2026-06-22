import AdminShell from "@/components/admin/AdminShell";
import { getAnalyticsSummary } from "@/lib/analytics";
import { products } from "@/lib/inventory/products";

export const runtime = "edge";

export default function AdminProductsPage() {
  const summary = getAnalyticsSummary();

  const viewMap = new Map(
    summary.topViewedProducts.map((item) => [item.productId, item.count])
  );
  const cartMap = new Map(
    summary.topCartProducts.map((item) => [item.productId, item.count])
  );

  return (
    <AdminShell title="Products">
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/[0.06]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 text-gray-400">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Views</th>
              <th className="p-4">Cart Adds</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-white/5 last:border-0">
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4 text-gray-300">{product.category}</td>
                <td className="p-4">${product.price.toFixed(2)}</td>
                <td className="p-4">{viewMap.get(product.id) ?? 0}</td>
                <td className="p-4">{cartMap.get(product.id) ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
