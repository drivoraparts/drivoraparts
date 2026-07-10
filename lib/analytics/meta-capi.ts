import { getMetaCapiAccessToken, getMetaPixelId, getSiteUrl } from "@/lib/env";
import { logError, logInfo, logWarn } from "@/lib/monitoring/logger";

type CapILineItem = {
  id: number | string;
  quantity: number;
  item_price?: number;
};

export type MetaCapIPurchaseInput = {
  orderId: string;
  value: number;
  currency?: string;
  email?: string | null;
  phone?: string | null;
  items: CapILineItem[];
  eventSourceUrl?: string;
};

function getMetaCapiTestEventCode(): string | null {
  const code = process.env.META_CAPI_TEST_EVENT_CODE?.trim();
  return code || null;
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Digits only for Meta phone hashing (E.164 without + when possible). */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Send Purchase to Meta Conversions API when payment is confirmed server-side.
 * Required for NOWPayments / Cryptomus redirects — the browser pixel never runs
 * on the external payment page.
 *
 * Uses event_id = orderId so browser Purchase (if the buyer returns to /success)
 * is deduplicated with this server event.
 */
export async function sendMetaCapIPurchase(
  input: MetaCapIPurchaseInput
): Promise<boolean> {
  const accessToken = getMetaCapiAccessToken();
  if (!accessToken) {
    logWarn("meta_capi_skipped", {
      reason: "missing_META_CAPI_ACCESS_TOKEN",
      orderId: input.orderId,
    });
    return false;
  }

  const pixelId = getMetaPixelId();
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const userData: Record<string, unknown> = {};

  if (input.email?.trim()) {
    userData.em = [await sha256Hex(normalizeEmail(input.email))];
  }
  if (input.phone?.trim()) {
    const phone = normalizePhone(input.phone);
    if (phone) userData.ph = [await sha256Hex(phone)];
  }

  const contents = input.items
    .map((item) => {
      const id = String(item.id).trim();
      if (!id) return null;
      return {
        id,
        quantity: item.quantity > 0 ? item.quantity : 1,
        ...(typeof item.item_price === "number"
          ? { item_price: item.item_price }
          : {}),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null);

  const customData: Record<string, unknown> = {
    currency: input.currency ?? "USD",
    value: input.value,
    order_id: input.orderId,
    content_type: "product",
  };

  if (contents.length) {
    customData.content_ids = contents.map((c) => c.id);
    customData.contents = contents;
    customData.num_items = contents.reduce((sum, c) => sum + c.quantity, 0);
  }

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.orderId,
        event_source_url:
          input.eventSourceUrl ?? `${siteUrl}/success?orderId=${input.orderId}`,
        action_source: "website",
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  const testCode = getMetaCapiTestEventCode();
  if (testCode) body.test_event_code = testCode;

  const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as {
      events_received?: number;
      error?: { message?: string; code?: number };
    };

    if (!res.ok || json.error) {
      logError("meta_capi_purchase_failed", json.error?.message ?? res.status, {
        orderId: input.orderId,
        status: res.status,
        code: json.error?.code,
      });
      return false;
    }

    logInfo("meta_capi_purchase_sent", {
      orderId: input.orderId,
      eventsReceived: json.events_received ?? 1,
      value: input.value,
    });
    return true;
  } catch (error) {
    logError("meta_capi_purchase_error", error, { orderId: input.orderId });
    return false;
  }
}
