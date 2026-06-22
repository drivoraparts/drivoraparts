export const ADMIN_SESSION_COOKIE = "drivora_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

function shouldUseSecureCookies(): boolean {
  if (process.env.NODE_ENV !== "production") return false;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (siteUrl.startsWith("http://")) return false;

  return true;
}

export function getSessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
