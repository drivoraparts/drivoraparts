const ADMIN_ONLY_PREFIXES = [
  "/api/orders",
  "/api/admin/assistant",
  "/api/admin/orders",
  "/api/admin/support",
];

const ADMIN_ONLY_EXACT = new Set([
  "/api/admin/logout",
  "/api/auth/logout",
]);

const PUBLIC_ADMIN_PATHS = new Set(["/api/admin/login"]);

export function isAdminProtectedApi(pathname: string, method: string): boolean {
  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return false;
  }

  if (pathname.startsWith("/api/admin/")) {
    return true;
  }

  if (ADMIN_ONLY_EXACT.has(pathname)) {
    return true;
  }

  if (pathname.startsWith("/api/orders")) {
    return true;
  }

  if (pathname.startsWith("/api/analytics") && method === "GET") {
    return true;
  }

  if (pathname.startsWith("/api/live-users") && method === "GET") {
    return true;
  }

  if (pathname.startsWith("/api/live/users") && method === "GET") {
    return true;
  }

  if (pathname.startsWith("/api/realtime/") && method === "GET") {
    return true;
  }

  if (pathname.startsWith("/api/stock") && method !== "GET") {
    return true;
  }

  for (const prefix of ADMIN_ONLY_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

export function isRateLimitedApi(pathname: string): boolean {
  return pathname.startsWith("/api/");
}
