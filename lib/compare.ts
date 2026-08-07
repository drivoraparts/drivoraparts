export type CompareProduct = {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  category: string;
  brand?: string;
};

export const COMPARE_MAX_ITEMS = 4;

const STORAGE_KEY = "drivora-compare";
export const COMPARE_CHANGE_EVENT = "drivora:compare-change";

function notifyChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COMPARE_CHANGE_EVENT));
}

export function readCompareList(): CompareProduct[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CompareProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCompareList(items: CompareProduct[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    notifyChange();
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function isComparing(productId: number): boolean {
  return readCompareList().some((item) => item.id === productId);
}

/** Returns { added, atLimit } — atLimit is true when the toggle was rejected. */
export function toggleCompare(
  product: CompareProduct
): { added: boolean; atLimit: boolean } {
  const current = readCompareList();
  const exists = current.some((item) => item.id === product.id);

  if (exists) {
    writeCompareList(current.filter((item) => item.id !== product.id));
    return { added: false, atLimit: false };
  }

  if (current.length >= COMPARE_MAX_ITEMS) {
    return { added: false, atLimit: true };
  }

  writeCompareList([...current, product]);
  return { added: true, atLimit: false };
}

export function removeFromCompare(productId: number): void {
  writeCompareList(readCompareList().filter((item) => item.id !== productId));
}

export function clearCompare(): void {
  writeCompareList([]);
}
