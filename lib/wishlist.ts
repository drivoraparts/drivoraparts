export type WishlistProduct = {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  thumbnail: string;
  category: string;
  brand?: string;
};

const STORAGE_KEY = "drivora-wishlist";
export const WISHLIST_CHANGE_EVENT = "drivora:wishlist-change";

function notifyChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
}

export function readWishlist(): WishlistProduct[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(items: WishlistProduct[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    notifyChange();
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function isWishlisted(productId: number): boolean {
  return readWishlist().some((item) => item.id === productId);
}

export function toggleWishlist(product: WishlistProduct): boolean {
  const current = readWishlist();
  const exists = current.some((item) => item.id === product.id);

  const next = exists
    ? current.filter((item) => item.id !== product.id)
    : [product, ...current];

  writeWishlist(next);
  return !exists;
}

export function removeFromWishlist(productId: number): void {
  writeWishlist(readWishlist().filter((item) => item.id !== productId));
}
