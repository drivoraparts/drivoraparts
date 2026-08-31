import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import { routes } from "@/lib/inventory/routes";
import { directAssetUrl } from "@/lib/media/optimize-image";

export default function HomeStatementBanner() {
  return (
    <section
      className="relative overflow-hidden px-4 py-24 text-center text-white sm:px-6 sm:py-32"
      aria-label="Every great build starts somewhere"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={directAssetUrl("/home/pexels-matreding-9381019.jpg")}
          alt=""
          loading="lazy"
          decoding="async"
          sizes="100vw"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-neutral-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/60" />
      </div>

      <ScrollReveal className="relative z-10 mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          Every Great Build Starts Somewhere
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-neutral-300 sm:text-base">
          Built by enthusiasts. Trusted by workshops. Powered by real inventory.
        </p>
        <Link
          href={routes.all}
          prefetch={false}
          className="mt-9 inline-block touch-manipulation rounded-full bg-accent px-10 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-accent-hover active:bg-accent-active"
        >
          Start Browsing
        </Link>
      </ScrollReveal>
    </section>
  );
}
