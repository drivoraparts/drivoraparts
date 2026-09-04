"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { trackEvent } from "@/lib/analytics/client";
import { storeMetaCheckoutItems } from "@/lib/analytics/meta-pixel";
import { showToast } from "@/lib/store/toastStore";
import Price from "@/components/currency/Price";
import OrderTotalsSummary from "@/components/checkout/OrderTotalsSummary";
import { CheckoutBrandMark } from "@/components/brand/CheckoutBrandMark";
import { ProductDiscountBadge } from "@/components/product/DiscountBadge";
import {
  calculateCartDiscounts,
  cartQualifiesForBulkDiscount,
} from "@/lib/inventory/discounts";
import ProductImage from "@/components/media/ProductImage";
import { useTranslation } from "@/hooks/useTranslation";
import { readCheckoutFormDraft, writeCheckoutFormDraft } from "@/lib/checkout/form-persist";
import { buildCartSignature, claimCheckoutStart } from "@/lib/checkout/checkout-tracking";

const glassCard =
  "box-border w-full max-w-full rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6";

type ShippingQuoteOption = {
  method: "standard" | "express";
  label: string;
  amount: number;
  freightClassLabel: string;
  unavailableReason?: string;
};

const inputClass =
  "box-border w-full max-w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 outline-none focus:border-accent";

export default function CheckoutPage() {
  const [hydrated, setHydrated] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /*
   * Shipping options for this cart and destination. Standard is always free
   * and always present; express appears only when it is genuinely priced for
   * the destination. Quotes are advisory — the fee charged is recomputed
   * server-side at order time from the method name alone.
   */
  const [shippingOptions, setShippingOptions] = useState<ShippingQuoteOption[]>([]);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">(
    "standard"
  );

  const cart = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const checkoutTracked = useRef(false);
  const { t } = useTranslation();

  const discountLineItems = useMemo(
    () =>
      cart.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
      })),
    [cart]
  );
  const breakdown = useMemo(
    () => calculateCartDiscounts(discountLineItems, 0, email.trim() || undefined),
    [discountLineItems, email]
  );
  const bulkDiscountActive = useMemo(
    () => cartQualifiesForBulkDiscount(discountLineItems),
    [discountLineItems]
  );

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  /*
   * Back from NOWPayments on iOS Safari.
   *
   * Before leaving, this page rewrites its own history entry to
   * /success?orderId=... so Back returns to the order rather than to an empty
   * form. Safari's back-forward cache restores the page from memory instead of
   * refetching, which would show the checkout DOM sitting under the /success
   * URL -- the customer would be looking at a form when the address bar says
   * order status. Reloading on a restored pageshow makes the browser fetch
   * whatever the URL now points at.
   *
   * Only fires when the URL has actually been rewritten, so an ordinary
   * bfcache return to /checkout still restores instantly.
   */
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && !window.location.pathname.startsWith("/checkout")) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // Restore customer info if the customer left for NOWPayments and came
  // back without completing payment. Read after mount (not as a lazy
  // useState initializer) so the server-rendered empty inputs match the
  // client's first render -- no hydration mismatch.
  useEffect(() => {
    // ?resume= wins over the local draft — see the effect below, which loads
    // the order from the server. Restoring stale localStorage over it would
    // reintroduce exactly the bug that parameter exists to fix.
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("resume")) {
      return;
    }
    const draft = readCheckoutFormDraft();
    if (!draft) return;
    setFullName(draft.fullName);
    setEmail(draft.email);
    setPhone(draft.phone);
    setAddress(draft.address);
    setCity(draft.city);
    setZip(draft.zip);
    setCountry(draft.country);
  }, []);

  /*
   * Resuming an existing pending order.
   *
   * The order is the source of truth, not the browser: the cart is rebuilt
   * from the order's own item snapshot and the form from the customer record,
   * so this works on a device that has never seen this order. Everything
   * lands in ordinary editable state -- the customer can change any of it
   * before continuing, and submitting goes through the normal checkout path.
   *
   * No order is created or modified here; this is a read.
   */
  const [resuming, setResuming] = useState(false);
  const resumeAttempted = useRef(false);

  useEffect(() => {
    if (!hydrated || resumeAttempted.current) return;
    const resumeId = new URLSearchParams(window.location.search).get("resume");
    if (!resumeId) return;
    resumeAttempted.current = true;

    let active = true;
    setResuming(true);

    (async () => {
      try {
        const res = await fetch(
          `/api/public/order-resume?orderId=${encodeURIComponent(resumeId)}`,
          { cache: "no-store" }
        );
        if (!active) return;
        if (!res.ok) {
          showToast(
            res.status === 404
              ? "That order can no longer be resumed."
              : "Could not load your order. Please try again."
          );
          return;
        }

        const data = (await res.json()) as {
          items?: {
            id: number; name: string; price: number; image: string;
            category: string; brand?: string; quantity: number;
          }[];
          customer?: {
            fullName: string; email: string; phone: string;
            address: string; city: string; zip: string; country: string;
          };
        };
        if (!active) return;

        if (data.items?.length) {
          // Replace rather than merge: the order defines what is being bought,
          // and adding to whatever happened to be in the cart would change the
          // amount away from the invoice the customer already has.
          clearCart();
          for (const item of data.items) {
            useCartStore.getState().addToCart(
              {
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                category: item.category,
                brand: item.brand,
              },
              item.quantity
            );
          }
        }

        const c = data.customer;
        if (c) {
          setFullName(c.fullName);
          setEmail(c.email);
          setPhone(c.phone);
          setAddress(c.address);
          setCity(c.city);
          setZip(c.zip);
          setCountry(c.country);
        }
      } catch {
        if (active) showToast("Could not load your order. Please try again.");
      } finally {
        if (active) setResuming(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [hydrated, clearCart]);

  useEffect(() => {
    if (!hydrated) return;
    writeCheckoutFormDraft({ fullName, email, phone, address, city, zip, country });
  }, [hydrated, fullName, email, phone, address, city, zip, country]);

  useEffect(() => {
    if (!hydrated || !cart.length || checkoutTracked.current) return;

    const items = cart.map((item) => ({ id: item.id, quantity: item.quantity }));

    // The ref only guards this mount. Coming back from NOWPayments without
    // paying remounts the page, so the session-scoped claim is what stops the
    // same customer counting as a second checkout.
    if (!claimCheckoutStart(buildCartSignature(items))) {
      checkoutTracked.current = true;
      return;
    }

    checkoutTracked.current = true;
    trackEvent("checkout_start", {
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      total: breakdown.total,
      items,
    });
  }, [hydrated, cart, breakdown.total]);

  /*
   * Re-quote whenever the cart or destination changes. Failure is silent and
   * leaves the options empty, which renders as free standard shipping only —
   * the customer can always complete an order even if quoting is unavailable.
   */
  useEffect(() => {
    if (!hydrated || !cart.length) {
      setShippingOptions([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
            country: country.trim() || undefined,
          }),
        });
        if (!res.ok || cancelled) return;

        const data = (await res.json()) as { options?: ShippingQuoteOption[] };
        if (cancelled) return;

        const options = data.options ?? [];
        setShippingOptions(options);

        // Never leave a method selected that this destination cannot fulfil.
        const express = options.find((option) => option.method === "express");
        if (!express || express.unavailableReason) setShippingMethod("standard");
      } catch {
        if (!cancelled) setShippingOptions([]);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [hydrated, cart, country]);

  const selectedShipping =
    shippingOptions.find((option) => option.method === shippingMethod) ?? null;
  const shippingFee = selectedShipping?.amount ?? 0;

  const handleCheckout = async () => {
    if (!cart.length || submitting) return;

    if (
      !fullName.trim() ||
      !email.trim() ||
      !address.trim() ||
      !city.trim() ||
      !zip.trim()
    ) {
      showToast("Please enter your name, email, and shipping address");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            brand: item.brand,
            quantity: item.quantity,
          })),
          customer: {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            address: address.trim(),
            city: city.trim(),
            zip: zip.trim(),
            country: country.trim() || undefined,
          },
          // A method name only. The server prices it — the browser never
          // sends an amount.
          shippingMethod,
          provider: "nowpayments",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showToast(data.error ?? "Checkout failed");
        setSubmitting(false);
        return;
      }

      const paymentUrl =
        (typeof data.redirectUrl === "string" && data.redirectUrl) ||
        data.payment?.paymentUrl;

      if (!paymentUrl) {
        showToast(
          data.payment?.message ??
            "Payment page unavailable. Please try again or contact support."
        );
        setSubmitting(false);
        return;
      }

      // No order_completed event here. Reaching this point means an order and
      // an invoice exist -- the customer has not paid yet, and most never will
      // (pending has historically outnumbered paid by more than ten to one).
      // Recording a completion now overstated sales in every report built on
      // it. The event is emitted server-side instead, from the webhook that
      // confirms payment. Meta and TikTok are unaffected: both already ignore
      // order_completed and track purchases from the success page.

      storeMetaCheckoutItems(
        cart.map((item) => ({ id: item.id, quantity: item.quantity }))
      );

      // Do NOT clear the cart here. Reaching NOWPayments only means an order
      // was created ("pending") -- not that payment succeeded. If the
      // customer backs out or abandons payment, they need their cart intact
      // to try again. The cart is only cleared once /success confirms the
      // order actually reached "paid" (see SuccessStatus.tsx).

      /*
       * Put the order status page in history BEFORE leaving for NOWPayments.
       *
       * Navigating straight to the invoice left /checkout as the previous
       * entry, so Back from the NOWPayments page landed on an empty checkout
       * form and the order the customer had just created looked lost. It was
       * never lost -- it is in the database with its invoice attached -- but
       * nothing in the browser pointed at it.
       *
       * replaceState swaps this entry's URL for the status page without
       * navigating, so the subsequent assignment pushes NOWPayments on top of
       * /success?orderId=... rather than on top of /checkout. Back now lands
       * on the order, which resolves its real state server-side and offers
       * Continue Payment against the existing invoice.
       */
      const orderId = typeof data.orderId === "string" ? data.orderId : null;
      if (orderId) {
        window.history.replaceState(
          null,
          "",
          `/success?orderId=${encodeURIComponent(orderId)}`
        );
      }
      window.location.href = paymentUrl;
    } catch {
      showToast("Checkout failed");
      setSubmitting(false);
    }
  };

  const shellClass =
    "mx-auto box-border w-full min-w-0 max-w-3xl bg-white px-4 py-6 text-neutral-900 sm:px-6 sm:py-8";

  if (!hydrated) {
    return (
      <div className="w-full overflow-x-hidden">
        <main className={shellClass}>
          <h1 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            {t("checkout")}
          </h1>
          <p className="text-center text-neutral-500">Loading your cart...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <main className={shellClass}>
        <h1 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
          {t("checkout")}
        </h1>

        {cart.length === 0 ? (
          <div className="text-center">
            <p className="mb-4 text-neutral-500">Your cart is empty.</p>
            <Link href="/catalog" className="text-accent hover:underline">
              Browse catalog
            </Link>
          </div>
        ) : (
          <div className="mx-auto grid w-full min-w-0 max-w-3xl gap-6 lg:max-w-none lg:grid-cols-2 lg:gap-8">
            <div className="min-w-0 space-y-6">
              <section className={glassCard}>
                <h2 className="mb-4 text-xl font-bold">Customer Information</h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="checkout-name"
                      className="mb-1 block text-sm text-neutral-500"
                    >
                      Full Name
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-email"
                      className="mb-1 block text-sm text-neutral-500"
                    >
                      Email
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-phone"
                      className="mb-1 block text-sm text-neutral-500"
                    >
                      Phone
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 000 0000"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="mb-1 block text-sm text-neutral-500"
                    >
                      Address
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      autoComplete="street-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main Street"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="checkout-city"
                        className="mb-1 block text-sm text-neutral-500"
                      >
                        City
                      </label>
                      <input
                        id="checkout-city"
                        type="text"
                        autoComplete="address-level2"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Los Angeles"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="checkout-zip"
                        className="mb-1 block text-sm text-neutral-500"
                      >
                        ZIP Code
                      </label>
                      <input
                        id="checkout-zip"
                        type="text"
                        autoComplete="postal-code"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="90210"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-country"
                      className="mb-1 block text-sm text-neutral-500"
                    >
                      Country
                    </label>
                    <input
                      id="checkout-country"
                      type="text"
                      autoComplete="country-name"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United States"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section className={glassCard}>
                <h2 className="mb-4 text-xl font-bold">Payment</h2>
                <p className="mb-4 font-medium">Secure Checkout via NOWPayments</p>
                <p className="mb-4 text-sm text-neutral-600">
                  Complete your payment securely through NOWPayments, with
                  support for BTC, ETH, USDT, and 300+ cryptocurrencies.
                </p>
                <p className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                  Select Pay Now to proceed to your secure NOWPayments payment
                  page and complete your transaction.
                </p>

                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  <p className="mb-2 font-semibold">Important Payment Instructions</p>
                  <ul className="list-disc space-y-1.5 pl-4 leading-relaxed">
                    <li>
                      After completing your payment, copy and securely save
                      your NOWPayments Transaction ID for your records.
                    </li>
                    <li>
                      Once your Transaction ID has been copied, the
                      NOWPayments payment page will automatically close and
                      redirect you back to DrivoraParts.
                    </li>
                    <li>
                      Your return to DrivoraParts confirms that your checkout
                      has been successfully submitted.
                    </li>
                    <li>
                      Please retain your Transaction ID until your payment and
                      order have been fully confirmed.
                    </li>
                  </ul>
                </div>

                <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="mb-2 text-xs font-medium text-neutral-700">
                    Don&apos;t Have Cryptocurrency?
                  </p>
                  <p className="mb-3 text-xs leading-relaxed text-neutral-500">
                    You can purchase cryptocurrency using a debit or credit
                    card through a third-party exchange such as{" "}
                    <a
                      href="https://changenow.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline hover:text-accent-hover"
                    >
                      ChangeNOW
                    </a>
                    , then use your cryptocurrency to complete your
                    DrivoraParts payment.
                  </p>
                  <p className="mb-2 text-xs font-semibold text-neutral-700">How It Works</p>
                  <ol className="list-decimal space-y-2 pl-4 text-xs leading-relaxed text-neutral-500">
                    <li>
                      <strong className="text-neutral-700">
                        Purchase Cryptocurrency —
                      </strong>{" "}
                      Open ChangeNOW in a new tab and purchase BTC or another
                      cryptocurrency supported by NOWPayments using your debit
                      or credit card.
                    </li>
                    <li>
                      <strong className="text-neutral-700">
                        Return to DrivoraParts —
                      </strong>{" "}
                      Return to this checkout and select Pay Now to open your
                      secure, unique NOWPayments payment page.
                    </li>
                    <li>
                      <strong className="text-neutral-700">
                        Complete Payment &amp; Save Your Transaction ID —
                      </strong>{" "}
                      Complete your payment through NOWPayments and copy your
                      Transaction ID. The payment page will then automatically
                      close and redirect you back to DrivoraParts.
                    </li>
                  </ol>
                </div>

                <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs leading-relaxed text-neutral-500">
                  <p className="mb-1.5 font-semibold text-neutral-700">Important</p>
                  <p className="mb-1.5">
                    ChangeNOW is an independent third-party service.
                    DrivoraParts does not process, control, or verify
                    transactions conducted through ChangeNOW.
                  </p>
                  <p className="mb-1.5">
                    Your cryptocurrency payment to DrivoraParts is processed
                    through NOWPayments.
                  </p>
                  <p>
                    Need assistance?{" "}
                    <Link href="/contact" className="text-accent underline hover:text-accent-hover">
                      Contact DrivoraParts Support
                    </Link>{" "}
                    before submitting your payment.
                  </p>
                </div>

                <img
                  src="https://nowpayments.io/images/embeds/payments-button-black.svg"
                  alt="Crypto payments by NOWPayments"
                  className="h-10 w-auto opacity-90"
                />
              </section>
            </div>

            <div className="min-w-0 space-y-6">
              <section className={glassCard}>
                <div className="mb-4 flex min-w-0 items-center justify-between gap-2">
                  <h2 className="shrink-0 text-sm font-medium text-neutral-700">
                    {t("orderSummary")}
                  </h2>
                  <span className="flex min-w-0 max-w-[58%] items-center justify-end gap-1.5 sm:max-w-[65%]">
                    <CheckoutBrandMark />
                    <span className="truncate text-[11px] leading-tight text-neutral-500 sm:text-xs">
                      {t("secureCheckout")}
                    </span>
                  </span>
                </div>

                <div className="divide-y divide-neutral-200">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex min-w-0 items-start gap-3 py-3"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                        <ProductImage
                          src={item.image || "/product-media/avatars/default.svg"}
                          alt={item.name}
                          profile="grid"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium leading-snug text-neutral-900">
                          {item.name}
                        </h3>
                        <div className="mt-1">
                          <ProductDiscountBadge
                            category={item.category}
                            active={bulkDiscountActive}
                          />
                        </div>
                        <p className="mt-1 text-xs text-neutral-500">
                          Qty {item.quantity}
                          {item.quantity > 1 ? (
                            <>
                              {" · "}
                              <Price usd={item.price} /> each
                            </>
                          ) : null}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-medium text-neutral-900">
                        <Price usd={item.price * item.quantity} />
                      </p>
                    </div>
                  ))}
                </div>

                {/*
                  * Shipping choice. Only rendered when there is a genuine
                  * choice to make -- with express unconfigured this collapses
                  * to nothing and checkout looks exactly as it did before.
                  */}
                {shippingOptions.length > 1 ? (
                  <div className="mt-4 border-t border-neutral-200 pt-4">
                    <p className="mb-2 text-sm font-semibold text-neutral-900">
                      Delivery
                    </p>
                    <div className="space-y-2">
                      {shippingOptions.map((option) => {
                        const disabled = Boolean(option.unavailableReason);
                        const active = shippingMethod === option.method && !disabled;

                        return (
                          <label
                            key={option.method}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                              disabled
                                ? "cursor-not-allowed border-neutral-200 bg-neutral-50 opacity-70"
                                : active
                                  ? "border-accent bg-accent-subtle"
                                  : "border-neutral-300 hover:border-neutral-400"
                            }`}
                          >
                            <input
                              type="radio"
                              name="shipping-method"
                              className="mt-0.5 accent-red-600"
                              checked={active}
                              disabled={disabled}
                              onChange={() => setShippingMethod(option.method)}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                                <span className="text-sm font-medium text-neutral-900">
                                  {option.label}
                                </span>
                                <span className="text-sm font-semibold text-neutral-900">
                                  {option.method === "standard" ? (
                                    "Free"
                                  ) : disabled ? (
                                    "—"
                                  ) : (
                                    <Price usd={option.amount} />
                                  )}
                                </span>
                              </span>
                              <span className="mt-0.5 block text-xs leading-relaxed text-neutral-500">
                                {option.unavailableReason ??
                                  `${option.freightClassLabel}${
                                    option.method === "express"
                                      ? " · priced by package type and destination"
                                      : ""
                                  }`}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <OrderTotalsSummary breakdown={breakdown} />

                  {shippingFee > 0 ? (
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-neutral-600">Express shipping</span>
                      <span className="font-medium text-neutral-900">
                        <Price usd={shippingFee} />
                      </span>
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-neutral-500">
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    <span>{t("secureCheckout")}</span>
                  </div>
                </div>
              </section>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting}
                className="box-border w-full max-w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60 disabled:active:scale-100"
              >
                {submitting ? t("processing") : t("payNow")}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
