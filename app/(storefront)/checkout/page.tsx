"use client";

import Link from "next/link";
import {
  BUYER_PROTECTION_CHECKOUT_LINK,
  BUYER_PROTECTION_CHECKOUT_STATEMENT,
  BUYER_PROTECTION_HREF,
} from "@/lib/content/buyer-protection";
import { RETURN_POLICY_HREF } from "@/lib/content/purchase-terms";
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
import {
  BANK_ROUTES,
  MANUAL_METHODS,
  methodRequiresRoute,
  type ManualMethodId,
} from "@/lib/payments/manual-methods";
import PaymentMethodIcon from "@/components/checkout/PaymentMethodIcon";
import { buildCartSignature, claimCheckoutStart } from "@/lib/checkout/checkout-tracking";
import {
  MANUAL_PAYMENT_CHECKOUT_INTRO,
  MANUAL_PAYMENT_CHECKOUT_LINK,
  MANUAL_PAYMENT_CHECKOUT_QUESTION,
  MANUAL_PAYMENT_POLICY_HREF,
  PAYPAL_DISCLOSURE,
} from "@/lib/content/manual-payment";

const glassCard =
  "box-border w-full max-w-full rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6";

const inputClass =
  "box-border w-full max-w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 outline-none focus:border-accent";

/**
 * Everything the payment selector offers, in the order it offers it.
 *
 * Derived from MANUAL_METHODS rather than restated, so adding, renaming or
 * disabling a method in lib/payments/manual-methods.ts is still the only edit
 * needed -- checkout, the order record, the admin screen and the owner's
 * notification email all keep reading from that one list.
 *
 * Crypto is appended as the same "crypto" sentinel payChoice has always used;
 * it is not a manual method and has no entry there. It stays last, where the
 * OR-divided card it replaces used to sit. Its blurb is that card's own copy.
 */
const PAY_OPTIONS: {
  value: "crypto" | ManualMethodId;
  label: string;
  blurb: string;
}[] = [
  ...MANUAL_METHODS.filter((m) => m.enabled).map((m) => ({
    value: m.id,
    label: m.label,
    blurb: m.blurb,
  })),
  {
    value: "crypto" as const,
    label: "Cryptocurrency",
    blurb: "Bitcoin · Ethereum · USDT · 300+ coins via NOWPayments",
  },
];

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
   * Which payment method the customer has chosen. "crypto" is the existing
   * NOWPayments flow; any manual method id routes the order through the
   * manual/direct-payment path instead.
   *
   * Starts null -- NOTHING is preselected. It used to start at "crypto",
   * which meant an order could record "Cryptocurrency (NOWPayments)" without
   * the customer ever having looked at the payment step, and afterwards there
   * was no way to tell a deliberate choice from an untouched default. The
   * Place Order button stays clickable while this is null so the customer
   * gets told why it will not go through; handleCheckout refuses the submit.
   */
  const [payChoice, setPayChoice] = useState<"crypto" | ManualMethodId | null>(
    null
  );
  /** Set when a submit is attempted with no method chosen; cleared on choice. */
  const [payError, setPayError] = useState(false);
  const paymentSelectRef = useRef<HTMLSelectElement>(null);
  const selectedPayOption =
    PAY_OPTIONS.find((option) => option.value === payChoice) ?? null;
  // Only meaningful for a method that declares requiresRoute (Bank Transfer).
  // Kept when the customer switches away and back, but never submitted -- and
  // never required -- unless the selected method actually asks for it.
  const [bankRoute, setBankRoute] = useState("");

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
   * There is no shipping quote at checkout any more.
   *
   * This used to POST the cart to /api/shipping/quote, which answered $0 for
   * every cart and destination, and the summary printed that as the word
   * "Free". Nothing in this application talks to a carrier, so that figure was
   * a constant wearing a quote's clothes -- and it contradicted the policy,
   * under which Australia and other international destinations are charged and
   * a crated engine can be charged even where standard shipping is free.
   *
   * The charge is worked out by a person and sent with the payment details, so
   * the customer is told that instead of being shown a number nobody stands
   * behind.
   */

  const handleCheckout = async () => {
    if (!cart.length || submitting) return;

    /*
     * No method chosen. This is the state checkout now opens in, so it is an
     * ordinary path rather than an edge case: the button stays clickable
     * precisely so the customer finds out why the order will not go through
     * instead of pressing a dead control. The selector is marked invalid,
     * scrolled to and focused, and the order is not sent.
     *
     * The server refuses a manual order with no method too (400), and an
     * order must never be allowed to fall back to a default here: payChoice
     * is what decides provider and manualMethod, and guessing one is exactly
     * the bug this selector exists to remove.
     */
    if (!payChoice) {
      setPayError(true);
      paymentSelectRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      paymentSelectRef.current?.focus({ preventScroll: true });
      showToast("Please select a payment method to continue.");
      return;
    }

    /*
     * A method that declares requiresRoute cannot be submitted without one.
     * The server enforces this as well (400) -- this exists so the customer is
     * told immediately rather than after a round trip, and so the button does
     * not appear to do nothing.
     */
    if (methodRequiresRoute(payChoice) && !bankRoute) {
      showToast("Please choose your bank / transfer route.");
      return;
    }

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
          provider: payChoice === "crypto" ? "nowpayments" : "manual",
          ...(payChoice !== "crypto" ? { manualMethod: payChoice } : {}),
          // Sent only for a method that asks for one, so switching to Zelle,
          // Venmo or crypto cannot carry a stale route over from an earlier
          // selection the customer changed their mind about.
          ...(methodRequiresRoute(payChoice) ? { manualRoute: bankRoute } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showToast(data.error ?? "Checkout failed");
        setSubmitting(false);
        return;
      }

      // Manual / direct payment: no external invoice exists. The order is
      // created and pending; send the customer to their order page, where the
      // instructions (once an admin sends them) and the receipt upload live.
      // The cart is left intact until an admin verifies payment, exactly as
      // with the crypto path.
      if (data.payment?.manualPending && typeof data.orderId === "string") {
        storeMetaCheckoutItems(
          cart.map((item) => ({ id: item.id, quantity: item.quantity }))
        );
        // Their payment page, not /success. /success is the crypto status page:
        // it would tell a manual customer their payment "was not completed" and
        // offer Return to Checkout, which places the same order a second time.
        window.location.href = `/pay/${encodeURIComponent(data.orderId)}`;
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

                {/*
                  One selector, nothing preselected.

                  This used to be a list of cards with the crypto card
                  preselected, which meant a customer could complete checkout
                  having never touched the payment step -- the order recorded
                  "Cryptocurrency (NOWPayments)" and there was no way to tell
                  afterwards whether they had chosen it or simply not noticed.
                  A select that starts empty makes the choice deliberate: the
                  order can only name a method the customer actually picked.

                  A native select rather than a custom listbox, matching the
                  bank-route control below it: it is keyboard accessible and
                  uses the platform picker on mobile for free, and it cannot
                  clip or overflow the way a floating menu can inside this
                  column. The selected method is restated underneath with its
                  brand mark, since a select can only render text.

                  Options come from MANUAL_METHODS plus the existing "crypto"
                  sentinel -- the same values payChoice has always held and the
                  same provider/manualMethod pair checkout has always posted,
                  so nothing downstream changes.
                */}
                {/*
                  "Manual Payment", not "Pay Directly".

                  "Pay Directly" said nothing about what the customer is
                  actually about to do, and read as if money would move at this
                  step. What happens is an order, a review, instructions, a
                  payment and a verification -- see /policies/manual-payment --
                  so the heading names the process and the line under it says
                  what comes next.

                  The explanation is a sentence and a link, not a panel: the
                  methods below are what the customer came here to choose, and
                  the reasoning is one click away for anyone who wants it. The
                  link opens in a new tab so a half-completed form is not lost
                  to a navigation. The wording is shared with the policy page
                  (lib/content/manual-payment.ts) so the two cannot disagree.
                */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-neutral-800">
                    Manual Payment
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                    {MANUAL_PAYMENT_CHECKOUT_INTRO}
                  </p>
                  {/*
                    The question is plain text; only "Learn more →" is the link.

                    A bare "Learn more" tells a screen-reader user nothing about
                    where it goes, so its accessible name carries the rest:
                    "Learn more about why we use manual payment (opens in a new
                    tab)". That name still starts with the visible label, which
                    is what keeps it consistent with what a sighted user sees.
                  */}
                  <p className="mt-1.5 text-xs text-neutral-600">
                    {MANUAL_PAYMENT_CHECKOUT_QUESTION}{" "}
                    <Link
                      href={MANUAL_PAYMENT_POLICY_HREF}
                      prefetch={false}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline underline-offset-2 hover:text-accent-hover"
                    >
                      {MANUAL_PAYMENT_CHECKOUT_LINK}
                      <span aria-hidden="true"> →</span>
                      <span className="sr-only">
                        {" "}
                        about why we use manual payment (opens in a new tab)
                      </span>
                    </Link>
                  </p>
                  {/*
                    DrivoraParts Buyer Protection, in the payment area where a
                    first-time customer decides whether to pay. Opens in a new
                    tab for the same reason as the link above.
                  */}
                  <p className="mt-1.5 text-xs text-neutral-600">
                    <Link
                      href={BUYER_PROTECTION_HREF}
                      prefetch={false}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
                    >
                      {BUYER_PROTECTION_CHECKOUT_LINK}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </Link>
                  </p>
                </div>

                <label
                  htmlFor="payment-method"
                  className="mb-1.5 block text-sm font-medium text-neutral-900"
                >
                  Payment method
                </label>
                <select
                  id="payment-method"
                  ref={paymentSelectRef}
                  required
                  aria-required="true"
                  aria-invalid={payError || undefined}
                  aria-describedby={
                    selectedPayOption
                      ? "payment-method-hint payment-method-detail"
                      : "payment-method-hint"
                  }
                  value={payChoice ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPayChoice(
                      value ? (value as "crypto" | ManualMethodId) : null
                    );
                    // Clears the moment they choose, so the warning never
                    // lingers over a selection that has since been made.
                    setPayError(false);
                  }}
                  className={`box-border w-full max-w-full rounded-lg border bg-white px-4 py-3 text-base text-neutral-900 outline-none ${
                    payError
                      ? // Focus is moved here when the error fires, and a bare
                        // focus:border-accent would out-specify the red and
                        // hide the very state that just stopped the order.
                        "border-red-500 focus:border-red-500"
                      : "border-neutral-300 focus:border-accent"
                  }`}
                >
                  <option value="">Choose a payment method</option>
                  {/*
                    Two groups, because the two really are different: the
                    manual methods wait for an admin to send instructions,
                    cryptocurrency opens an invoice immediately. Grouping keeps
                    the heading above honest without a second control, and a
                    native optgroup is announced by screen readers and drawn by
                    the platform picker on mobile.
                  */}
                  <optgroup label="Manual Payment">
                    {PAY_OPTIONS.filter((option) => option.value !== "crypto").map(
                      (option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      )
                    )}
                  </optgroup>
                  <optgroup label="Cryptocurrency">
                    {PAY_OPTIONS.filter((option) => option.value === "crypto").map(
                      (option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      )
                    )}
                  </optgroup>
                </select>

                <p
                  id="payment-method-hint"
                  {...(payError ? { role: "alert" as const } : {})}
                  className={`mt-1.5 text-[11px] leading-relaxed ${
                    payError ? "font-medium text-red-600" : "text-neutral-500"
                  }`}
                >
                  {payError
                    ? "Please select a payment method to continue."
                    : "Required. Choose how you want to pay — payment details for your selected method will appear below."}
                </p>

                {/*
                  Shipping is quoted by hand once the order is in, so this is
                  the whole of what checkout can honestly say about it -- for
                  the manual methods.

                  It is NOT true of cryptocurrency, and is hidden when that is
                  selected. A crypto order is created with shipping at 0 (the
                  checkout route's "not yet calculated" marker), the NOWPayments
                  invoice is for the order total, and the only code that records
                  a real shipping charge -- the admin "send payment instructions"
                  action -- refuses an order that is not a manual payment. So no
                  payment details are sent to a crypto customer and nothing adds
                  shipping to their order.

                  Nothing replaces the sentence for crypto: what actually
                  happens to shipping on those orders is a business decision, not
                  something this wording can supply. Shown when no method is
                  chosen yet, since the choice is made from the manual methods.
                */}
                {payChoice !== "crypto" ? (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-500">
                    Shipping will be calculated and sent with your payment details.
                  </p>
                ) : null}

                {selectedPayOption ? (
                  <div
                    id="payment-method-detail"
                    className="mt-3 overflow-hidden rounded-lg border border-accent ring-1 ring-accent"
                  >
                    {/* The mark the rest of the site uses for this method. The
                        select itself can only show text, so the selected state
                        is restated here where it is unmistakable. */}
                    <div className="flex items-start gap-2.5 border-b border-accent/40 bg-accent-subtle px-3 py-2.5">
                      <PaymentMethodIcon id={selectedPayOption.value} />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-neutral-900">
                          {selectedPayOption.label}
                        </span>
                        <span className="block text-[11px] leading-tight text-neutral-500">
                          {selectedPayOption.blurb}
                        </span>
                      </span>
                    </div>

                    <div className="px-3 pb-3 pt-2.5">
                      {payChoice === "crypto" ? (
                        <>
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

                          <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs leading-relaxed text-neutral-500">
                            <p className="mb-1.5 font-semibold text-neutral-700">Important</p>
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

                          {/*
                            Served from our own origin, not hotlinked from nowpayments.io.
                            This is the same official mark -- the local copy the footer
                            already uses -- so nothing about the branding changes; it just
                            stops checkout depending on a third-party host staying up and
                            reachable to render. Purely the image source: the NOWPayments
                            flow, invoice and copy are untouched.
                          */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/trust/nowpayments-mark.svg"
                            alt="Crypto payments by NOWPayments"
                            width={250}
                            height={55}
                            loading="lazy"
                            decoding="async"
                            className="h-10 w-auto opacity-90"
                          />
                        </>
                      ) : (
                        <>
                          {/*
                            PayPal, only for itself, and before the order is
                            placed. (Venmo had its own notice until it was taken
                            off the payment list.)

                            One short line on how that method is paid, so the
                            customer knows what to do when the instructions
                            arrive: pick Friends & Family on PayPal. The panel below is the
                            existing place a selected method explains itself, so
                            the line lives here rather than in a banner over
                            checkout or on another page.

                            Looked up by payChoice, so a method with no entry
                            shows nothing and neither notice can appear under
                            another method. The text is wired into the select's
                            aria-describedby (via #payment-method-detail) so it
                            is read out when the method is chosen, not just
                            drawn.
                          */}
                          {(() => {
                            const notice =
                              payChoice === "paypal"
                                ? PAYPAL_DISCLOSURE
                                : null;

                            return notice ? (
                              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
                                <p className="font-semibold">{notice.lead}</p>
                                <p className="mt-1">{notice.body}</p>
                              </div>
                            ) : null;
                          })()}

                          {/* Route names only: no account numbers, sort codes
                              or SWIFT/BIC appear here. */}
                          {methodRequiresRoute(payChoice) ? (
                            <div className="mb-3">
                              <label
                                htmlFor="bank-route"
                                className="block text-sm font-medium text-neutral-900"
                              >
                                Select Bank / Transfer Route{" "}
                                <span className="text-red-600" aria-hidden="true">
                                  *
                                </span>
                              </label>
                              <p className="mb-2 mt-0.5 text-[11px] leading-relaxed text-neutral-600">
                                Tells us which account details to send you. No
                                account numbers are shown or stored here.
                              </p>
                              <select
                                id="bank-route"
                                required
                                aria-required="true"
                                value={bankRoute}
                                onChange={(e) => setBankRoute(e.target.value)}
                                className="box-border w-full max-w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-accent"
                              >
                                <option value="">Choose your transfer route…</option>
                                {BANK_ROUTES.filter((route) => route.enabled).map(
                                  (route) => (
                                    <option key={route.id} value={route.id}>
                                      {route.label}
                                    </option>
                                  )
                                )}
                              </select>
                              {!bankRoute ? (
                                <p className="mt-1.5 text-[11px] font-medium text-neutral-600">
                                  Required before you can place the order.
                                </p>
                              ) : null}
                            </div>
                          ) : null}

                          {/*
                            One paragraph for every manual method, because it
                            is genuinely how all of them work: the order is
                            placed, it is reviewed, the details are emailed, the
                            order waits as Awaiting Payment, and it ships only
                            once payment is received and verified. Only Bank
                            Transfer has a further question to ask, above.

                            Owner-supplied wording. "Awaiting Payment" keeps the
                            bold it had, because it is the exact status label the
                            customer will see on their order page.
                          */}
                          <p className="text-[11px] leading-relaxed text-neutral-600">
                            Place your order now and DrivoraParts will email
                            your payment details after the order is reviewed.
                            Your order will remain{" "}
                            <strong className="font-semibold text-neutral-800">
                              Awaiting Payment
                            </strong>{" "}
                            until payment is received and verified. Orders are
                            shipped after payment has been received and
                            verified.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
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

                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <OrderTotalsSummary breakdown={breakdown} />


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

              <p className="mb-3 text-xs leading-relaxed text-neutral-600">
                {BUYER_PROTECTION_CHECKOUT_STATEMENT}{" "}
                <Link
                  href={BUYER_PROTECTION_HREF}
                  prefetch={false}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2 hover:text-accent-hover"
                >
                  DrivoraParts Buyer Protection
                  <span className="sr-only"> (opens in a new tab)</span>
                </Link>{" · "}
                <Link
                  href={RETURN_POLICY_HREF}
                  prefetch={false}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2 hover:text-accent-hover"
                >
                  Refund Policy
                  <span className="sr-only"> (opens in a new tab)</span>
                </Link>
              </p>

              <button
                type="button"
                onClick={handleCheckout}
                /*
                  Deliberately NOT disabled when no method is chosen: a dead
                  button explains nothing, and that is now the state checkout
                  opens in. handleCheckout blocks the submit and says why.
                  A missing bank route still disables, because that case
                  already carries its own always-visible "Required before you
                  can place the order" line under the route selector.
                */
                disabled={
                  submitting || (methodRequiresRoute(payChoice) && !bankRoute)
                }
                className="box-border w-full max-w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60 disabled:active:scale-100"
              >
                {submitting
                  ? t("processing")
                  : payChoice === "crypto"
                    ? t("payNow")
                    : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
