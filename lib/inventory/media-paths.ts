/**
 * Static product media live under /product-media — never /catalog.
 * App Router owns /catalog/*; a public/catalog folder breaks Cloudflare static routing.
 */
export const PRODUCT_MEDIA_ROOT = "/product-media";

export function productMediaPath(relativePath: string): string {
  const trimmed = relativePath.replace(/^\/+/, "");
  return `${PRODUCT_MEDIA_ROOT}/${trimmed}`;
}
