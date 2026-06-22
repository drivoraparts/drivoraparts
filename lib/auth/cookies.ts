import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "drivora_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

export function getSessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, getSessionCookieOptions());
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}

export function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, getSessionCookieOptions());
  return response;
}

export function clearSessionCookieOnResponse(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
