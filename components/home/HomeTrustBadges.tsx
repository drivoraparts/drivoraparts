import Link from "next/link";
import NowPaymentsMark from "@/components/trust/NowPaymentsMark";
import TrustSealGraphic from "@/components/trust/TrustSealGraphic";
import {
  TRUST_CATEGORIES,
  TRUST_POLICY_LINKS,
  TRUST_SECTION,
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

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col rounded-2xl border border-neutral-800/90 bg-neutral-900/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-colors hover:border-neutral-700 hover:bg-neutral-900 sm:p-6"
            >
              <div className="flex items-center gap-2.5">
                <TrustSealGraphic kind={cat.seal} className="h-8 w-8 shrink-0 text-neutral-400" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                  {cat.eyebrow}
                </p>
              </div>

              <h3 className="mt-4 text-base font-bold leading-snug text-white">
                {cat.headline}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{cat.detail}</p>

              {cat.id === "payments" ? (
                <NowPaymentsMark className="mt-4 h-7 w-auto" />
              ) : null}

              <div className="mt-4 flex flex-wrap gap-1.5">
                {cat.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-neutral-700 bg-neutral-800/60 px-2.5 py-1 text-[10px] font-semibold text-neutral-300"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          ))}
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
