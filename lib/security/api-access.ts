const ADMIN_ONLY_PREFIXES = [
  "/api/orders",
  "/api/admin/assistant",
  "/api/admin/orders",
  "/api/admin/support",
];

const PUBLIC_ADMIN_APIS = new Set([
  "/api/admin/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/admin/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
]);

export function isAdminProtectedApi(pathname: string, method: string): boolean {
  if (PUBLIC_ADMIN_APIS.has(pathname)) {
    return false;
  }

  if (pathname.startsWith("/api/admin/")) {
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
