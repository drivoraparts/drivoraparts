export const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
] as const;

export function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function isAuthDebugEnabled(): boolean {
  return (
    process.env.AUTH_DEBUG === "true" ||
    process.env.NODE_ENV !== "production"
  );
}
