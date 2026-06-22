export async function safeQuery<T>(
  fn: () => Promise<T>,
  fallback: T,
  label?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (process.env.NODE_ENV !== "production" && label) {
      console.warn(`[safeQuery:${label}]`, error);
    }
    return fallback;
  }
}
