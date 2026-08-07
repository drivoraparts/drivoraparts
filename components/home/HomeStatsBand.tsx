import CountUpNumber from "./CountUpNumber";
import ScrollReveal from "./ScrollReveal";
import { getHomeStats } from "@/lib/home/stats";

export default function HomeStatsBand() {
  const stats = getHomeStats();

  const numberStats = [
    { label: "Products", value: stats.listings, suffix: "+" },
    { label: "Brands", value: stats.brands, suffix: "+" },
    { label: "Categories", value: stats.categories, suffix: "" },
  ];

  const badgeStats = ["Worldwide Shipping", "Secure Checkout", "Registered U.S. Business"];

  return (
    <section
      className="border-b border-neutral-800 bg-neutral-900 px-4 py-14 sm:px-6 sm:py-16"
      aria-label="DrivoraParts by the numbers"
    >
      <ScrollReveal className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-3">
          {numberStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                <CountUpNumber value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3 border-t border-neutral-800 pt-8">
          {badgeStats.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-neutral-700 bg-neutral-800/60 px-4 py-2 text-xs font-semibold text-neutral-300"
            >
              {badge}
            </span>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
