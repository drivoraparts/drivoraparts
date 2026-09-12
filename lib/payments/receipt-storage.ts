/**
 * Private storage for customer payment receipts.
 *
 * Every byte here is proof-of-payment a customer uploaded: bank screenshots,
 * wire confirmations, transfer receipts. It is treated accordingly.
 *
 *  - The bucket is PRIVATE. It is created with public:false and has no read
 *    policy of any kind, so an object key is not a URL and leaking one grants
 *    nothing.
 *  - Every read goes through a short-lived signed URL minted server-side for a
 *    signed-in admin. Customers never receive one, and no signed URL is stored.
 *  - All access uses the service-role client, which lives only on the server.
 *    The browser never sees a Supabase key capable of touching this bucket, so
 *    there are no storage RLS policies to get wrong -- the server is the only
 *    path in or out.
 *  - Object keys are namespaced by order id, so an upload is always attributable
 *    to exactly one order.
 */
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { logError } from "@/lib/monitoring/logger";

export const RECEIPT_BUCKET = "drivora-receipts";

/** What a customer may upload as proof of payment. */
export const ALLOWED_RECEIPT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;

/** Per file. Phone photos of a bank screen are routinely 3-6MB. */
export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
/** Per submission, so one request cannot be used to fill the bucket. */
export const MAX_RECEIPTS_PER_SUBMISSION = 5;
/** Across the whole order, over every submission. */
export const MAX_RECEIPTS_PER_ORDER = 20;

export function isAllowedReceiptType(contentType: string): boolean {
  return (ALLOWED_RECEIPT_TYPES as readonly string[]).includes(
    contentType.toLowerCase()
  );
}

function extensionFor(contentType: string): string {
  switch (contentType.toLowerCase()) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    case "application/pdf":
      return "pdf";
    default:
      return "bin";
  }
}

let bucketReady = false;

/**
 * Create the bucket on first use if it does not exist.
 *
 * Idempotent and safe to call on every upload: after the first success it is a
 * no-op flag check. Done in code rather than a SQL migration because a bucket
 * is a Storage object, not a table -- and because the deploy target (Cloudflare
 * Workers) has no migration step that runs against Supabase.
 */
export async function ensureReceiptBucket(): Promise<void> {
  if (bucketReady) return;

  const supabase = getSupabaseAdmin();
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) throw error;

  if (!buckets?.some((bucket) => bucket.name === RECEIPT_BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(
      RECEIPT_BUCKET,
      {
        public: false,
        fileSizeLimit: MAX_RECEIPT_BYTES,
        allowedMimeTypes: [...ALLOWED_RECEIPT_TYPES],
      }
    );

    // A concurrent request may have created it between the list and the
    // create; that is success, not failure.
    if (createError && !/already exists/i.test(createError.message)) {
      throw createError;
    }
  }

  bucketReady = true;
}

export type StoredReceipt = {
  path: string;
  contentType: string;
  size: number;
  originalName?: string;
};

/**
 * Store one receipt for an order. Returns the object key to record on the
 * payment; the caller is responsible for having verified the order first.
 */
export async function uploadReceipt(input: {
  orderId: string;
  bytes: ArrayBuffer;
  contentType: string;
  originalName?: string;
}): Promise<StoredReceipt> {
  await ensureReceiptBucket();

  const supabase = getSupabaseAdmin();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const path = `${input.orderId}/${unique}.${extensionFor(input.contentType)}`;

  const { error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .upload(path, input.bytes, {
      contentType: input.contentType,
      upsert: false,
    });

  if (error) throw error;

  return {
    path,
    contentType: input.contentType,
    size: input.bytes.byteLength,
    originalName: input.originalName,
  };
}

/**
 * Mint a short-lived view URL for an admin. Default five minutes: long enough
 * to open and read a receipt, short enough that a URL copied out of the admin
 * page or a log is useless almost immediately.
 */
export async function createReceiptSignedUrl(
  path: string,
  expiresInSeconds = 300
): Promise<string | null> {
  try {
    await ensureReceiptBucket();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error) throw error;
    return data?.signedUrl ?? null;
  } catch (error) {
    // A receipt that cannot be signed must not take down the order page.
    logError("receipt_sign_failed", error, { path });
    return null;
  }
}
