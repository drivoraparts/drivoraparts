import { isAuthDebugEnabled } from "./public-routes";

export function authDebug(scope: string, message: string, meta?: Record<string, unknown>) {
  if (!isAuthDebugEnabled()) return;
  console.log(`[auth:${scope}] ${message}`, meta ?? {});
}
