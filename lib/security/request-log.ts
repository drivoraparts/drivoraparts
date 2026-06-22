export type StructuredLogEntry = {
  ts: string;
  level: "info" | "warn" | "error";
  event: string;
  ip: string;
  method: string;
  path: string;
  status?: number;
  meta?: Record<string, unknown>;
};

export function createStructuredLog(
  entry: Omit<StructuredLogEntry, "ts">
): StructuredLogEntry {
  return {
    ts: new Date().toISOString(),
    ...entry,
  };
}

export function emitStructuredLog(entry: StructuredLogEntry): void {
  const line = JSON.stringify(entry);
  if (entry.level === "error") {
    console.error(line);
    return;
  }
  if (entry.level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export function logApiRequest(input: {
  ip: string;
  method: string;
  path: string;
  status: number;
  meta?: Record<string, unknown>;
}): void {
  emitStructuredLog(
    createStructuredLog({
      level: input.status >= 400 ? "warn" : "info",
      event: "api.request",
      ip: input.ip,
      method: input.method,
      path: input.path,
      status: input.status,
      meta: input.meta,
    })
  );
}
