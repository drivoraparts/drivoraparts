type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, Bucket>;

const STORE_KEY = "__drivora_rate_limit_store__";

function getStore(): RateLimitStore {
  const g = globalThis as typeof globalThis & {
    [STORE_KEY]?: RateLimitStore;
  };

  if (!g[STORE_KEY]) {
    g[STORE_KEY] = new Map();
  }

  return g[STORE_KEY]!;
}

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  const store = getStore();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, limit, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, limit, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  store.set(key, bucket);

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

export function getRateLimitConfig(pathname: string): {
  limit: number;
  windowMs: number;
} {
  const windowMs = 60_000;

  if (pathname.startsWith("/api/checkout")) {
    return { limit: 10, windowMs };
  }

  if (
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/auth/login")
  ) {
    return { limit: 5, windowMs: 15 * 60_000 };
  }

  if (
    pathname.startsWith("/api/auth/forgot-password") ||
    pathname.startsWith("/api/auth/reset-password")
  ) {
    return { limit: 5, windowMs: 15 * 60_000 };
  }

  if (
    pathname.startsWith("/api/analytics") ||
    pathname.startsWith("/api/cart") ||
    pathname.startsWith("/api/stock") ||
    pathname.startsWith("/api/orders")
  ) {
    return { limit: 30, windowMs };
  }

  return { limit: 60, windowMs };
}

export function buildRateLimitKey(ip: string, pathname: string): string {
  return `${ip}:${pathname.split("?")[0]}`;
}
