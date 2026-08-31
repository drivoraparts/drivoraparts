import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { routes } from "@/lib/inventory/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Buying Guides",
  description:
    "Straightforward guides on OEM vs. aftermarket parts, engine swaps, suspension upgrades, and more — from the DrivoraParts team.",
  path: "/guides",
});

type Guide = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  shopHref: string;
  shopLabel: string;
};

const GUIDES: Guide[] = [
  {
    slug: "oem-vs-aftermarket",
    title: "OEM vs. Aftermarket: Which Should You Buy?",
    summary: "The real tradeoffs between factory-original and aftermarket parts.",
    body: "OEM (Original Equipment Manufacturer) parts are made to the exact spec your vehicle shipped with — the safest bet for fit and factory behavior, especially on safety-critical systems like brakes and suspension. Aftermarket parts are made by third-party manufacturers and range from budget equivalents to performance upgrades that exceed factory spec. For routine replacement, OEM or OEM-equivalent keeps things predictable. For power, handling, or styling gains, a reputable aftermarket brand is usually the better call. The deciding factors: how the vehicle is used, how long you plan to keep it, and whether you're replacing like-for-like or upgrading.",
    shopHref: routes.all,
    shopLabel: "Browse all parts",
  },
  {
    slug: "ls-swap-guide",
    title: "LS Swap Guide: What to Plan For",
    summary: "The basics before you drop an LS into something it wasn't born in.",
    body: "LS swaps are popular because the platform is compact, light for its output, and backed by a huge aftermarket. Before sourcing an engine, plan the full package: engine, transmission, motor mounts, wiring harness/ECU, and exhaust routing all need to match. Decide early between a takeout engine (cheaper, known mileage varies) and a crate engine (new, warrantied, costs more). Budget for accessory drive and cooling changes too — most swaps aren't just engine-in, they're a small systems integration project.",
    shopHref: routes.category("engine"),
    shopLabel: "Shop engines",
  },
  {
    slug: "suspension-upgrades",
    title: "Best Suspension Upgrades, in Order",
    summary: "What actually moves the needle, and in what order to do it.",
    body: "Start with shocks/struts and springs — they define ride quality and handling more than any single other component. From there, sway bars sharpen body control in corners with a relatively small spend. Bushings (especially polyurethane replacements for worn factory rubber) tighten up steering feel cheaply. Coilovers combine spring and damper adjustability into one setup and are usually the right move once you're past bolt-on parts. Alignment after any suspension change isn't optional — it's part of the job, not an add-on.",
    shopHref: routes.category("suspension"),
    shopLabel: "Shop suspension",
  },
  {
    slug: "engine-buying-guide",
    title: "Engine Buying Guide: What to Check",
    summary: "The questions to ask before you commit to a used or crate engine.",
    body: "For a used/takeout engine: ask for mileage, compression numbers if available, and whether it's a running-and-driving pull versus a non-running core. Check what's included — long block only, or complete with accessories, turbo, and sensors. For a crate engine: confirm the exact spec (displacement, power rating, control system requirements) matches your swap plan, and check warranty terms. Either way, match the bellhousing pattern to your transmission before you buy, not after.",
    shopHref: routes.category("engine"),
    shopLabel: "Shop engines",
  },
  {
    slug: "transmission-guide",
    title: "Transmission Guide: Manual vs. Automatic Swaps",
    summary: "Matching a transmission to your engine and how you actually drive.",
    body: "Manual transmissions give direct control and are generally simpler to swap, but require a clutch, flywheel, and pedal/linkage setup to match. Automatics need a compatible ECU/TCU pairing and a torque converter matched to the build. In both cases, the transmission must physically bolt to your engine's bellhousing pattern — that's the first fitment check, before power rating or gear ratios. If you're chasing a specific driving feel (track duty vs. daily commuting), that should drive the choice more than raw horsepower rating.",
    shopHref: routes.category("transmission"),
    shopLabel: "Shop transmissions",
  },
  {
    slug: "turbocharger-basics",
    title: "Turbocharger Basics",
    summary: "How turbo sizing actually affects the way a car drives.",
    body: "A turbo's size determines its character: smaller turbos spool fast with less lag but run out of breath at high RPM, while larger turbos make more peak power but come on later. Match turbo size to your goal — a daily-driven street car usually wants quick spool over outright peak numbers, while a track or drag build can tolerate more lag for bigger top-end power. Supporting mods matter as much as the turbo itself: fueling, intercooling, and a tune capable of controlling boost safely are part of the package, not optional extras.",
    shopHref: routes.category("turbocharger"),
    shopLabel: "Shop turbochargers",
  },
];

export default function GuidesPage() {
  return (
    <main className="mx-auto max-w-3xl bg-white px-6 py-12 text-neutral-900">
      <h1 className="mb-2 text-4xl font-bold">Buying Guides</h1>
      <p className="mb-10 text-neutral-600">
        Straightforward guidance for planning your next build — no fluff.
      </p>

      <div className="space-y-10">
        {GUIDES.map((guide) => (
          <article
            key={guide.slug}
            id={guide.slug}
            className="scroll-mt-24 border-b border-neutral-200 pb-10 last:border-b-0"
          >
            <h2 className="text-xl font-bold text-neutral-900">{guide.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {guide.body}
            </p>
            <Link
              href={guide.shopHref}
              prefetch={false}
              className="mt-4 inline-block text-sm font-semibold text-accent hover:text-accent-hover"
            >
              {guide.shopLabel} →
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center">
        <p className="text-sm text-neutral-600">
          Have a specific build question?{" "}
          <Link href="/contact" className="text-accent hover:text-accent-hover">
            Ask our team
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
