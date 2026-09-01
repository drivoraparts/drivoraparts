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

export default function PaymentMethods() {
  return (
    <div className="rounded-[3px] border border-neutral-800 bg-neutral-900/60 p-5 sm:p-7">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">
        Payment methods
      </p>

      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
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
