const BADGES = [
  { label: "Secure Checkout", subtext: "SSL protected transaction" },
  { label: "Verified Listings", subtext: "Real photos, honest specs" },
  { label: "Freight Ready", subtext: "Beds & shells shipped LTL" },
  { label: "Crypto Accepted", subtext: "Secure worldwide checkout" },
] as const;

/** Static trust row for homepage — no client JS or backdrop blur. */
export default function HomeTrustBadges() {
  return (
    <section
      className="border-y border-neutral-200 bg-white px-4 py-10 sm:px-6"
      aria-label="Purchase trust assurances"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
          Shop with confidence
        </p>
        <h2 className="mt-1 text-lg font-bold text-neutral-900">
          Verified marketplace protections
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BADGES.map((badge) => (
            <li
              key={badge.label}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3"
            >
              <p className="text-sm font-semibold text-neutral-900">{badge.label}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{badge.subtext}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
