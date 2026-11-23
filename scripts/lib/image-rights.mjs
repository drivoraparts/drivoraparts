/**
 * Image-rights registry (owner instruction 2026-11-23).
 *
 * Only a photograph whose commercial-use permission is verified may be
 * published. lib/inventory/data/image-rights-registry.json records, for every
 * image of every listing that would otherwise be public, who owns it, where it
 * came from and its permission status, with the evidence.
 *
 *   VERIFIED_LICENSED     a published licence covers commercial ecommerce use
 *   VERIFIED_AUTHORIZED   the rights holder authorized DrivoraParts in writing
 *   PERMISSION_PENDING    permission was requested; no answer yet
 *   PERMISSION_DENIED     the rights holder refused
 *   SOURCE_UNVERIFIED     owner or terms not established; no permission on record
 *   IMAGE_REPLACEMENT_REQUIRED  the source's terms do not allow our use (or the
 *                               image is a placeholder); an authorized photo is needed
 *
 * Only the two VERIFIED_* statuses can be published. A status is derived from
 * the source's policy (`sources` in the registry) unless the image entry is
 * marked `manual: true`, in which case its own status and evidence are kept.
 * Never set a VERIFIED_* status without a licence or written authorization on
 * record in `evidence`.
 */
import fs from "node:fs";
import path from "node:path";

export const PUBLISHABLE = new Set(["VERIFIED_LICENSED", "VERIFIED_AUTHORIZED"]);
export const STATUSES = [
  "VERIFIED_LICENSED",
  "VERIFIED_AUTHORIZED",
  "PERMISSION_PENDING",
  "PERMISSION_DENIED",
  "SOURCE_UNVERIFIED",
  "IMAGE_REPLACEMENT_REQUIRED",
];

export function registryPath(root) {
  return path.join(root, "lib/inventory/data/image-rights-registry.json");
}

export function loadRegistry(root) {
  return JSON.parse(fs.readFileSync(registryPath(root), "utf8"));
}

const key = (productId, url) => `${productId}|${url}`;

/** Index image-provenance.json by product and local file. */
export function provenanceIndex(root) {
  const prov = JSON.parse(fs.readFileSync(path.join(root, "lib/inventory/data/image-provenance.json"), "utf8"));
  const byFile = new Map();
  for (const v of Object.values(prov)) {
    if (!v || typeof v !== "object" || !v.localFile) continue;
    byFile.set(key(v.productId, v.localFile), v);
    // Folder-level fallback: other photos of the same listing in the same
    // media folder come from the same recorded source.
    const dir = v.localFile.replace(/\/[^/]*$/, "/");
    if (!byFile.has(key(v.productId, dir))) byFile.set(key(v.productId, dir), { ...v, sourceUrl: null, inferredFromSibling: v.localFile });
  }
  return byFile;
}

function sourcePolicy(registry, website) {
  const s = registry.sources;
  const bare = (website || "").replace(/^www\./, "");
  return s[website] || s[bare] || s[`www.${bare}`] || s._unknown;
}

/** Build the registry entry for one image of one listing. */
function deriveEntry(registry, product, url, provByFile) {
  const prov = provByFile.get(key(product.id, url)) || provByFile.get(key(product.id, url.replace(/\/[^/]*$/, "/")));
  const placeholder = /\/placeholders\/|\/avatars\/default/.test(url);
  const website = prov?.sourceName || null;
  const policy = placeholder ? registry.sources._placeholder : sourcePolicy(registry, website);
  return {
    productId: product.id,
    partNumber: product.partNumber || null,
    originalImageUrl: prov?.sourceUrl || null,
    currentImageUrl: url,
    imageOwner: prov?.creator || null,
    sourceWebsite: website,
    landingPage: prov?.landingPage || null,
    sourceRecord: prov ? (prov.inferredFromSibling ? `inferred from ${prov.inferredFromSibling} (same listing and folder)` : "image-provenance.json") : "none",
    permissionStatus: policy.status,
    licenseType: policy.licenseType || null,
    evidence: policy.evidence,
    verifiedOn: policy.checked,
    usageRestrictions: policy.usageRestrictions || null,
    unblock: policy.unblock || null,
  };
}

/**
 * Bring the registry in line with the given candidate listings (those that
 * would be public if their images were authorized). Manual entries are kept.
 */
export function syncRegistry(root, registry, candidates) {
  const provByFile = provenanceIndex(root);
  const old = new Map(registry.images.map((e) => [key(e.productId, e.currentImageUrl), e]));
  const images = [];
  for (const p of candidates) {
    for (const url of imagesOf(p)) {
      const prev = old.get(key(p.id, url));
      images.push(prev?.manual ? prev : deriveEntry(registry, p, url, provByFile));
    }
  }
  // Keep manual entries for listings that are not candidates right now.
  for (const e of registry.images) {
    if (e.manual && !images.some((x) => x.productId === e.productId && x.currentImageUrl === e.currentImageUrl)) images.push(e);
  }
  images.sort((a, b) => a.productId - b.productId || a.currentImageUrl.localeCompare(b.currentImageUrl));
  return { ...registry, images };
}

export function imagesOf(p) {
  const list = [p.thumbnail, ...(p.images || [])].filter(Boolean);
  return [...new Set(list)];
}

/** Status of a listing: publishable only when every image is VERIFIED_*. */
export function listingStatus(registry, p) {
  const byKey = new Map(registry.images.map((e) => [key(e.productId, e.currentImageUrl), e]));
  const urls = imagesOf(p);
  if (!urls.length) return { publishable: false, status: "IMAGE_REPLACEMENT_REQUIRED", missing: [] };
  const statuses = urls.map((u) => byKey.get(key(p.id, u))?.permissionStatus || "SOURCE_UNVERIFIED");
  const bad = statuses.filter((s) => !PUBLISHABLE.has(s));
  return { publishable: bad.length === 0, status: bad[0] || statuses[0], statuses };
}
