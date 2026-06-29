import { resolveProductImage } from "@/lib/inventory/media";
import {
  encodeAssetPath,
  IMAGE_SIZES,
  optimizeImageUrl,
  type ImageProfile,
} from "@/lib/media/optimize-image";

type OptimizedImageProps = {
  src: string;
  alt: string;
  profile?: ImageProfile;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
};

/** Server-safe image tag with Cloudflare resize URLs (no client hydration delay). */
export default function OptimizedImage({
  src,
  alt,
  profile = "card",
  className,
  loading = "lazy",
  fetchPriority,
  sizes,
}: OptimizedImageProps) {
  const original = encodeAssetPath(resolveProductImage(src));
  const optimized = optimizeImageUrl(original, profile);

  return (
    <img
      src={optimized}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={sizes ?? IMAGE_SIZES[profile]}
      className={className}
    />
  );
}
