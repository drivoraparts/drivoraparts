import ScrollReveal from "./ScrollReveal";
import { directAssetUrl } from "@/lib/media/optimize-image";
import {
  AUSTRALIA_LOGISTICS_HUB,
  JAPAN_LOGISTICS_HUB,
} from "@/lib/content/company";

type Reason = {
  title: string;
  detail: string;
  icon: React.ReactNode;
};

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const REASONS: (Reason & { accent?: "red" })[] = [
  {
    title: "OEM & Aftermarket, One Catalog",
    detail: "Genuine takeout parts and performance aftermarket, side by side.",
    icon: (
      <IconWrap>
        <path d="M3 7l9-4 9 4-9 4-9-4z" />
        <path d="M3 12l9 4 9-4M3 17l9 4 9-4" />
      </IconWrap>
    ),
  },
  {
    title: "Dedicated Support",
    detail: "Real people on live chat and email for fitment and freight questions.",
    icon: (
      <IconWrap>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </IconWrap>
    ),
  },
  {
    title: "Performance Tested",
    detail: "Every listing is checked for accurate condition before it ships.",
    accent: "red",
    icon: (
      <IconWrap>
        <path d="M12 2l2.4 6.6L21 9l-5 4.6L17.4 21 12 17.3 6.6 21 8 13.6 3 9l6.6-.4z" />
      </IconWrap>
    ),
  },
  {
    title: "Freight-Grade Packaging",
    detail: "Engines and transmissions crated and protected for long-haul shipping.",
    icon: (
      <IconWrap>
        <rect x="3" y="7" width="18" height="13" rx="1.5" />
        <path d="M3 7l9-4 9 4M8 11h8" />
      </IconWrap>
    ),
  },
  {
    title: "Worldwide Reach",
    detail: `Shipping coordinated from our US, ${JAPAN_LOGISTICS_HUB.country}, and ${AUSTRALIA_LOGISTICS_HUB.country} logistics hubs, globally.`,
    icon: (
      <IconWrap>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z" />
      </IconWrap>
    ),
  },
  {
    title: "Fast Order Processing",
    detail: "Orders are reviewed and moved to fulfillment quickly, not queued for days.",
    accent: "red",
    icon: (
      <IconWrap>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </IconWrap>
    ),
  },
];

export default function WhyDrivoraSection() {
  return (
    <section
      className="border-b border-neutral-200 bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      aria-label="Why buy from DrivoraParts"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <ScrollReveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            Why Drivora
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl lg:text-[2rem]">
            Built by people who know what a real build takes
          </h2>

          <dl className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2">
            {REASONS.map((reason) => (
              <div key={reason.title} className="flex gap-3">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    reason.accent === "red"
                      ? "bg-accent-subtle text-accent"
                      : "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {reason.icon}
                </div>
                <div>
                  <dt className="text-sm font-bold text-neutral-900">
                    {reason.title}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-neutral-600">
                    {reason.detail}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </ScrollReveal>

        <ScrollReveal delayMs={120} className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[5/6]">
            <img
              src={directAssetUrl("/home/pexels-artempodrez-8986047.jpg")}
              alt="Technician inspecting a cylinder head before it ships"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="h-full w-full object-cover"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
