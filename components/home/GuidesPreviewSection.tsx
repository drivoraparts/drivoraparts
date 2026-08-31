import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

const GUIDE_PREVIEWS = [
  {
    slug: "oem-vs-aftermarket",
    title: "OEM vs. Aftermarket",
    summary: "Which one actually makes sense for your build.",
  },
  {
    slug: "ls-swap-guide",
    title: "LS Swap Guide",
    summary: "What to plan for before you drop one in.",
  },
  {
    slug: "suspension-upgrades",
    title: "Best Suspension Upgrades",
    summary: "What to upgrade first, and why.",
  },
  {
    slug: "engine-buying-guide",
    title: "Engine Buying Guide",
    summary: "What to check before you commit to a used or crate engine.",
  },
  {
    slug: "transmission-guide",
    title: "Transmission Guide",
    summary: "Matching a transmission to your engine and how you drive.",
  },
  {
    slug: "turbocharger-basics",
    title: "Turbocharger Basics",
    summary: "How sizing changes the way a car drives.",
  },
] as const;

export default function GuidesPreviewSection() {
  return (
    <section
      className="border-b border-neutral-200 bg-neutral-50 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      aria-label="Buying guides"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              Know Before You Buy
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Buying guides from the DrivoraParts team
            </h2>
          </div>
          <Link
            href="/guides"
            prefetch={false}
            className="text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            All guides →
          </Link>
        </ScrollReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDE_PREVIEWS.map((guide, index) => (
            <ScrollReveal key={guide.slug} delayMs={index * 80}>
              <Link
                href={`/guides#${guide.slug}`}
                prefetch={false}
                className="group block h-full rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-accent-border hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
              >
                <h3 className="text-base font-bold text-neutral-900">
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {guide.summary}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors group-hover:text-accent-hover">
                  Read guide
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
