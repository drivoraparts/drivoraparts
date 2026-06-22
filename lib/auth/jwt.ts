import { ensureAdminInitialized } from "./init-admin";

type JwtHeader = {
  alg: "HS256";
  typ: "JWT";
};

export type AdminJwtPayload = {
  email: string;
  exp: number;
  iat: number;
  ver: number;
};

const encoder = new TextEncoder();

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

async function hmacSha256(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function signAdminJwt(
  payload: Omit<AdminJwtPayload, "iat" | "exp"> & { expiresInSeconds?: number }
): Promise<string> {
  const { authSecret } = ensureAdminInitialized();
  const header: JwtHeader = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = payload.expiresInSeconds ?? 60 * 60 * 24;

  const body: AdminJwtPayload = {
    email: payload.email,
    ver: payload.ver,
    iat: now,
    exp: now + expiresIn,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(body));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = await hmacSha256(signingInput, authSecret);

  return `${signingInput}.${signature}`;
}

export async function verifyAdminJwt(token: string): Promise<AdminJwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const { authSecret } = ensureAdminInitialized();

  try {
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expected = await hmacSha256(signingInput, authSecret);

    if (expected.length !== signature.length) return null;

    let valid = 0;
    for (let i = 0; i < expected.length; i += 1) {
      valid |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    if (valid !== 0) return null;

    const header = JSON.parse(fromBase64Url(encodedHeader)) as JwtHeader;
    if (header.alg !== "HS256") return null;

    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AdminJwtPayload;
    if (!payload.email || !payload.exp || payload.ver === undefined) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
