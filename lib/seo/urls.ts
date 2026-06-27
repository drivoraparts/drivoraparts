import { getSiteUrl } from "@/lib/env";
import { DEFAULT_OG_IMAGE } from "./constants";

export function absoluteUrl(path = ""): string {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  if (!path) return siteUrl;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function absoluteImageUrl(src?: string | null): string {
  const trimmed = src?.trim();
  if (!trimmed) return absoluteUrl(DEFAULT_OG_IMAGE);
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return absoluteUrl(trimmed);
}
