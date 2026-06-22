import { getAuthSecret } from "@/lib/env";
import { signPayload, verifySignature } from "./crypto";

export const ADMIN_SESSION_COOKIE = "drivora_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

export type AdminSession = {
  email: string;
  exp: number;
};

function encodeSession(session: AdminSession): string {
  return btoa(JSON.stringify(session));
}

function decodeSession(raw: string): AdminSession | null {
  try {
    const parsed = JSON.parse(atob(raw)) as AdminSession;
    if (!parsed.email || !parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function createAdminSessionToken(email: string): Promise<string> {
  const session: AdminSession = {
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const payload = encodeSession(session);
  const signature = await signPayload(payload, getAuthSecret());
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<AdminSession | null> {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const valid = await verifySignature(payload, signature, getAuthSecret());
  if (!valid) return null;

  const session = decodeSession(payload);
  if (!session) return null;

  if (session.exp < Math.floor(Date.now() / 1000)) return null;

  return session;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
