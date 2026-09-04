import { NextResponse } from "next/server";
import { processCheckout } from "@/lib/checkout/service";
import { sendAdminCheckoutFailedEmail } from "@/lib/email/send";
import {
  lockOrderItemsFromCatalog,
  parseRawCheckoutItems,
} from "@/lib/checkout/validate-items";
import { logError, logWarn } from "@/lib/monitoring/logger";
import { getClientIp } from "@/lib/security/ip";
import {
  priceShippingMethod,
  type ShippingMethod,
} from "@/lib/shipping/quote";

function getCheckoutErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;

  if (typeof error === "object" && error !== null) {
    const record = error as { message?: string; details?: string };
    if (record.message) return record.message;
    if (record.details) return record.details;
  }

  return "Checkout failed";
}

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

  const address =
    typeof (raw as { address?: string }).address === "string"
      ? (raw as { address: string }).address.trim()
      : "";
  const city =
    typeof (raw as { city?: string }).city === "string"
      ? (raw as { city: string }).city.trim()
      : "";
  const zip =
    typeof (raw as { zip?: string }).zip === "string"
      ? (raw as { zip: string }).zip.trim()
      : "";
  const country =
    typeof (raw as { country?: string }).country === "string"
      ? (raw as { country: string }).country.trim()
      : "";

  const shippingAddress = [address, [city, zip].filter(Boolean).join(", "), country]
    .filter(Boolean)
    .join("\n");

  return {
    fullName,
    email,
    phone:
      typeof (raw as { phone?: string }).phone === "string"
        ? (raw as { phone: string }).phone.trim()
        : undefined,
    address: address || undefined,
    city: city || undefined,
    zip: zip || undefined,
    country: country || undefined,
    shippingAddress: shippingAddress || undefined,
  };
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  /*
   * Held outside the try so the catch can name who was affected.
   *
   * A checkout that fails produces no order, so it used to produce no
   * notification either -- it was logged, the customer saw an error message,
   * and that was the end of it. A successful pending order now emails the
   * owner; a failed one is arguably more urgent, because someone tried to hand
   * over money and could not.
   */
  let attemptedCustomer: { fullName: string; email: string } | null = null;

  try {
    const body = await req.json().catch(() => null);
    const parsedItems = parseRawCheckoutItems(body?.items);
    const customer = parseCustomer(body?.customer);
    if (customer) {
      attemptedCustomer = { fullName: customer.fullName, email: customer.email };
    }

    // Item problems are reported separately from customer-detail problems, so
    // the customer is told what is actually wrong rather than being handed one
    // catch-all message at the last step of checkout.
    if (!parsedItems.items) {
      logWarn("checkout_invalid_items", { ip, reason: parsedItems.error });
      return NextResponse.json({ error: parsedItems.error }, { status: 400 });
    }

    if (!customer) {
      logWarn("checkout_invalid_customer", { ip });
      return NextResponse.json(
        { error: "Please enter your name, email, and shipping address." },
        { status: 400 }
      );
    }

    let lockedItems;
    try {
      lockedItems = lockOrderItemsFromCatalog(parsedItems.items);
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
      body?.provider === "nowpayments" || body?.provider === "manual"
        ? body.provider
        : undefined;

    /*
     * The customer chooses a METHOD; the price is computed here. A shipping
     * amount is never read from the request body -- otherwise a crafted
     * payload could set its own delivery fee, including a negative one.
     */
    const requestedMethod: ShippingMethod =
      body?.shippingMethod === "express" ? "express" : "standard";

    const shippingQuote = priceShippingMethod(
      parsedItems.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      customer.country,
      requestedMethod
    );

    const result = await processCheckout({
      items: lockedItems,
      customer,
      providerId,
      shipping: shippingQuote.amount,
      shippingMethod: shippingQuote.method,
      freightClass: shippingQuote.freightClass,
      shippingZone: shippingQuote.zone,
      requestMeta: { ip },
    });

    return NextResponse.json(result);
  } catch (error) {
    logError("checkout_failed", error, { ip });

    /*
     * Only mail when a real customer was parsed. Malformed bodies and bot
     * traffic hitting /api/checkout never get this far with a name and email,
     * so they cannot turn this into an inbox full of noise. Fire-and-forget:
     * the customer's error response must not wait on, or be changed by, an
     * email send.
     */
    if (attemptedCustomer) {
      try {
        await sendAdminCheckoutFailedEmail({
          customerName: attemptedCustomer.fullName,
          customerEmail: attemptedCustomer.email,
          reason: error instanceof Error ? error.message : String(error),
        });
      } catch (mailError) {
        logError("checkout_failed_email_failed", mailError, { ip });
      }
    }

    return NextResponse.json(
      { error: getCheckoutErrorMessage(error) },
      { status: 400 }
    );
  }
}
