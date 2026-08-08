/**
 * Recovers the customer-info form after the customer leaves for NOWPayments
 * and comes back without completing payment (browser back, cancelled
 * payment, etc). Session-scoped only -- cleared once payment is confirmed
 * paid (see SuccessStatus.tsx) or the tab/session ends.
 */

const STORAGE_KEY = "drivora-checkout-form";

export type CheckoutFormDraft = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
};

export function readCheckoutFormDraft(): CheckoutFormDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      fullName: typeof parsed.fullName === "string" ? parsed.fullName : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      address: typeof parsed.address === "string" ? parsed.address : "",
      city: typeof parsed.city === "string" ? parsed.city : "",
      zip: typeof parsed.zip === "string" ? parsed.zip : "",
    };
  } catch {
    return null;
  }
}

export function writeCheckoutFormDraft(draft: CheckoutFormDraft) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // storage unavailable (private browsing, quota, etc) -- non-fatal
  }
}

export function clearCheckoutFormDraft() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
