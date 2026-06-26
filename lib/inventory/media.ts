export const DEFAULT_PRODUCT_IMAGE = "/product-media/avatars/default.svg";

export function resolveProductImage(src?: string | null): string {
  const trimmed = src?.trim();
  return trimmed ? trimmed : DEFAULT_PRODUCT_IMAGE;
}

export function resolveProductGallery(
  thumbnail?: string | null,
  images?: string[] | null
): string[] {
  const list = (images ?? []).map((src) => src?.trim()).filter(Boolean) as string[];
  if (list.length > 0) {
    return list;
  }

  return [resolveProductImage(thumbnail)];
}
