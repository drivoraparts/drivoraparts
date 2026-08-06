export type ImageProfile = "grid" | "card" | "section" | "detail" | "hero";

const PROFILES: Record<ImageProfile, { width: number; quality: number }> = {
  grid: { width: 360, quality: 78 },
  card: { width: 520, quality: 80 },
  section: { width: 720, quality: 78 },
  detail: { width: 960, quality: 82 },
  hero: { width: 1280, quality: 82 },
};

export const IMAGE_SIZES: Record<ImageProfile, string> = {
  grid: "(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 220px",
  card: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px",
  section: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px",
  detail: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 520px",
  hero: "100vw",
};

const REMOTE_PROXY_HOSTS = ["edmundstruckparts.com"];

function shouldOptimize(path: string): boolean {
  if (!path || path.startsWith("data:") || path.startsWith("http")) return false;
  if (path.endsWith(".svg")) return false;
  return true;
}

export function isProxiedRemoteUrl(src: string): boolean {
  if (!src.startsWith("http://") && !src.startsWith("https://")) return false;
  try {
    const { hostname } = new URL(src);
    return REMOTE_PROXY_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

/** Same-origin proxy for hotlinked vendor images blocked on some networks. */
export function remoteImageProxyUrl(src: string): string {
  return `/api/media/remote?u=${encodeURIComponent(src)}`;
}

/** Encode spaces and special chars so mobile Safari + Cloudflare image URLs resolve reliably. */
export function encodeAssetPath(path: string): string {
  if (!path.startsWith("/")) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  return path
    .split("/")
    .map((segment) => (segment ? encodeURIComponent(segment) : ""))
    .join("/");
}

/** Plain static asset URL (no Cloudflare /cdn-cgi/image wrapper). */
export function directAssetUrl(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const rawPath = src.startsWith("/") ? src : `/${src}`;
  return encodeAssetPath(rawPath);
}

/** Same-origin static assets; Edmunds hotlinks go through /api/media/remote. */
export function optimizeImageUrl(
  src: string,
  _profile: ImageProfile = "card"
): string {
  if (isProxiedRemoteUrl(src)) {
    return remoteImageProxyUrl(src);
  }

  const rawPath = src.startsWith("/") ? src : `/${src}`;
  if (!shouldOptimize(rawPath)) return src;

  return encodeAssetPath(rawPath);
}

/**
 * Next URL to try when the current product image fails to load.
 *
 * `tried` must contain every URL already attempted (including the current
 * one) so this always converges on `null` in a bounded number of steps —
 * comparing only against a single `currentSrc` let this cycle between two
 * candidates forever (proxy fails -> raw -> proxy fails -> raw -> ...).
 */
export function nextImageFallback(
  resolved: string,
  tried: ReadonlySet<string>,
  _profile: ImageProfile = "card"
): string | null {
  const candidates = isProxiedRemoteUrl(resolved)
    ? [remoteImageProxyUrl(resolved), resolved]
    : [encodeAssetPath(resolved.startsWith("/") ? resolved : `/${resolved}`)];

  return candidates.find((candidate) => !tried.has(candidate)) ?? null;
}
