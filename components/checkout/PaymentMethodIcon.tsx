/**
 * Payment-method marks for the checkout selector.
 *
 * Replaces the emoji that used to sit on each card. Two kinds of mark appear
 * here:
 *
 *  - IMAGE MARKS, every one served from our own origin (see BRAND_MARKS).
 *    Venmo, Cash App and Bitcoin are official brand files used unmodified.
 *    Venmo's is the BLUE variant because checkout is a light surface. Bank
 *    Transfer, Zelle and PayPal use marks the owner supplied: a coloured bank
 *    icon, Zelle's logo tile and PayPal's PP monogram. Zelle's trademark
 *    guidelines reserve its logo to licensees; showing it here was the
 *    owner's decision.
 *
 *  - A GENERIC LINE ICON, drawn here, for International Wire. A wire is a
 *    route rather than a brand, so borrowing a real bank's or network's mark
 *    would imply a relationship that does not exist.
 *
 * WHY THE COLUMN IS A FIXED WIDTH
 * Venmo, Cash App and Bitcoin are wordmarks -- Venmo is 1400x265, Bitcoin
 * 300x63 -- not square icons. Fitting one into a 20px square renders it about
 * four pixels tall and illegible. So every mark gets the same fixed-width,
 * fixed-height box and sits left-aligned inside it: line icons and square
 * marks keep their square, wordmarks scale to a readable height, and the
 * labels beside them still line up down the column. Nothing is stretched,
 * recoloured or cropped.
 *
 * The line icons use currentColor, so one component serves the light checkout
 * and any dark surface without a second set of files.
 */

type IconId =
  | "bank_transfer"
  | "wire"
  | "zelle"
  | "cash_app"
  | "venmo"
  | "paypal"
  | "crypto";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Uniform mark column: same box for every method, so labels align. */
const BOX = "flex h-5 w-14 shrink-0 items-center justify-start text-neutral-700";
const GLYPH = "h-[18px] w-[18px]";
/** Wordmarks: height-matched to the glyphs' optical weight, width natural. */
const WORDMARK = "h-3 w-auto max-w-full object-contain object-left";

/** Fallback for a method with no mark of its own. */
function BankGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={GLYPH} aria-hidden="true">
      <g {...STROKE}>
        <path d="M3 9.5 12 4l9 5.5" />
        <path d="M5.5 9.5v9M10 9.5v9M14 9.5v9M18.5 9.5v9" />
        <path d="M3 19.5h18" />
      </g>
    </svg>
  );
}

function GlobeGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={GLYPH} aria-hidden="true">
      <g {...STROKE}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17" />
        <path d="M12 3.5c2.3 2.4 3.5 5.3 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.3-3.5-8.5S9.7 5.9 12 3.5Z" />
      </g>
    </svg>
  );
}

/**
 * Image marks, every one served from our own origin.
 *
 * Cash App's lockup finally arrives here from Block's own CDN
 * (static.afterpaycdn.com -- Afterpay and Cash App are both Block), which is
 * reachable where every cash.app and S3 path answered 403. It is stored in
 * public/trust like the others rather than hotlinked, so a third-party host
 * going down cannot leave an empty box on the payment step.
 *
 * `className` sizes a mark; wordmarks default to WORDMARK. The square marks
 * sit at the line icons' size so the column still reads as one set.
 */
const BRAND_MARKS: Record<
  string,
  { src: string; w: number; h: number; className?: string }
> = {
  venmo: { src: "/trust/venmo-logo-blue.png", w: 1400, h: 265 },
  cash_app: { src: "/trust/cashapp-pay.svg", w: 180, h: 32 },
  // 300x63 is what the browser reports as this file's intrinsic size; the
  // viewBox alone (0 0 190 40) is not the whole story. These are a layout hint
  // to reserve the right aspect box and avoid shift.
  crypto: { src: "/trust/bitcoin.svg", w: 300, h: 63 },
  // The owner-supplied marks all arrived as JPEGs, which carry no
  // transparency: the bank icon on solid black, Zelle's tile on a grey
  // margin, PayPal's monogram on white. Each was cut out onto a transparent
  // ground -- the bank's black outline rebuilt where it met the backdrop,
  // Zelle cropped to its tile -- and is otherwise as supplied. The bank icon
  // keeps its canvas padding, so it gets the full 20px box.
  bank_transfer: {
    src: "/trust/bank-transfer-mark.png",
    w: 256,
    h: 256,
    className: "h-5 w-5",
  },
  zelle: {
    src: "/trust/zelle-mark.png",
    w: 196,
    h: 196,
    className: GLYPH,
  },
  paypal: {
    src: "/trust/paypal-mark.png",
    w: 209,
    h: 209,
    className: GLYPH,
  },
};

export default function PaymentMethodIcon({ id }: { id: string }) {
  const mark = BRAND_MARKS[id];

  if (mark) {
    return (
      <span className={BOX}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mark.src}
          alt=""
          aria-hidden="true"
          width={mark.w}
          height={mark.h}
          loading="lazy"
          decoding="async"
          className={mark.className ?? WORDMARK}
        />
      </span>
    );
  }

  const glyph: Partial<Record<IconId, React.ReactNode>> = {
    wire: <GlobeGlyph />,
  };

  return <span className={BOX}>{glyph[id as IconId] ?? <BankGlyph />}</span>;
}
