"use client";

import Link from "next/link";
import CartDrawer from "./CartDrawer";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();

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
              {t("navTitle")}
            </h2>

            <div className="flex flex-col gap-6 text-gray-300">
              <div>
                <p className="text-xs text-gray-500 mb-2 tracking-widest">
                  {t("marketplace")}
                </p>
                <Link
                  href="/catalog"
                  className="hover:text-white transition"
                >
                  {t("browseCatalog")}
                </Link>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2 tracking-widest">
                  {t("company")}
                </p>
                <Link
                  href="/about"
                  className="hover:text-white transition"
                >
                  {t("about")}
                </Link>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2 tracking-widest">
                  {t("support")}
                </p>
                <Link
                  href="/contact"
                  className="hover:text-white transition"
                >
                  {t("contactSupport")}
                </Link>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2 tracking-widest">
                  {t("legalCenter")}
                </p>
                <Link
                  href="/policies"
                  className="hover:text-white transition"
                >
                  {t("policiesLegal")}
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
            className="w-[320px] h-full bg-[#111827]"
            onClick={(e) => e.stopPropagation()}
          >
            <CartDrawer onClose={() => setCartOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}