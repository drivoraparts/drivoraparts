"use client";

import { useState } from "react";
import {
  canSubmitReview,
  getReviewSession,
  submitReview,
  type ProductReview,
} from "@/lib/reviews";
import StarRating from "./StarRating";

type ReviewWriteFormProps = {
  productId: number;
  onSubmitted: (review: ProductReview) => void;
};

export default function ReviewWriteForm({
  productId,
  onSubmitted,
}: ReviewWriteFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const session = getReviewSession();
  const canSubmit = session ? canSubmitReview(session, productId) : false;

  const handleSubmit = () => {
    if (!session) {
      setMessage("Sign in with a verified email account to write a review.");
      return;
    }

    if (!canSubmit) {
      setMessage(
        "Only verified buyers with a completed purchase can submit a review."
      );
      return;
    }

    if (!reviewText.trim()) {
      setMessage("Please enter your review before submitting.");
      return;
    }

    setSubmitting(true);
    const result = submitReview({
      productId,
      rating,
      review: reviewText.trim(),
      context: session,
    });
    setSubmitting(false);

    if (result.ok === false) {
      setMessage(result.error);
      return;
    }

    setMessage("Review submitted successfully.");
    setReviewText("");
    setRating(5);
    setOpen(false);
    onSubmitted(result.review);
  };

  return (
    <div className="review-write">
      {!open ? (
        <button
          type="button"
          className="review-write-toggle"
          onClick={() => setOpen(true)}
        >
          Write a Review
        </button>
      ) : (
        <div className="review-write-panel">
          <p className="review-write-label">Your rating</p>
          <div className="review-write-stars">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              return (
                <button
                  key={value}
                  type="button"
                  className={`review-star-btn ${
                    value <= rating ? "active" : ""
                  }`}
                  aria-label={`Rate ${value} out of 5`}
                  onClick={() => setRating(value)}
                >
                  ★
                </button>
              );
            })}
          </div>
          <StarRating rating={rating} size="sm" showNumeric />

          <label className="review-write-label" htmlFor="review-text">
            Your review
          </label>
          <textarea
            id="review-text"
            className="review-write-input"
            rows={4}
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="Share details about your purchase experience..."
          />

          <div className="review-write-actions">
            <button
              type="button"
              className="review-write-submit"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              className="review-write-cancel"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && <p className="review-write-message">{message}</p>}
      {!session && (
        <p className="review-write-hint">
          Sign in with a verified email account and completed purchase to submit
          a review.
        </p>
      )}

      <style jsx>{`
        .review-write {
          margin-bottom: 14px;
          padding-bottom: 14px;
          border-bottom: 1px solid #d1d5db;
        }

        .review-write-toggle,
        .review-write-submit {
          padding: 10px 14px;
          border-radius: 6px;
          border: 2px solid #dc2626;
          background: #ffffff;
          color: #111827;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .review-write-toggle:hover,
        .review-write-submit:hover {
          background: #fef2f2;
        }

        .review-write-panel {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .review-write-label {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .review-write-stars {
          display: flex;
          gap: 6px;
        }

        .review-star-btn {
          width: 34px;
          height: 34px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #d1d5db;
          font-size: 18px;
          cursor: pointer;
        }

        .review-star-btn.active {
          color: #f59e0b;
          border-color: #fbbf24;
          background: #fffbeb;
        }

        .review-write-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #111827;
          font-size: 14px;
          line-height: 1.5;
          resize: vertical;
        }

        .review-write-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .review-write-cancel {
          padding: 10px 14px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          color: #374151;
          font-size: 14px;
          cursor: pointer;
        }

        .review-write-message {
          margin: 10px 0 0;
          font-size: 13px;
          color: #374151;
        }

        .review-write-hint {
          margin: 8px 0 0;
          font-size: 12px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
