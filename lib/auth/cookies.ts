import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getSessionCookieOptions,
} from "./cookie-options";

export { ADMIN_SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, getSessionCookieOptions } from "./cookie-options";

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
