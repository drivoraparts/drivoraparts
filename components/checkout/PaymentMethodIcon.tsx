/**
 * Payment-method marks for the checkout selector.
 *
 * Replaces the emoji that used to sit on each card. Three kinds of mark appear
 * here, and which one a method gets is not a style choice:
 *
 *  - OFFICIAL BRAND ASSETS, used unmodified, for Venmo and Bitcoin. Venmo's
 *    mark comes from PayPal's own newsroom bundle (Venmo has no separate press
 *    site); the BLUE variant is used here because checkout is a light surface,
 *    where the white variant the footer uses would be invisible. bitcoin.svg is
 *    the official wordmark already in the repo.
 *
 *  - GENERIC LINE ICONS, drawn here, for Bank Transfer and International Wire.
 *    A transfer is a route rather than a brand, so borrowing a real bank's or
 *    network's mark would imply a relationship that does not exist.
 *
 *  - GENERIC LINE ICONS BESIDE THE TEXT NAME for Zelle and Cash App. Zelle's
 *    trademark guidelines reserve stylized marks and logos to licensees and
 *    extend fair use to plain standard-character references only, so its logo
 *    must not be drawn even if a file were available. Cash App has no logo
 *    because every official first-party source refuses this environment
 *    (cash.app answers 403, and the S3 host behind developers.cash.app answers
 *    403 AccessDenied to curl and to a browser alike). A recreation or a
 *    third-party copy would be worse than type, so it waits for the real file.
 *
 * WHY THE COLUMN IS A FIXED WIDTH
 * Both brand assets are wordmarks -- Venmo is 1400x265, Bitcoin 300x63 -- not
 * square icons. Fitting either into a 20px square renders it about four pixels
 * tall and illegible. So every mark gets the same fixed-width, fixed-height
 * box and sits left-aligned inside it: line icons keep their square, wordmarks
 * scale to a readable height, and the labels beside them still line up down
 * the column. Nothing is stretched, recoloured or cropped.
 *
 * The line icons use currentColor, so one component serves the light checkout
 * and any dark surface without a second set of files.
 */

type IconId = "bank_transfer" | "wire" | "zelle" | "cash_app" | "venmo" | "crypto";

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

/** Bank-to-bank send, for Zelle. */
function SendGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={GLYPH} aria-hidden="true">
      <g {...STROKE}>
        <path d="M20.5 3.5 10.5 13.5" />
        <path d="M20.5 3.5 14 20.5l-3.5-7-7-3.5Z" />
      </g>
    </svg>
  );
}

/** Cash/value transfer, for Cash App while its official mark is unobtainable. */
function CashGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={GLYPH} aria-hidden="true">
      <g {...STROKE}>
        <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6 10v4M18 10v4" />
      </g>
    </svg>
  );
}

export default function PaymentMethodIcon({ id }: { id: string }) {
  if (id === "venmo" || id === "crypto") {
    const brand =
      id === "venmo"
        ? { src: "/trust/venmo-logo-blue.png", w: 1400, h: 265 }
        // 300x63 is what the browser reports as this file's intrinsic size;
        // the viewBox alone (0 0 190 40) is not the whole story. These are a
        // layout hint to reserve the right aspect box and avoid shift.
        : { src: "/trust/bitcoin.svg", w: 300, h: 63 };

    return (
      <span className={BOX}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.src}
          alt=""
          aria-hidden="true"
          width={brand.w}
          height={brand.h}
          loading="lazy"
          decoding="async"
          className={WORDMARK}
        />
      </span>
    );
  }

  const glyph: Partial<Record<IconId, React.ReactNode>> = {
    bank_transfer: <BankGlyph />,
    wire: <GlobeGlyph />,
    zelle: <SendGlyph />,
    cash_app: <CashGlyph />,
  };

  return <span className={BOX}>{glyph[id as IconId] ?? <BankGlyph />}</span>;
}
