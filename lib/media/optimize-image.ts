export type ImageProfile = "grid" | "card" | "detail" | "hero";

const PROFILES: Record<ImageProfile, { width: number; quality: number }> = {
  grid: { width: 360, quality: 78 },
  card: { width: 520, quality: 80 },
  detail: { width: 960, quality: 82 },
  hero: { width: 1600, quality: 85 },
};

export const IMAGE_SIZES: Record<ImageProfile, string> = {
  grid: "(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 220px",
  card: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px",
  detail: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 520px",
  hero: "100vw",
};

function shouldOptimize(path: string): boolean {
  if (!path || path.startsWith("data:") || path.startsWith("http")) return false;
  if (path.endsWith(".svg")) return false;
  return true;
}

/** Cloudflare Image Resizing in production; original asset locally and as fallback. */
export function optimizeImageUrl(
  src: string,
  profile: ImageProfile = "card"
): string {
  const path = src.startsWith("/") ? src : `/${src}`;
  if (!shouldOptimize(path)) return src;

  const enabled = process.env.NEXT_PUBLIC_CF_IMAGE_OPTIMIZATION !== "false";
  if (process.env.NODE_ENV !== "production" || !enabled) {
    return path;
  }

  const { width, quality } = PROFILES[profile];
  return `/cdn-cgi/image/width=${width},quality=${quality},format=auto,fit=cover${path}`;
}
