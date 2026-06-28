import { NextResponse } from "next/server";
import { processCheckout } from "@/lib/checkout/service";
import {
  lockOrderItemsFromCatalog,
  parseRawCheckoutItems,
} from "@/lib/checkout/validate-items";
import { logError, logWarn } from "@/lib/monitoring/logger";
import { getClientIp } from "@/lib/security/ip";

function parseCustomer(raw: unknown) {
  if (typeof raw !== "object" || raw === null) return null;

  const fullName =
    typeof (raw as { fullName?: string }).fullName === "string"
      ? (raw as { fullName: string }).fullName.trim()
      : "";
  const email =
    typeof (raw as { email?: string }).email === "string"
      ? (raw as { email: string }).email.trim()
      : "";

  if (!fullName || !email) return null;

  return {
    fullName,
    email,
    phone:
      typeof (raw as { phone?: string }).phone === "string"
        ? (raw as { phone: string }).phone.trim()
        : undefined,
    shippingAddress:
      typeof (raw as { address?: string }).address === "string"
        ? (raw as { address: string }).address.trim()
        : undefined,
  };
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  try {
    const body = await req.json().catch(() => null);
    const rawItems = parseRawCheckoutItems(body?.items);
    const customer = parseCustomer(body?.customer);

    if (!rawItems || !customer) {
      logWarn("checkout_invalid_payload", { ip });
      return NextResponse.json(
        { error: "Invalid checkout payload" },
        { status: 400 }
      );
    }

    let lockedItems;
    try {
      lockedItems = lockOrderItemsFromCatalog(rawItems);
    } catch (validationError) {
      logWarn("checkout_validation_failed", {
        ip,
        message:
          validationError instanceof Error
            ? validationError.message
            : "validation failed",
      });
      return NextResponse.json(
        {
          error:
            validationError instanceof Error
              ? validationError.message
              : "Invalid order items",
        },
        { status: 400 }
      );
    }

    const providerId =
      body?.provider === "nowpayments" ||
      body?.provider === "cryptomus" ||
      body?.provider === "manual"
        ? body.provider
        : undefined;

    const result = await processCheckout({
      items: lockedItems,
      customer,
      providerId,
      requestMeta: { ip },
    });

    return NextResponse.json(result);
  } catch (error) {
    logError("checkout_failed", error, { ip });
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
