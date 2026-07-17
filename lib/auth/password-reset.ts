import { getAdminEmail, invalidateAllAdminSessions, updateAdminPassword } from "./admin";
import { hashPasswordForStorage } from "./crypto";

type ResetRecord = {
  email: string;
  tokenHash: string;
  expiresAt: number;
};

const RESET_TTL_MS = 15 * 60 * 1000;
const resetTokens = new Map<string, ResetRecord>();

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [key, record] of resetTokens.entries()) {
    if (record.expiresAt <= now) {
      resetTokens.delete(key);
    }
  }
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createPasswordResetToken(email: string): Promise<{
  token: string;
  expiresAt: number;
} | null> {
  cleanupExpiredTokens();

  const normalizedEmail = email.trim().toLowerCase();
  const adminEmail = getAdminEmail();

  if (normalizedEmail !== adminEmail) {
    return null;
  }

  const token = randomToken();
  const tokenHash = await hashPasswordForStorage(token);

  resetTokens.set(tokenHash, {
    email: adminEmail,
    tokenHash,
    expiresAt: Date.now() + RESET_TTL_MS,
  });

  return { token, expiresAt: Date.now() + RESET_TTL_MS };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<boolean> {
  cleanupExpiredTokens();

  const tokenHash = await hashPasswordForStorage(token);
  const record = resetTokens.get(tokenHash);

  if (!record || record.expiresAt <= Date.now()) {
    return false;
  }

  resetTokens.delete(tokenHash);
  await updateAdminPassword(newPassword);
  invalidateAllAdminSessions();

  return true;
}

export function shouldExposeResetLink(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ADMIN_PASSWORD_RESET_EXPOSE_LINK === "true"
  );
}

export async function verifyResetToken(token: string): Promise<boolean> {
  cleanupExpiredTokens();
  const tokenHash = await hashPasswordForStorage(token);
  const record = resetTokens.get(tokenHash);
  return Boolean(record && record.expiresAt > Date.now());
}
