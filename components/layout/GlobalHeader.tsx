"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function GlobalHeader({
  setMenuOpen,
  setCartOpen,
}: any) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-300 ${
        scrolled
          ? "bg-black/70 backdrop-blur-xl py-3 border-b border-white/10"
          : "bg-transparent py-6"
      }`}
    >
      <div className="flex items-center justify-between px-6">

        {/* LOGO */}
        <Link href="/" className="font-bold text-lg tracking-widest">
          Drivora<span className="text-red-500">Parts</span>
        </Link>

        {/* CENTER TEXT */}
        <div className="hidden md:block text-xs text-gray-400 tracking-[0.3em]">
          ENGINEERING • PERFORMANCE • CONTROL
        </div>

        {/* ONLY CART + MENU */}
        <div className="flex items-center gap-6 text-sm">

          <button
            onClick={() => setCartOpen(true)}
            className="hover:scale-110 transition"
          >
            🛒
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="hover:scale-110 transition"
          >
            ☰
          </button>

        </div>

      </div>
    </header>
  );
}