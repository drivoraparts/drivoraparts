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
      className={`fixed left-0 top-0 z-[9999] w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/80 py-2 backdrop-blur-xl"
          : "bg-black/40 py-3 backdrop-blur-sm md:bg-transparent md:py-5"
      }`}
    >
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0 text-lg font-bold tracking-widest">
            Drivora<span className="text-red-500">Parts</span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-5 text-sm text-gray-300 lg:flex"
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

          <div className="hidden text-xs tracking-[0.25em] text-gray-500 md:block lg:hidden">
            {t("headerTagline")}
          </div>

          <div className="flex items-center gap-4 text-sm sm:gap-6">
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
              className="transition hover:scale-110 lg:hidden"
              aria-label="Open navigation menu"
            >
              ☰
            </button>
          </div>
        </div>

        <div className="mt-2 hidden items-center justify-center gap-3 border-t border-white/5 pt-2 text-[11px] text-gray-400 md:flex lg:hidden">
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
      </div>
    </header>
  );
}
