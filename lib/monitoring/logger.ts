import { logActivity } from "./activity";
import { createStructuredLog, emitStructuredLog } from "@/lib/security/request-log";

export function logError(
  code: string,
  error: unknown,
  context: Record<string, unknown> = {}
): void {
  const message = error instanceof Error ? error.message : String(error);
  emitStructuredLog(
    createStructuredLog({
      level: "error",
      event: code,
      ip: String(context.ip ?? "system"),
      method: "SYSTEM",
      path: "internal",
      meta: { message, ...context },
    })
  );
  void logActivity("error", code, { message, ...context });
}

export function logInfo(
  code: string,
  context: Record<string, unknown> = {}
): void {
  emitStructuredLog(
    createStructuredLog({
      level: "info",
      event: code,
      ip: String(context.ip ?? "system"),
      method: "SYSTEM",
      path: "internal",
      meta: context,
    })
  );
  void logActivity("info", code, context);
}

export function logWarn(
  code: string,
  context: Record<string, unknown> = {}
): void {
  emitStructuredLog(
    createStructuredLog({
      level: "warn",
      event: code,
      ip: String(context.ip ?? "system"),
      method: "SYSTEM",
      path: "internal",
      meta: context,
    })
  );
  void logActivity("warn", code, context);
}
