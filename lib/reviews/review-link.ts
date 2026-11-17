import { signPayload, verifySignature } from "@/lib/auth/crypto";
import { ensureAdminInitialized } from "@/lib/auth/init-admin";

/* =========================================================
   REVIEW LINKS
   ---------------------------------------------------------
   A review link is the only way a review earns Verified
   Buyer. It is emailed to the address on the order, so
   holding one shows the reviewer receives that customer's
   mail -- not merely that they know the address, which is
   what the old email-match check proved.

   Token: base64url(JSON {v, r, x}) "." HMAC-SHA256 signature
     r  review_requests.id -- the only identifier carried;
        order, item and product are read from the database
     x  expiry, seconds since epoch

   Keyed by AUTH_SECRET with its own label, so a review link
   can never be replayed as an admin session or vice versa.
   Single use is enforced in the database (review_requests.
   used_at and a unique order_item_id on product_reviews),
   not by the token.
========================================================= */

const LINK_LABEL = "drivora:review-link:v1";
const EMAIL_LABEL = "drivora:review-email:v1";

export const REVIEW_LINK_TTL_DAYS = 180;

function secret(label: string): string {
  return `${ensureAdminInitialized().authSecret}|${label}`;
}

function encode(value: string): string {
  // The payload is ASCII (a UUID and numbers), so plain btoa is safe.
  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decode(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

export async function createReviewToken(requestId: string, expiresAt: Date): Promise<string> {
  const payload = encode(
    JSON.stringify({ v: 1, r: requestId, x: Math.floor(expiresAt.getTime() / 1000) })
  );
  return `${payload}.${await signPayload(payload, secret(LINK_LABEL))}`;
}

export type ReviewTokenCheck =
  | { ok: true; requestId: string }
  | { ok: false; reason: "invalid" | "expired" };

export async function readReviewToken(
  token: string | null | undefined,
  options: { allowExpired?: boolean } = {}
): Promise<ReviewTokenCheck> {
  if (!token || token.length > 400) return { ok: false, reason: "invalid" };
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return { ok: false, reason: "invalid" };

  try {
    if (!(await verifySignature(payload, signature, secret(LINK_LABEL)))) {
      return { ok: false, reason: "invalid" };
    }
    const data = JSON.parse(decode(payload)) as { v?: number; r?: unknown; x?: unknown };
    if (data.v !== 1 || typeof data.r !== "string" || typeof data.x !== "number") {
      return { ok: false, reason: "invalid" };
    }
    if (!options.allowExpired && data.x * 1000 < Date.now()) return { ok: false, reason: "expired" };
    return { ok: true, requestId: data.r };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

/** Keyed hash of an email, so opt-outs and request matching store no address. */
export async function reviewEmailHash(email: string): Promise<string> {
  return signPayload(email.trim().toLowerCase(), secret(EMAIL_LABEL));
}
