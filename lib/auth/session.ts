import { signAdminJwt, verifyAdminJwt } from "./jwt";
import { authDebug } from "./debug";
import { getAdminTokenVersion } from "./token-version";
import {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  getSessionCookieOptions,
} from "./cookie-options";

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
  token: string | undefined | null,
  scope = "session"
): Promise<AdminSession | null> {
  if (!token) {
    authDebug(scope, "no session cookie present");
    return null;
  }

  const payload = await verifyAdminJwt(token);
  if (!payload) {
    authDebug(scope, "JWT verification failed");
    return null;
  }

  const currentTokenVersion = getAdminTokenVersion();
  if (payload.ver !== currentTokenVersion) {
    authDebug(scope, "JWT token version mismatch", {
      email: payload.email,
      tokenVersion: payload.ver,
      currentTokenVersion,
    });
    return null;
  }

  authDebug(scope, "JWT verified", {
    email: payload.email,
    exp: payload.exp,
    ver: payload.ver,
  });

  return {
    email: payload.email,
    exp: payload.exp,
  };
}
