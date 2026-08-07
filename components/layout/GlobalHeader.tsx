"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { COMPANY_SUPPORT_EMAIL } from "@/lib/content/company";
import { useTranslation } from "@/hooks/useTranslation";
import { WISHLIST_CHANGE_EVENT, readWishlist } from "@/lib/wishlist";

const NAV_LINKS = [
  { href: "/catalog/all", label: "Shop" },
  { href: "/cart", label: "Cart" },
  { href: "/track-order", label: "Track Order" },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const [wishlistCount, setWishlistCount] = useState(0);
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setWishlistCount(readWishlist().length);

    const onWishlistChange = () => setWishlistCount(readWishlist().length);
    window.addEventListener(WISHLIST_CHANGE_EVENT, onWishlistChange);
    return () => window.removeEventListener(WISHLIST_CHANGE_EVENT, onWishlistChange);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    setSearchOpen(false);
    router.push(q ? `/catalog/all?q=${encodeURIComponent(q)}` : "/catalog/all");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[9999] box-border w-full max-w-full overflow-x-hidden border-b transition-all duration-300 ${
        scrolled
          ? "border-neutral-300 bg-[#e5e7eb]/95 py-2.5 shadow-md backdrop-blur-xl"
          : "border-neutral-300 bg-[#e5e7eb] py-4 shadow-sm"
      }`}
    >
      <div className="mx-auto flex w-full min-w-0 max-w-full items-center justify-between gap-2 px-4 text-neutral-900 sm:px-6">
        <Link
          href="/"
          className="min-w-0 shrink text-base font-bold tracking-wide text-neutral-900 sm:text-lg sm:tracking-widest"
        >
          Drivora<span className="text-red-600">Parts</span>
        </Link>

        <div className="hidden flex-1 px-4 text-center text-xs tracking-[0.3em] text-neutral-500 md:block">
          {t("headerTagline")}
        </div>

        <div className="flex shrink-0 items-center gap-3 pr-0.5 text-sm sm:gap-6">
          <nav
            aria-label="Primary"
            className="hidden items-center gap-5 text-sm text-neutral-600 xl:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-neutral-900"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`mailto:${COMPANY_SUPPORT_EMAIL}`}
              className="text-red-600 transition hover:text-red-700"
            >
              {COMPANY_SUPPORT_EMAIL}
            </a>
          </nav>

          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="text-neutral-800 transition hover:scale-110"
            aria-label="Search products"
            aria-expanded={searchOpen}
          >
            🔍
          </button>

          <Link
            href="/wishlist"
            className="relative text-neutral-800 transition hover:scale-110"
            aria-label="View wishlist"
          >
            ♡
            {mounted && wishlistCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                {wishlistCount}
              </span>
            ) : null}
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            className="relative text-neutral-800 transition hover:scale-110"
            aria-label="Open cart"
          >
            🛒
            {mounted && itemCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="text-neutral-800 transition hover:scale-110 xl:hidden"
            aria-label="Open navigation menu"
          >
            ☰
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-neutral-300 bg-[#e5e7eb] px-4 py-3 sm:px-6">
          <form
            onSubmit={submitSearch}
            role="search"
            className="mx-auto flex max-w-2xl items-center gap-2"
          >
            <div className="relative w-full">
              <input
                ref={searchInputRef}
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search parts, brands, categories…"
                aria-label="Search products"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 pr-8 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              {searchValue ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue("");
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-700"
                >
                  ✕
                </button>
              ) : null}
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
            >
              Search
            </button>
          </form>
        </div>
      ) : null}

      <div className="mt-2 hidden items-center justify-center gap-3 px-4 text-[11px] text-neutral-500 sm:px-6 md:flex xl:hidden">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="transition hover:text-neutral-900">
            {link.label}
          </Link>
        ))}
        <span aria-hidden="true">·</span>
        <a href={`mailto:${COMPANY_SUPPORT_EMAIL}`} className="text-red-600 hover:text-red-700">
          {COMPANY_SUPPORT_EMAIL}
        </a>
      </div>
    </header>
  );
}
