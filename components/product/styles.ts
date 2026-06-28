import { getEnginePlatform } from "@/data/engine";

export const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderRadius: "10px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
};

export const productPageGrid: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "16px",
  width: "100%",
  boxSizing: "border-box",
  overflowX: "clip",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
  gap: "30px",
  alignItems: "start",
};

export function formatCategoryLabel(category: string): string {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPlatformLabel(platform?: string): string | null {
  if (!platform) return null;

  const found = getEnginePlatform(platform);
  if (found) return found.platform.name;

  return platform
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
