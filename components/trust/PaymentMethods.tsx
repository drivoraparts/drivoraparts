/**
 * The payment methods DrivoraParts actually accepts.
 *
 * WHY VISA AND MASTERCARD ARE NOT HERE
 * The brief asked for card marks only if cards are genuinely available, and
 * they are not. getDefaultPaymentProvider() returns the NOWPayments provider,
 * the invoice is created with a crypto pay_currency, and the checkout page
 * tells customers in as many words that to use a debit or credit card they
 * must buy crypto first at a third-party exchange. The site's own trust copy
 * says "no bank or card required". A Visa mark in this row would advertise a
 * rail this store does not have, which is the one thing the brief rules out.
 *
 * If card payment is ever enabled -- NOWPayments does offer fiat on-ramps --
 * the marks belong here and the copy below should change with them.
 *
 * WHICH COINS
 * BTC, ETH and USDT are the three the site already names, in the checkout and
 * in the trust content. Everything beyond them is chosen by the customer on
 * the NOWPayments invoice, which is why the note says 300+ rather than
 * listing coins this codebase cannot enumerate. The exact set enabled lives in
 * the NOWPayments dashboard, not in this repository.
 *
 * WHY THE COIN LOGOS SIT ON WHITE
 * They are official files used unmodified -- the Bitcoin wordmark is #4d4d4d
 * and would be invisible on this section's near-black ground, and recolouring
 * it is not permitted. A plain white chip is the smallest thing that lets each
 * logo render exactly as its owner drew it. The NOWPayments mark is the
 * exception: its official file carries its own dark plate, so it sits directly
 * on the section.
 *
 * Every file here came from the brand's own site:
 *   bitcoin.svg   bitcoin.org/img/icons/logotop.svg
 *   ethereum.png  ethereum.org brand assets, landscape purple
 *   tether.svg    tether.to media page, logoGreen
 *   nowpayments   already bundled, the official dark-background variant
 */

import { MANUAL_METHODS } from "@/lib/payments/manual-methods";

type Coin = {
  name: string;
  src: string;
  /** Tailwind height. Set per logo so the marks read as optically equal. */
  height: string;
  width: number;
  intrinsicHeight: number;
};

const COINS: Coin[] = [
  {
    name: "Bitcoin",
    src: "/trust/bitcoin.svg",
    height: "h-5 sm:h-6",
    width: 190,
    intrinsicHeight: 40,
  },
  {
    // Set a step larger than the others on purpose. The official landscape
    // logo is drawn in a light purple-grey, so at an identical height it
    // reads as fainter than the Bitcoin orange and Tether green beside it.
    // Scaling is allowed; recolouring it to match is not.
    name: "Ethereum",
    src: "/trust/ethereum.png",
    height: "h-6 sm:h-7",
    width: 800,
    intrinsicHeight: 201,
  },
  {
    name: "Tether USDt",
    src: "/trust/tether.svg",
    height: "h-4 sm:h-5",
    width: 124,
    intrinsicHeight: 27,
  },
];

/**
 * How each direct-payment method is presented, keyed by its MANUAL_METHODS id.
 *
 * VENMO is the official wordmark, downloaded from PayPal's own corporate
 * newsroom (newsroom.paypal-corp.com -> Venmo_Logos_and_Guidelines.zip) and
 * used unmodified. The white variant is the one Venmo ships for dark grounds,
 * and it carries its own alpha channel, so it needs no plate behind it.
 *
 * CASH APP is type, not a logo, and not by choice: every official first-party
 * source refused this environment. cash.app answers 403 through Cloudflare,
 * and the asset host behind developers.cash.app
 * (fdr-prod-docs-files-public.s3.us-east-1.amazonaws.com) answers 403
 * AccessDenied to curl and to a real browser alike. A third-party logo site,
 * a recreation or a trace are all worse than type, so the wordmark stays as
 * type until the official file can be fetched -- at which point it drops in
 * here as `logo` and nothing else changes.
 *
 * ZELLE shows its own logo tile beside the name. The file was supplied by the
 * owner; Zelle's trademark guidelines reserve the logo to licensees, and
 * showing it was the owner's decision.
 *
 * BANK TRANSFER uses the coloured bank icon the owner supplied -- the same
 * mark checkout uses. INTERNATIONAL WIRE keeps the icon drawn for this site.
 * A transfer is a route, not a brand; neither borrows a real institution's
 * mark.
 */
const METHOD_VISUALS: Record<
  string,
  { logo?: string; icon?: string; text?: string }
> = {
  bank_transfer: { icon: "/trust/bank-transfer-mark.png" },
  wire: { icon: "/trust/icon-wire-transfer.svg" },
  venmo: { logo: "/trust/venmo-logo-white.png" },
  zelle: { icon: "/trust/zelle-mark.png" },
  cash_app: { text: "Cash App" },
};

export default function PaymentMethods() {
  const directMethods = MANUAL_METHODS.filter((method) => method.enabled);

  return (
    <div className="rounded-[3px] border border-neutral-800 bg-neutral-900/60 p-5 sm:p-7">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">
        Payment methods
      </p>

      {/*
        Direct payment, first -- it now matches checkout, where the manual
        methods sit above the crypto option.

        The list is derived from MANUAL_METHODS rather than typed out, so a
        method added, renamed or disabled in that one file changes here too and
        this panel can never advertise a rail checkout does not actually offer.
        That is also why regional variants (SEPA, UK, PayID) are not named
        separately: they are all served by Bank Transfer, whose details are sent
        per order, and listing them as distinct options would promise a choice
        the customer is never shown.
      */}
      <div className="mt-5 border-b border-neutral-800 pb-5">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          Direct payment
        </p>
        <ul className="flex flex-wrap items-center gap-2">
          {directMethods.map((method) => {
            const visual = METHOD_VISUALS[method.id];
            return (
              <li
                key={method.id}
                className="flex h-9 items-center gap-2 rounded-[3px] border border-neutral-700 px-3"
              >
                {visual?.icon ? (
                  <img
                    src={visual.icon}
                    alt=""
                    aria-hidden="true"
                    width={32}
                    height={32}
                    loading="lazy"
                    decoding="async"
                    className="h-4 w-auto shrink-0 opacity-90"
                  />
                ) : null}

                {visual?.logo ? (
                  // The official wordmark already reads "Venmo", so it stands
                  // in for the label rather than sitting beside a duplicate.
                  <img
                    src={visual.logo}
                    alt={method.label}
                    width={1400}
                    height={265}
                    loading="lazy"
                    decoding="async"
                    className="h-3 w-auto"
                  />
                ) : (
                  <span className="text-xs font-medium text-neutral-200">
                    {visual?.text ?? method.label}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-neutral-400">
          Pay directly and we email you the details for your order. Your order is
          reserved and ships once DrivoraParts confirms the payment has arrived.
        </p>
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        Cryptocurrency
      </p>

      <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
        {/* The processor, first and largest: it is the answer to "who takes my
            money", which is the question this section exists to settle. */}
        <div className="shrink-0">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Processed by
          </p>
          <img
            src="/trust/nowpayments-mark.svg"
            alt="Payments processed by NOWPayments"
            width={250}
            height={55}
            loading="lazy"
            decoding="async"
            className="h-11 w-auto sm:h-12"
          />
        </div>

        <div
          aria-hidden="true"
          className="hidden h-16 w-px shrink-0 bg-neutral-800 lg:block"
        />

        <div className="min-w-0">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Accepted at checkout
          </p>
          <ul className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {COINS.map((coin) => (
              <li
                key={coin.name}
                className="flex h-12 items-center justify-center rounded-[3px] bg-white px-4 sm:h-14 sm:px-5"
              >
                <img
                  src={coin.src}
                  alt={coin.name}
                  width={coin.width}
                  height={coin.intrinsicHeight}
                  loading="lazy"
                  decoding="async"
                  className={`${coin.height} w-auto`}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/*
        Says what the row does not, in both directions.

        DrivoraParts never touches a card: the invoice is crypto, and no card
        mark belongs in the row above. But a customer without crypto is not
        stuck, and the checkout already points them at ChangeNOW to buy some
        with a card. Leaving that out of the trust panel answers "can I pay by
        card?" with silence, which reads as no. This says what is actually
        true: not here, but there, and then back here.
      */}
      <p className="mt-5 border-t border-neutral-800 pt-4 text-xs leading-relaxed text-neutral-400">
        Bitcoin, Ethereum and Tether shown — 300+ coins selectable on the
        NOWPayments invoice.{" "}
        <span className="text-neutral-300">No bank account needed.</span>
      </p>

      {/*
        The card route, given its own row rather than a clause in the note
        above it.

        It is deliberately separate from "Accepted at checkout": that row is
        what DrivoraParts takes, and a card is not one of those things. This
        is a route that begins with a card and ends in crypto, and the label
        names the party that actually takes the card.

        The official Visa and Mastercard marks belong in this row. They are
        not here because both brand centres gate their downloads behind
        registration -- brand.mastercard.com answers 403 to every asset path
        and renders empty without a session, and brand.visa.com does not
        resolve at all. The alternatives are all ruled out: no third-party
        logo sites, no redrawing, no AI, no screenshots. So the row ships as
        type until the real files arrive, and the marks drop in here.
      */}
      <div className="mt-4 border-t border-neutral-800 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          Pay by card via ChangeNOW
        </p>
        <p className="mt-2 text-xs leading-relaxed text-neutral-400">
          DrivoraParts does not process card payments itself. Buy crypto with
          a Visa or Mastercard debit or credit card at{" "}
          <a
            href="https://changenow.io/"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-neutral-200 underline decoration-neutral-600 underline-offset-2 transition-colors hover:text-accent-on-dark"
          >
            ChangeNOW
          </a>
          , then complete your order — the same route checkout links to.
        </p>
      </div>
    </div>
  );
}
