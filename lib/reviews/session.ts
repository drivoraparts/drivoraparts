import type { ReviewSubmissionContext } from "./types";

const SESSION_KEY = "drivora-review-session";

export function getReviewSession(): ReviewSubmissionContext | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ReviewSubmissionContext;
    if (!parsed.userId || !parsed.reviewerName) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function saveReviewSession(context: ReviewSubmissionContext): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(context));
}
