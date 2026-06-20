import Link from "next/link";

/* =========================================================
   UNIFIED CATALOG CARD (ONE INTERACTION SYSTEM)
   ---------------------------------------------------------
   Single red/white accent. Identical hover glow, red bottom
   pulse line, active tap scale, and 300ms transitions on
   EVERY card across the whole app. No per-group colors.
========================================================= */

export default function CatalogCard({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        group relative overflow-hidden
        p-4 rounded-xl border border-white/10 bg-white/5
        transition-all duration-300 active:scale-95
        hover:bg-white/10 hover:border-red-500
      "
    >
      {/* red hover glow */}
      <div className="absolute inset-0 bg-red-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative">{children}</div>

      {/* red bottom pulse line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-500 group-hover:w-full transition-all duration-300" />
    </Link>
  );
}
