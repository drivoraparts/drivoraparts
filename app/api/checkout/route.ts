import { NextResponse } from "next/server";
import { processCheckout } from "@/lib/checkout/service";
import {
  isBankRouteId,
  isManualMethodId,
  methodRequiresRoute,
} from "@/lib/payments/manual-methods";
import { sendAdminCheckoutFailedEmail } from "@/lib/email/send";
import {
  lockOrderItemsFromCatalog,
  parseRawCheckoutItems,
} from "@/lib/checkout/validate-items";
import { logError, logWarn } from "@/lib/monitoring/logger";
import { getClientIp } from "@/lib/security/ip";
import { assessShipping } from "@/lib/shipping/quote";
import { checkoutCountryError, quoteShipping } from "@/lib/shipping/rates";

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

    // Shipping is priced from the destination, so an order without one is
    // refused here rather than created with shipping silently left to quote.
    const countryError = checkoutCountryError(customer.country);
    if (countryError) {
      logWarn("checkout_missing_country", { ip });
      return NextResponse.json({ error: countryError }, { status: 400 });
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

    // Only meaningful for provider "manual". Validated against the enabled
    // method list, so a crafted body cannot inject an arbitrary method label.
    const manualMethod =
      providerId === "manual" && isManualMethodId(body?.manualMethod)
        ? (body.manualMethod as string)
        : undefined;

    /*
     * A manual order must name a real method. A missing or unknown one used to
     * fall through to a bank_transfer default inside the provider -- AFTER the
     * route check below had already been skipped for want of a method -- which
     * created exactly the routeless Bank Transfer order that check refuses.
     */
    if (providerId === "manual" && !manualMethod) {
      logWarn("checkout_invalid_manual_method", { ip });
      return NextResponse.json(
        { error: "Please choose a payment method." },
        { status: 400 }
      );
    }

    // Which bank/transfer route was requested. Validated against the enabled
    // route list, so a crafted body cannot inject an arbitrary label.
    const manualRoute =
      manualMethod && isBankRouteId(body?.manualRoute)
        ? (body.manualRoute as string)
        : undefined;

    /*
     * A method that declares requiresRoute cannot be ordered without one.
     * Enforced here rather than only in the browser: knowing which route was
     * asked for is the entire reason it is collected, and an order that
     * arrives without it costs a round trip of emails to resolve.
     */
    if (manualMethod && methodRequiresRoute(manualMethod) && !manualRoute) {
      logWarn("checkout_missing_bank_route", { ip, method: manualMethod });
      return NextResponse.json(
        { error: "Please choose your bank / transfer route." },
        { status: 400 }
      );
    }

    /*
     * Shipping is priced here, on the server, from the published rate
     * table in lib/shipping/rates.ts -- the same table the cart showed and the
     * same one Google Merchant Center is configured with. It is never read
     * from the request body: a crafted payload could otherwise set its own
     * delivery fee, including a negative one.
     *
     * Carts the table does not cover (freight or multi-box items while their
     * rate is unset, destinations without a published rate, order values above the top
     * bracket) are still created with shipping at zero meaning NOT YET
     * CALCULATED, and are quoted by hand before payment exactly as before.
     * Checkout told the customer so before they placed the order.
     */
    const shipment = assessShipping(
      parsedItems.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      customer.country
    );

    const shippingQuote = quoteShipping(
      lockedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      customer.country
    );

    /*
     * Cryptocurrency only when the whole amount is known now.
     *
     * A NOWPayments invoice is created for one fixed amount when the order is
     * placed, and nothing in this application can add a shipping charge to it
     * later (the admin "send payment instructions" step refuses non-manual
     * orders). An order whose shipping is still to be quoted would therefore be
     * marked fully paid with its shipping never collected. Those orders use a
     * manual method, where the charge is quoted before the customer pays.
     */
    if (providerId !== "manual" && shippingQuote.status !== "calculated") {
      logWarn("checkout_crypto_shipping_unpriced", { ip, reason: shippingQuote.reason });
      return NextResponse.json(
        {
          error:
            "Cryptocurrency can't be used for this order because its shipping is confirmed after ordering. Please choose another payment method -- we'll confirm the shipping charge with you before you pay.",
        },
        { status: 400 }
      );
    }

    const result = await processCheckout({
      items: lockedItems,
      customer,
      providerId,
      manualMethod,
      manualRoute,
      shipping: shippingQuote.status === "calculated" ? shippingQuote.amount : 0,
      shippingBasis: shippingQuote.status === "calculated" ? "us_price_table" : "manual_quote",
      shippingMethod: "standard",
      freightClass: shipment.freightClass,
      shippingZone: shipment.zone,
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
