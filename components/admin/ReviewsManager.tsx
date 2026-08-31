"use client";

import { useMemo, useState } from "react";
import { adminUi } from "./admin-ui";
import {
  REVIEW_SOURCE_LABELS,
  type ProductReview,
  type ReviewModerationAction,
  type ReviewSource,
} from "@/lib/reviews/types";

/** Off-site origins an admin can transcribe from. "storefront" is excluded:
 *  that means the customer typed it themselves, which this form is not. */
const OFFSITE_SOURCES = (
  Object.keys(REVIEW_SOURCE_LABELS) as ReviewSource[]
).filter((source) => source !== "storefront");

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

type EntryForm = {
  productId: string;
  reviewerName: string;
  rating: string;
  review: string;
  source: ReviewSource;
  customerEmail: string;
  collectedAt: string;
};

const EMPTY_ENTRY: EntryForm = {
  productId: "",
  reviewerName: "",
  rating: "5",
  review: "",
  source: "whatsapp",
  customerEmail: "",
  collectedAt: "",
};

export default function ReviewsManager({
  initialReviews,
  productNames,
  catalog,
}: {
  initialReviews: ProductReview[];
  /** id -> name, resolved server-side; the catalog lives in the repo, not the DB. */
  productNames: Record<number, string>;
  /** Searchable product list for the transcription form. */
  catalog: { id: number; name: string }[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<Filter>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [entryOpen, setEntryOpen] = useState(false);
  const [entry, setEntry] = useState<EntryForm>(EMPTY_ENTRY);
  const [entrySaving, setEntrySaving] = useState(false);
  const [entryNote, setEntryNote] = useState<string | null>(null);

  async function saveEntry(event: React.FormEvent) {
    event.preventDefault();
    setEntrySaving(true);
    setEntryNote(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(entry.productId),
          reviewerName: entry.reviewerName,
          rating: Number(entry.rating),
          review: entry.review,
          source: entry.source,
          customerEmail: entry.customerEmail,
          collectedAt: entry.collectedAt || null,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "That review could not be saved.");
        return;
      }

      setReviews((prev) => [data.review as ProductReview, ...prev]);
      // Say plainly whether the badge attached and why, so nobody assumes it did.
      setEntryNote(data.verificationNote ?? "Saved.");
      setEntry({ ...EMPTY_ENTRY, source: entry.source });
      setFilter("pending");
    } catch {
      setError("Network error — nothing was saved.");
    } finally {
      setEntrySaving(false);
    }
  }

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

      {/* Transcribe a review a customer left off-site */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setEntryOpen((open) => !open)}
          className={adminUi.buttonSecondary}
        >
          {entryOpen ? "Close" : "Add a review from WhatsApp, Instagram or in person"}
        </button>

        {entryOpen ? (
          <form onSubmit={saveEntry} className={`mt-4 ${adminUi.card}`}>
            <p className="mb-4 text-sm leading-relaxed text-zinc-600">
              For reviews a real customer gave you somewhere other than the
              website. Type what they actually said — the source and your admin
              email are stored with it. The verified-purchase badge is looked up
              from your orders and cannot be set here.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-zinc-700">
                Product
                <select
                  required
                  value={entry.productId}
                  onChange={(e) => setEntry({ ...entry, productId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Choose a product…</option>
                  {catalog.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name.slice(0, 70)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-zinc-700">
                Where they said it
                <select
                  value={entry.source}
                  onChange={(e) =>
                    setEntry({ ...entry, source: e.target.value as ReviewSource })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                >
                  {OFFSITE_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {REVIEW_SOURCE_LABELS[source]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-zinc-700">
                Customer name
                <input
                  required
                  value={entry.reviewerName}
                  onChange={(e) => setEntry({ ...entry, reviewerName: e.target.value })}
                  placeholder="As they'd want it shown"
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="text-sm font-medium text-zinc-700">
                Rating
                <select
                  value={entry.rating}
                  onChange={(e) => setEntry({ ...entry, rating: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((star) => (
                    <option key={star} value={star}>
                      {star} star{star === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-zinc-700">
                Customer email <span className="font-normal text-zinc-500">(optional)</span>
                <input
                  type="email"
                  value={entry.customerEmail}
                  onChange={(e) => setEntry({ ...entry, customerEmail: e.target.value })}
                  placeholder="Only used to check for a completed order"
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="text-sm font-medium text-zinc-700">
                When they said it <span className="font-normal text-zinc-500">(optional)</span>
                <input
                  type="date"
                  value={entry.collectedAt}
                  onChange={(e) => setEntry({ ...entry, collectedAt: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium text-zinc-700">
              What they said
              <textarea
                required
                rows={4}
                value={entry.review}
                onChange={(e) => setEntry({ ...entry, review: e.target.value })}
                placeholder="Their words, as close to verbatim as you can"
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="submit" disabled={entrySaving} className={adminUi.buttonPrimary}>
                {entrySaving ? "Saving…" : "Save for moderation"}
              </button>
              {entryNote ? (
                <span className="text-sm text-zinc-600">{entryNote}</span>
              ) : null}
            </div>
          </form>
        ) : null}
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
                    {review.source && review.source !== "storefront" ? (
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800 ring-1 ring-sky-200">
                        via {REVIEW_SOURCE_LABELS[review.source]}
                      </span>
                    ) : null}
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
