"use client";

import Link from "next/link";

type GlobalDrawerProps = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

export default function GlobalDrawer({
  menuOpen,
  setMenuOpen,
  cartOpen,
  setCartOpen,
}: GlobalDrawerProps) {
  return (
    <>
      {/* MENU DRAWER */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-[10001]"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="w-[320px] h-full bg-[#111827] p-5 relative z-[10002]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-6 text-white">
              Navigation
            </h2>

            <div className="flex flex-col gap-6 text-gray-300">
              {/* MARKETPLACE */}
              <div>
                <p className="text-xs text-gray-500 mb-2 tracking-widest">
                  MARKETPLACE
                </p>
                <Link
                  href="/catalog"
                  className="hover:text-white transition"
                >
                  Browse Catalog
                </Link>
              </div>

              {/* COMPANY */}
              <div>
                <p className="text-xs text-gray-500 mb-2 tracking-widest">
                  COMPANY
                </p>
                <Link
                  href="/about"
                  className="hover:text-white transition"
                >
                  About DrivoraParts
                </Link>
              </div>

              {/* SUPPORT */}
              <div>
                <p className="text-xs text-gray-500 mb-2 tracking-widest">
                  SUPPORT
                </p>
                <Link
                  href="/contact"
                  className="hover:text-white transition"
                >
                  Contact Support
                </Link>
              </div>

              {/* LEGAL */}
              <div>
                <p className="text-xs text-gray-500 mb-2 tracking-widest">
                  LEGAL CENTER
                </p>
                <Link
                  href="/policies"
                  className="hover:text-white transition"
                >
                  Policies & Legal
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-[9999] flex justify-end"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="w-[320px] h-full bg-[#111827] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Cart</h2>

            <p className="text-gray-400">
              Cart is empty (checkout system coming next)
            </p>
          </div>
        </div>
      )}
    </>
  );
}