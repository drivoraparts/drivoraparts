export const catalogProductAnchorId = (productId: number) =>
  `catalog-product-${productId}`;

export type ListScrollState = {
  scrollY: number;
  productId: number;
  returnPath: string;
  listKey: string;
  page?: number;
  query?: string;
  categoryFilter?: string;
  brandFilter?: string;
  priceFilter?: string;
};

export const LIST_SCROLL_KEYS = {
  catalogAll: "catalog-all",
  homeFeatured: "home-featured",
  category: (slug: string) => `category:${slug}`,
  brand: (categorySlug: string, brandSlug: string) =>
    `brand:${categorySlug}:${brandSlug}`,
  enginePlatform: (platformSlug: string) => `engine:${platformSlug}`,
} as const;

export const PENDING_LIST_SCROLL_KEY = "drivora:pending-list-scroll";

export function listScrollStorageKey(listKey: string) {
  return `drivora:list-scroll:${listKey}`;
}

export function currentReturnPath() {
  if (typeof window === "undefined") return "";
  const { pathname, search } = window.location;
  return `${pathname}${search}`;
}

export function saveListScrollState(listKey: string, state: ListScrollState) {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify(state);
    sessionStorage.setItem(listScrollStorageKey(listKey), payload);
    sessionStorage.setItem(PENDING_LIST_SCROLL_KEY, payload);
  } catch {
    /* ignore quota / private mode */
  }
}

export function readListScrollState(listKey: string): ListScrollState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(listScrollStorageKey(listKey));
    if (!raw) return null;
    return JSON.parse(raw) as ListScrollState;
  } catch {
    return null;
  }
}

export function readPendingListScrollState(): ListScrollState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_LIST_SCROLL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ListScrollState;
  } catch {
    return null;
  }
}

export function clearListScrollState(listKey: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(listScrollStorageKey(listKey));
    const pending = readPendingListScrollState();
    if (pending?.listKey === listKey) {
      sessionStorage.removeItem(PENDING_LIST_SCROLL_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function clearPendingListScrollState() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_LIST_SCROLL_KEY);
  } catch {
    /* ignore */
  }
}

export function restoreListScroll(state: Pick<ListScrollState, "scrollY" | "productId">) {
  const target = document.getElementById(catalogProductAnchorId(state.productId));
  if (target) {
    target.scrollIntoView({ block: "center" });
    return;
  }
  window.scrollTo({ top: state.scrollY, behavior: "auto" });
}

export function restoreListScrollWithRetry(
  state: Pick<ListScrollState, "scrollY" | "productId">,
  attempts = 6
) {
  let remaining = attempts;
  const run = () => {
    restoreListScroll(state);
    remaining -= 1;
    if (remaining > 0) {
      window.setTimeout(run, 80);
    }
  };
  run();
}

export function saveListScrollOnProductClick(
  listKey: string,
  productId: number,
  extra?: Omit<ListScrollState, "scrollY" | "productId" | "returnPath" | "listKey">
) {
  saveListScrollState(listKey, {
    scrollY: window.scrollY,
    productId,
    returnPath: currentReturnPath(),
    listKey,
    ...extra,
  });
}

export function shouldRestoreListScrollOnPath(pathname: string, search: string) {
  const pending = readPendingListScrollState();
  if (!pending) return null;
  const currentPath = `${pathname}${search ? `?${search}` : ""}`;
  if (pending.returnPath !== currentPath) return null;
  return pending;
}

export function isCatalogAllPaginatedRestore(pending: ListScrollState) {
  return (
    pending.listKey === LIST_SCROLL_KEYS.catalogAll &&
    pending.page != null &&
    pending.page > 1
  );
}
