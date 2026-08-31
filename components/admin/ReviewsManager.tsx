"use client";

import { useMemo, useState } from "react";
import { adminUi } from "./admin-ui";
import type { ProductReview, ReviewModerationAction } from "@/lib/reviews/types";

type Filter = "pending" | "approved" | "hidden" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "pending", label: "Awaiting review" },
  { key: "approved", label: "Published" },
  { key: "hidden", label: "Hidden" },
  { key: "all", label: "All" },
];

const STATUS_STYLE: Record<ProductReview["status"], string> = {
  pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  hidden: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5`} className="text-amber-500">
      {"★".repeat(rating)}
      <span className="text-zinc-300">{"★".repeat(Math.max(0, 5 - rating))}</span>
    </span>
  );
}

export default function ReviewsManager({
  initialReviews,
  productNames,
}: {
  initialReviews: ProductReview[];
  /** id -> name, resolved server-side; the catalog lives in the repo, not the DB. */
  productNames: Record<number, string>;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<Filter>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const counts = useMemo(
    () => ({
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      hidden: reviews.filter((r) => r.status === "hidden").length,
      all: reviews.length,
    }),
    [reviews]
  );

  const products = useMemo(() => {
    const seen = new Map<number, string>();
    for (const review of reviews) {
      if (!seen.has(review.productId)) {
        seen.set(
          review.productId,
          productNames[review.productId] ?? `Product ${review.productId}`
        );
      }
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [reviews, productNames]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return reviews.filter((review) => {
      if (filter !== "all" && review.status !== filter) return false;
      if (productFilter && review.productId !== Number(productFilter)) return false;
      if (ratingFilter && review.rating !== Number(ratingFilter)) return false;

      if (needle) {
        const haystack = [
          review.review,
          review.reviewerName,
          productNames[review.productId] ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }

      return true;
    });
  }, [reviews, filter, search, productFilter, ratingFilter, productNames]);

  async function moderate(reviewId: string, action: ReviewModerationAction) {
    if (action === "delete" && !confirm("Delete this review permanently?")) return;

    setBusyId(reviewId);
    setError(null);

    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "That change could not be saved.");
        return;
      }

      // Reflect the server's answer rather than assuming success, so a row can
      // never show as published when the write did not land.
      setReviews((prev) =>
        action === "delete"
          ? prev.filter((r) => r.id !== reviewId)
          : prev.map((r) => (r.id === reviewId ? (data.review as ProductReview) : r))
      );
    } catch {
      setError("Network error — nothing was changed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              filter === tab.key
                ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs text-zinc-500">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search text, reviewer or product…"
          aria-label="Search reviews"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
        />
        <select
          value={productFilter}
          onChange={(event) => setProductFilter(event.target.value)}
          aria-label="Filter by product"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
        >
          <option value="">All products</option>
          {products.map(([id, name]) => (
            <option key={id} value={id}>
              {name.slice(0, 60)}
            </option>
          ))}
        </select>
        <select
          value={ratingFilter}
          onChange={(event) => setRatingFilter(event.target.value)}
          aria-label="Filter by rating"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
        >
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((star) => (
            <option key={star} value={star}>
              {star} star{star === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>

      {error ? <div className={`mb-4 ${adminUi.errorBox}`}>{error}</div> : null}

      {visible.length === 0 ? (
        <div className={adminUi.card}>
          <p className="py-6 text-center text-sm text-zinc-500">
            {filter === "pending"
              ? "Nothing waiting for moderation."
              : filter === "all"
                ? "No reviews have been submitted yet. Reviews written on a product page appear here for approval before they go live."
                : `No ${filter} reviews.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((review) => (
            <article key={review.id} className={adminUi.card}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-zinc-900">
                      {review.reviewerName}
                    </span>
                    <Stars rating={review.rating} />
                    {review.verifiedPurchase ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
                        Verified purchase
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[review.status]}`}
                    >
                      {review.status === "pending" ? "awaiting review" : review.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    <a
                      href={`/product/${review.productId}`}
                      className="hover:text-red-700 hover:underline"
                    >
                      {productNames[review.productId] ?? `Product ${review.productId}`}
                    </a>
                    {" · "}
                    {new Date(review.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {review.status !== "approved" ? (
                    <button
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => moderate(review.id, "approve")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                    >
                      Publish
                    </button>
                  ) : null}
                  {review.status !== "hidden" ? (
                    <button
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => moderate(review.id, "hide")}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 disabled:opacity-60"
                    >
                      Hide
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => moderate(review.id, "delete")}
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {review.review}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
