"use client";

import Link from "next/link";
import SideDrawer from "./SideDrawer";
import { useTranslation } from "@/hooks/useTranslation";

type GlobalDrawerProps = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

const linkClass =
  "-mx-2 rounded-lg px-2 py-2.5 transition hover:bg-neutral-100 hover:text-neutral-900";

/** Nav menu only — the cart drawer lives in CartDrawer.tsx. */
export default function GlobalDrawer({
  menuOpen,
  setMenuOpen,
}: GlobalDrawerProps) {
  const { t } = useTranslation();
  const close = () => setMenuOpen(false);

  const sections: { heading: string; links: { href: string; label: string }[] }[] = [
    {
      heading: t("marketplace"),
      links: [
        { href: "/catalog/all", label: t("browseCatalog") },
        { href: "/cart", label: t("cart") },
        { href: "/track-order", label: "Track Order" },
      ],
    },
    { heading: t("company"), links: [{ href: "/about", label: t("about") }] },
    {
      heading: t("support"),
      links: [{ href: "/contact", label: t("contactSupport") }],
    },
    {
      heading: t("legalCenter"),
      links: [{ href: "/policies", label: t("policiesLegal") }],
    },
  ];

  return (
    <SideDrawer
      open={menuOpen}
      onClose={close}
      side="left"
      title={t("navTitle")}
      closeLabel="Close menu"
    >
      <nav className="flex-1 overflow-y-auto p-5">
        <div className="flex flex-col gap-6 text-neutral-700">
          {sections.map((section) => (
            <div key={section.heading}>
              <p className="mb-1 text-xs tracking-widest text-neutral-400">
                {section.heading}
              </p>
              <div className="flex flex-col">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={linkClass}
                    onClick={close}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </SideDrawer>
  );
}
