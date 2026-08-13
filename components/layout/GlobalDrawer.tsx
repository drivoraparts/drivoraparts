"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

type GlobalDrawerProps = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

/** Nav menu only — the cart drawer lives in CartDrawer.tsx. */
export default function GlobalDrawer({
  menuOpen,
  setMenuOpen,
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
                <div className="flex flex-col gap-2">
                  <Link
                    href="/catalog/all"
                    className="transition hover:text-neutral-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("browseCatalog")}
                  </Link>
                  <Link href="/cart" className="transition hover:text-neutral-900" onClick={() => setMenuOpen(false)}>
                    {t("cart")}
                  </Link>
                  <Link
                    href="/track-order"
                    className="transition hover:text-neutral-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    Track Order
                  </Link>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs tracking-widest text-neutral-400">{t("company")}</p>
                <Link
                  href="/about"
                  className="transition hover:text-neutral-900"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("about")}
                </Link>
              </div>

              <div>
                <p className="mb-2 text-xs tracking-widest text-neutral-400">{t("support")}</p>
                <Link
                  href="/contact"
                  className="transition hover:text-neutral-900"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("contactSupport")}
                </Link>
              </div>

              <div>
                <p className="mb-2 text-xs tracking-widest text-neutral-400">{t("legalCenter")}</p>
                <Link
                  href="/policies"
                  className="transition hover:text-neutral-900"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("policiesLegal")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
