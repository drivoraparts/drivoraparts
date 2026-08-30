"use client";

/* =========================================================
   DRIVORAPARTS — SEARCH ANALYTICS (CLIENT)
   ---------------------------------------------------------
   Observation only. Nothing here participates in ranking,
   filtering or ordering -- it reads what the search already
   returned and reports it afterwards.

   Every call is fire-and-forget through the existing
   /api/analytics endpoint (see lib/analytics/client.ts),
   which already swallows failures. If analytics is down,
   search is unaffected.
========================================================= */

import { trackEvent } from "./client";
import { getSafeSessionStorage } from "@/lib/storage/safe-storage";

/**
 * The same anonymous session key the live-users tracker already uses, so a
 * search and a page view from one visit share an identifier. Deliberately
 * sessionStorage: a "session" is one visit, which is what unique-session
 * counts should mean, and it disappears when the tab closes.
 */
const SESSION_KEY = "drivora-live-session";
const ATTRIBUTION_KEY = "drivora-search-attribution";

let memorySessionId = "";

export function getSearchSessionId(): string {
  if (typeof window === "undefined") return "";

  const storage = getSafeSessionStorage();
  let sessionId = storage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    try {
      storage.setItem(SESSION_KEY, sessionId);
    } catch {
      memorySessionId = sessionId;
    }
  }

  return sessionId || memorySessionId;
}

/**
 * Coarse device class only. The full user-agent identifies a visitor far more
 * precisely than a parts shop needs, so it is never stored -- three buckets
 * answer "is mobile search working" without describing anyone.
 */
function deviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
}

export type SearchAttribution = {
  searchId: string;
  query: string;
  productId: number;
  position: number;
};

/**
 * Remembers which search sent the visitor to a product, so an add-to-cart on
 * the product page can be attributed back to it. Survives the navigation from
 * results to product page; overwritten by the next click.
 */
function rememberAttribution(attribution: SearchAttribution): void {
  try {
    getSafeSessionStorage().setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // Attribution is a nice-to-have; never let storage failure surface.
  }
}

/** Returns the stored attribution only when it matches the product in hand. */
export function readSearchAttribution(
  productId: number
): SearchAttribution | null {
  try {
    const raw = getSafeSessionStorage().getItem(ATTRIBUTION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SearchAttribution;
    if (!parsed || parsed.productId !== productId) return null;
    if (typeof parsed.searchId !== "string" || !parsed.searchId) return null;

    return parsed;
  } catch {
    return null;
  }
}

export type RecordSearchInput = {
  query: string;
  normalizedQuery: string;
  correctedQuery: string | null;
  resultCount: number;
  topProductId: number | null;
  topProductName: string | null;
  /** Server-side search duration, reported by the catalog API. */
  tookMs: number | null;
};

/**
 * Records one settled search. Returns the search id so result clicks in the
 * same result set can be tied back to it.
 */
export function recordSearch(input: RecordSearchInput): string {
  const searchId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  trackEvent("search", {
    searchId,
    sessionId: getSearchSessionId(),
    query: input.query,
    normalizedQuery: input.normalizedQuery,
    correctedQuery: input.correctedQuery,
    resultCount: input.resultCount,
    zeroResults: input.resultCount === 0,
    topProductId: input.topProductId,
    topProductName: input.topProductName,
    tookMs: input.tookMs,
    device: deviceType(),
  });

  return searchId;
}

/** Records a click on a search result, and remembers it for cart attribution. */
export function recordSearchResultClick(input: {
  searchId: string;
  query: string;
  normalizedQuery: string;
  productId: number;
  productName: string;
  /** 1-based rank in the result list, so average clicked position is readable. */
  position: number;
}): void {
  rememberAttribution({
    searchId: input.searchId,
    query: input.query,
    productId: input.productId,
    position: input.position,
  });

  trackEvent("search_result_click", {
    searchId: input.searchId,
    sessionId: getSearchSessionId(),
    query: input.query,
    normalizedQuery: input.normalizedQuery,
    productId: input.productId,
    productName: input.productName,
    position: input.position,
    fromSearch: true,
  });
}
