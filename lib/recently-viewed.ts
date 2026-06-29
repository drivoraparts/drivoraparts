export type RecentlyViewedProduct = {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  thumbnail: string;
  category: string;
  brand?: string;
};

const STORAGE_KEY = "drivora-recently-viewed";
const MAX_ITEMS = 12;

export function readRecentlyViewed(): RecentlyViewedProduct[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentlyViewedProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeRecentlyViewed(items: RecentlyViewedProduct[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function pushRecentlyViewed(entry: RecentlyViewedProduct): RecentlyViewedProduct[] {
  const next = [
    entry,
    ...readRecentlyViewed().filter((item) => item.id !== entry.id),
  ].slice(0, MAX_ITEMS);

  writeRecentlyViewed(next);
  return next;
}
