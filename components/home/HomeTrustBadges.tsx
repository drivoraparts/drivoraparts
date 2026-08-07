import Link from "next/link";
import NowPaymentsMark from "@/components/trust/NowPaymentsMark";
import TrustSealGraphic from "@/components/trust/TrustSealGraphic";
import {
  TRUST_POLICY_LINKS,
  TRUST_PROOF,
  TRUST_SECTION,
  TRUST_SIGNALS,
} from "@/lib/content/trust-signals";

/** Homepage trust band — factual company signals with seal artwork. */
export default function HomeTrustBadges() {
  return (
    <section
      className="relative overflow-hidden border-y border-neutral-800 bg-neutral-950 px-4 py-14 text-white sm:px-6 sm:py-16"
      aria-label="Why buyers trust DrivoraParts"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-red-600/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-400">
            {TRUST_SECTION.eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2rem]">
            {TRUST_SECTION.headline}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
            {TRUST_SECTION.subhead}
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TRUST_SIGNALS.map((signal) => (
            <li
              key={signal.id}
              className="group flex flex-col items-center rounded-2xl border border-neutral-800/90 bg-neutral-900/70 px-4 py-6 text-center shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-colors hover:border-neutral-700 hover:bg-neutral-900"
            >
              <div className="rounded-full text-neutral-300 ring-1 ring-white/10 transition-transform group-hover:scale-105">
                <TrustSealGraphic
                  kind={signal.seal}
                  className="h-[4.5rem] w-[4.5rem] shrink-0"
                />
              </div>
              <p className="mt-4 text-sm font-bold text-white">{signal.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                {signal.detail}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
              Registered business
            </p>
            <p className="mt-2 text-lg font-bold text-white">{TRUST_PROOF.legalName}</p>
            <address className="mt-3 not-italic text-sm leading-relaxed text-neutral-300">
              {TRUST_PROOF.usStreet}
              <br />
              {TRUST_PROOF.usCityLine}
              <br />
              {TRUST_PROOF.usCountry}
            </address>
            <p className="mt-4 text-xs text-neutral-500">
              Distribution hub · {TRUST_PROOF.japanLine}
            </p>
            <a
              href={`mailto:${TRUST_PROOF.supportEmail}`}
              className="mt-3 inline-block text-sm font-semibold text-red-400 transition-colors hover:text-red-300"
            >
              {TRUST_PROOF.supportEmail}
            </a>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 sm:p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                Checkout partner
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <NowPaymentsMark className="h-10 w-auto max-w-[180px]" />
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
                  <span
                    className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400"
                    aria-hidden
                  />
                  <span className="text-xs font-semibold text-emerald-200">
                    Live · TLS encrypted
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                Bitcoin, Ethereum, USDT, and 300+ coins. Same secure rails used at checkout
                today — not a placeholder badge.
              </p>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-neutral-800 pt-5">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Listings
                </dt>
                <dd className="mt-1 text-xl font-bold text-white">
                  {TRUST_PROOF.listingCount.toLocaleString()}+
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Freight
                </dt>
                <dd className="mt-1 text-sm font-bold text-white">LTL worldwide</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-5 border-t border-neutral-800 pt-8">
          <p className="max-w-3xl text-center text-xs leading-relaxed text-neutral-500">
            {TRUST_SECTION.legalLine} · {TRUST_SECTION.listingStat}
          </p>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-neutral-300"
            aria-label="Trust and policy links"
          >
            {TRUST_POLICY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-red-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
