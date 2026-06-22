type AbuseEntry = {
  count: number;
  firstSeen: number;
  lastSeen: number;
};

type AbuseStore = Map<string, AbuseEntry>;

const STORE_KEY = "__drivora_abuse_store__";

function getStore(): AbuseStore {
  const g = globalThis as typeof globalThis & {
    [STORE_KEY]?: AbuseStore;
  };

  if (!g[STORE_KEY]) {
    g[STORE_KEY] = new Map();
  }

  return g[STORE_KEY]!;
}

function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

export function buildRequestFingerprint(
  ip: string,
  pathname: string,
  method: string,
  bodyHint = ""
): string {
  return hashString(`${ip}:${method}:${pathname}:${bodyHint}`);
}

export function checkAbuse(
  fingerprint: string,
  options: {
    windowMs?: number;
    maxHits?: number;
    minIntervalMs?: number;
  } = {}
): { blocked: boolean; reason?: string } {
  const windowMs = options.windowMs ?? 10_000;
  const maxHits = options.maxHits ?? 3;
  const minIntervalMs = options.minIntervalMs ?? 1_500;
  const now = Date.now();
  const store = getStore();
  const existing = store.get(fingerprint);

  if (!existing || now - existing.firstSeen > windowMs) {
    store.set(fingerprint, { count: 1, firstSeen: now, lastSeen: now });
    return { blocked: false };
  }

  if (now - existing.lastSeen < minIntervalMs) {
    return { blocked: true, reason: "rapid_repeat" };
  }

  existing.count += 1;
  existing.lastSeen = now;
  store.set(fingerprint, existing);

  if (existing.count > maxHits) {
    return { blocked: true, reason: "abuse_threshold" };
  }

  return { blocked: false };
}

export function getAbuseRules(pathname: string): {
  enabled: boolean;
  maxHits: number;
  windowMs: number;
  minIntervalMs: number;
} {
  if (pathname.startsWith("/api/checkout")) {
    return {
      enabled: true,
      maxHits: 3,
      windowMs: 60_000,
      minIntervalMs: 2_000,
    };
  }

  if (pathname.startsWith("/api/analytics")) {
    return {
      enabled: true,
      maxHits: 120,
      windowMs: 60_000,
      minIntervalMs: 100,
    };
  }

  if (
    pathname.startsWith("/api/cart") ||
    pathname.startsWith("/api/stock")
  ) {
    return {
      enabled: true,
      maxHits: 40,
      windowMs: 60_000,
      minIntervalMs: 250,
    };
  }

  return {
    enabled: false,
    maxHits: 0,
    windowMs: 0,
    minIntervalMs: 0,
  };
}
