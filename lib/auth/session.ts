import { signAdminJwt, verifyAdminJwt } from "./jwt";
import { getAdminTokenVersion } from "./admin";
import {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  getSessionCookieOptions,
} from "./cookies";

export {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  getSessionCookieOptions,
};

export type AdminSession = {
  email: string;
  exp: number;
};

export async function createAdminSessionToken(email: string): Promise<string> {
  return signAdminJwt({
    email: email.trim().toLowerCase(),
    ver: getAdminTokenVersion(),
    expiresInSeconds: SESSION_MAX_AGE_SECONDS,
  });
}

export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<AdminSession | null> {
  if (!token) return null;

  const payload = await verifyAdminJwt(token);
  if (!payload) return null;

  if (payload.ver !== getAdminTokenVersion()) {
    return null;
  }

  return {
    email: payload.email,
    exp: payload.exp,
  };
}
