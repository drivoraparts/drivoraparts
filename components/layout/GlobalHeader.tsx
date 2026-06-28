"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { COMPANY_SUPPORT_EMAIL } from "@/lib/content/company";
import { useTranslation } from "@/hooks/useTranslation";

const NAV_LINKS = [
  { href: "/catalog/all", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export default function GlobalHeader({
  setMenuOpen,
  setCartOpen,
}: {
  setMenuOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[9999] box-border w-full max-w-full overflow-x-clip transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/70 py-3 backdrop-blur-xl"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex w-full min-w-0 max-w-full items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="min-w-0 shrink text-base font-bold tracking-wide sm:text-lg sm:tracking-widest"
        >
          Drivora<span className="text-red-500">Parts</span>
        </Link>

        <div className="hidden flex-1 px-4 text-center text-xs tracking-[0.3em] text-gray-400 md:block">
          {t("headerTagline")}
        </div>

        <div className="flex shrink-0 items-center gap-3 pr-0.5 text-sm sm:gap-6">
          <nav
            aria-label="Primary"
            className="hidden items-center gap-5 text-sm text-gray-300 xl:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
            <a
              href={`mailto:${COMPANY_SUPPORT_EMAIL}`}
              className="text-red-400 transition hover:text-red-300"
            >
              {COMPANY_SUPPORT_EMAIL}
            </a>
          </nav>

          <button
            onClick={() => setCartOpen(true)}
            className="relative transition hover:scale-110"
            aria-label="Open cart"
          >
            🛒
            {mounted && itemCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold">
                {itemCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="transition hover:scale-110 xl:hidden"
            aria-label="Open navigation menu"
          >
            ☰
          </button>
        </div>
      </div>

      <div className="mt-2 hidden items-center justify-center gap-3 px-4 text-[11px] text-gray-400 sm:px-6 md:flex xl:hidden">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="transition hover:text-white">
            {link.label}
          </Link>
        ))}
        <span aria-hidden="true">·</span>
        <a href={`mailto:${COMPANY_SUPPORT_EMAIL}`} className="text-red-400 hover:text-red-300">
          {COMPANY_SUPPORT_EMAIL}
        </a>
      </div>
    </header>
  );
}
