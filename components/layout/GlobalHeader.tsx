"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { useTranslation } from "@/hooks/useTranslation";

import toyotaGenuine from "@/lib/inventory/data/toyota-genuine.json";

/*
 * Toyota storefront navigation. "Toyota Genuine Parts" appears only once at
 * least one listing is verified as Genuine (lib/inventory/data/
 * toyota-genuine.json): a nav item opening onto an empty or mislabelled page
 * is worse than none.
 */
const HAS_VERIFIED_GENUINE = toyotaGenuine.verified.length > 0;

export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  ...(HAS_VERIFIED_GENUINE
    ? [{ href: "/catalog/all?q=Toyota%20Genuine", label: "Toyota Genuine Parts" }]
    : []),
  { href: "/catalog/all", label: "Shop All Toyota Parts" },
  { href: "/catalog/usa", label: "Shop by Vehicle" },
  { href: "/catalog/all?category=engine,transmission", label: "Engines & Transmissions" },
  { href: "/contact", label: "Support" },
];

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
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
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
          ? "border-border bg-chrome/95 py-2.5 shadow-md backdrop-blur-xl"
          : "border-border bg-chrome py-4 shadow-sm"
      }`}
    >
      <div className="mx-auto flex w-full min-w-0 max-w-full items-center justify-between gap-2 px-4 text-neutral-900 sm:px-6">
        <Link
          href="/"
          className="min-w-0 shrink text-base font-extrabold uppercase tracking-[0.14em] text-foreground sm:text-lg"
        >
          Drivora<span className="text-accent">Parts</span>
        </Link>

        <div className="hidden flex-1 px-4 text-center text-xs tracking-[0.3em] text-muted md:block">
          {t("headerTagline")}
        </div>

        <div className="flex shrink-0 items-center gap-3 pr-0.5 text-sm sm:gap-6">
          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 text-[13px] font-semibold text-foreground xl:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground transition hover:bg-surface-muted"
            aria-label="Search Toyota parts"
            aria-expanded={searchOpen}
          >
            <Icon path="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
          </button>

          {/* No customer login exists -- checkout is guest checkout -- so the
              account icon opens order tracking, which is what a returning
              customer comes back for. */}
          <Link
            href="/track-order"
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground transition hover:bg-surface-muted"
            aria-label="Your orders"
            title="Your orders"
          >
            <Icon path="M20 21a8 8 0 1 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-md text-foreground transition hover:bg-surface-muted"
            aria-label="Open cart"
          >
            <Icon path="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
            {mounted && itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground transition hover:bg-surface-muted xl:hidden"
            aria-label="Open navigation menu"
          >
            <Icon path="M4 6h16M4 12h16M4 18h16" />
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-border bg-chrome px-4 py-3 sm:px-6">
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
                placeholder="Search Toyota parts, models, part numbers…"
                aria-label="Search Toyota parts"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 pr-8 text-sm text-neutral-900 placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {searchValue ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue("");
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted transition hover:text-neutral-700"
                >
                  ✕
                </button>
              ) : null}
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition hover:bg-accent-hover"
            >
              Search
            </button>
          </form>
        </div>
      ) : null}

      <div className="mt-2 hidden items-center justify-center gap-4 px-4 text-xs font-semibold text-foreground sm:px-6 md:flex xl:hidden">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="transition hover:text-accent">
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
