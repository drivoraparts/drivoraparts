import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import ReviewsManager from "@/components/admin/ReviewsManager";
import { getReviewStoreSnapshot } from "@/lib/reviews";
import { getAllProducts } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getReviewStoreSnapshot();

  // Reviews store a catalog id, not a product row — the catalog lives in the
  // repository. Resolve names here so the manager can label each review without
  // shipping the whole catalog to the browser.
  const referenced = new Set(reviews.map((review) => review.productId));
  const productNames: Record<number, string> = {};
  for (const product of getAllProducts()) {
    if (referenced.has(product.id)) productNames[product.id] = product.name;
  }

  const pending = reviews.filter((r) => r.status === "pending").length;
  const approved = reviews.filter((r) => r.status === "approved").length;
  const hidden = reviews.filter((r) => r.status === "hidden").length;
  const verified = reviews.filter((r) => r.verifiedPurchase).length;

  return (
    <AdminShell title="Product Reviews">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Awaiting Review"
          value={String(pending)}
          hint={pending > 0 ? "Not visible to customers yet" : "Nothing to moderate"}
        />
        <StatCard label="Published" value={String(approved)} hint="Live on product pages" />
        <StatCard label="Hidden" value={String(hidden)} />
        <StatCard
          label="Verified Purchases"
          value={String(verified)}
          hint="Matched to a completed order"
        />
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-sm leading-relaxed text-zinc-700">
          Reviews submitted on a product page are held here and are{" "}
          <span className="font-semibold">not shown to customers</span> until you
          publish them. The verified-purchase badge is set automatically by
          matching the reviewer&apos;s email to a completed order — it cannot be
          applied by hand, and nothing here creates reviews.
        </p>
      </div>

      <div className="mt-8">
        <ReviewsManager initialReviews={reviews} productNames={productNames} />
      </div>
    </AdminShell>
  );
}
