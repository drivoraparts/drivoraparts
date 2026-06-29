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
      {menuOpen && (
        <div
          className="fixed inset-0 z-[10001] bg-neutral-900/40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="relative z-[10002] h-full w-[320px] border-r border-neutral-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-6 text-lg font-bold text-neutral-900">{t("navTitle")}</h2>

            <div className="flex flex-col gap-6 text-neutral-700">
              <div>
                <p className="mb-2 text-xs tracking-widest text-neutral-400">{t("marketplace")}</p>
                <Link href="/catalog/all" className="transition hover:text-neutral-900">
                  {t("browseCatalog")}
                </Link>
              </div>

              <div>
                <p className="mb-2 text-xs tracking-widest text-neutral-400">{t("company")}</p>
                <Link href="/about" className="transition hover:text-neutral-900">
                  {t("about")}
                </Link>
              </div>

              <div>
                <p className="mb-2 text-xs tracking-widest text-neutral-400">{t("support")}</p>
                <Link href="/contact" className="transition hover:text-neutral-900">
                  {t("contactSupport")}
                </Link>
              </div>

              <div>
                <p className="mb-2 text-xs tracking-widest text-neutral-400">{t("legalCenter")}</p>
                <Link href="/policies" className="transition hover:text-neutral-900">
                  {t("policiesLegal")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div
          className="fixed inset-0 z-[9999] flex justify-end bg-neutral-900/40"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="h-full w-[320px] border-l border-neutral-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CartDrawer onClose={() => setCartOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
